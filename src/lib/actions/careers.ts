"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, esc } from "@/lib/email";

const CV_BUCKET = "tutor-cvs"; // PRIVATE bucket (see setup notes)
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

const CV_PATH_PATTERN = /^resumes\/[0-9a-f-]{36}\.(pdf|doc|docx)$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/* Step 1: the browser asks permission to upload a CV                  */
/* The server checks type and size, then hands back a one-time upload  */
/* link for a private bucket. No public upload policy is needed.       */
/* ------------------------------------------------------------------ */
export async function createCvUploadUrl(input: {
  fileName: string;
  fileType: string;
  fileSize: number;
}): Promise<{ error: string } | { path: string; token: string }> {
  const ext = ALLOWED_TYPES[input.fileType];
  if (!ext) return { error: "Please upload a PDF, DOC or DOCX file." };

  if (!(input.fileSize > 0) || input.fileSize > MAX_CV_BYTES) {
    return { error: "Your CV must be smaller than 5 MB." };
  }

  const admin = createAdminClient();
  const path = `resumes/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await admin.storage
    .from(CV_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createSignedUploadUrl failed:", error);
    return { error: "Could not prepare the upload. Please try again." };
  }

  return { path: data.path, token: data.token };
}

/* ------------------------------------------------------------------ */
/* Step 2: save the application (all checks happen on the server)      */
/* ------------------------------------------------------------------ */
export async function submitTutorApplication(formData: FormData) {
  // Honeypot: real people never fill this hidden field. Pretend it worked.
  if (String(formData.get("website") ?? "").trim()) {
    return { success: true };
  }

  const get = (key: string) => String(formData.get(key) ?? "").trim();

  const full_name = get("full_name");
  const email = get("email").toLowerCase();
  const phone = get("phone");
  const qualification = get("qualification");
  const subjects = get("subjects");
  const experience = get("experience");
  const cover_letter = get("cover_letter");
  const heard_from = get("heard_from");
  const cv_path = get("cv_path");

  if (full_name.length < 2 || full_name.length > 120) {
    return { error: "Please enter your full name." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Please enter a valid email address." };
  }
  if (phone.replace(/\D/g, "").length < 7 || phone.length > 30) {
    return { error: "Please enter a valid phone number." };
  }
  if (!qualification) {
    return { error: "Please select your qualification." };
  }
  if (subjects.length < 2 || subjects.length > 300) {
    return { error: "Please tell us which subjects you can teach." };
  }
  if (cover_letter.length > 3000) {
    return { error: "Your cover letter is too long (3000 characters max)." };
  }
  if (!CV_PATH_PATTERN.test(cv_path)) {
    return { error: "Your CV upload is missing. Please try again." };
  }

  const admin = createAdminClient();

  // Make sure the CV really exists in the private bucket
  const fileName = cv_path.split("/")[1];
  const { data: found } = await admin.storage
    .from(CV_BUCKET)
    .list("resumes", { search: fileName, limit: 1 });

  if (!found?.some((f) => f.name === fileName)) {
    return { error: "We couldn't find your uploaded CV. Please try again." };
  }

  const { error } = await admin.from("tutor_applications").insert({
    full_name,
    email,
    phone,
    qualification,
    subjects,
    experience: experience || null,
    cover_letter: cover_letter || null,
    heard_from: heard_from || null,
    cv_path,
  });

  if (error) {
    console.error("tutor_applications insert failed:", error);
    return { error: "Something went wrong. Please try again." };
  }

  // Emails never block the application. If email isn't set up yet, skip.
  try {
    const notifyTo = process.env.APPLICATIONS_NOTIFY_EMAIL;

    if (notifyTo) {
      const { data: signed } = await admin.storage
        .from(CV_BUCKET)
        .createSignedUrl(cv_path, 60 * 60 * 24 * 7); // link valid 7 days

      await sendEmail({
        to: notifyTo,
        replyTo: email, // replying goes straight to the applicant
        subject: `New application: ${full_name}`,
        html: `
          <h2>New subject expert / lecturer application</h2>
          <p><strong>Name:</strong> ${esc(full_name)}<br/>
          <strong>Email:</strong> ${esc(email)}<br/>
          <strong>Phone:</strong> ${esc(phone)}<br/>
          <strong>Qualification:</strong> ${esc(qualification)}<br/>
          <strong>Subjects:</strong> ${esc(subjects)}<br/>
          <strong>Experience:</strong> ${esc(experience || "Not given")}<br/>
          <strong>Heard about us from:</strong> ${esc(heard_from || "Not given")}</p>
          ${
            cover_letter
              ? `<p><strong>Cover letter:</strong><br/>${esc(cover_letter).replace(/\n/g, "<br/>")}</p>`
              : ""
          }
          ${
            signed?.signedUrl
              ? `<p><a href="${signed.signedUrl}">Download CV</a> (link expires in 7 days)</p>`
              : ""
          }
          <p>You can reply to this email to reach the applicant directly.</p>
        `,
      });
    }

    // Confirmation to the applicant
    await sendEmail({
      to: email,
      subject: "We received your application to teach at KRL Academy",
      html: `
        <p>Hello ${esc(full_name)},</p>
        <p>Thank you for applying to teach at KRL Academy. We have received your application and CV, and our team will review it and contact you if there is a fit.</p>
        <p>Regards,<br/>KRL Academy</p>
      `,
    });
  } catch (e) {
    console.error("Application emails failed:", e);
  }

  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Admin: list applications with short-lived CV links                  */
/* ------------------------------------------------------------------ */
export async function getTutorApplications() {
  const supabase = await createClient();

  // Only Super Admins should see the applications!
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_super_admin) return [];

  const admin = createAdminClient();

  const { data } = await admin
    .from("tutor_applications")
    .select("*")
    .order("created_at", { ascending: false });

  const applications = data || [];

  // One-hour signed links for CVs stored in the private bucket
  const paths = applications
    .map((a) => a.cv_path)
    .filter((p): p is string => !!p);

  const linkByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await admin.storage
      .from(CV_BUCKET)
      .createSignedUrls(paths, 60 * 60);

    signed?.forEach((item) => {
      if (item.path && item.signedUrl)
        linkByPath.set(item.path, item.signedUrl);
    });
  }

  // The admin tab already reads `cv_url`, so fill it with the signed link.
  // (Old test rows that only have a cv_url keep it as it was.)
  return applications.map((a) => ({
    ...a,
    cv_url: a.cv_path ? (linkByPath.get(a.cv_path) ?? null) : a.cv_url,
  }));
}
