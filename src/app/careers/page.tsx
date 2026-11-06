"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createCvUploadUrl,
  submitTutorApplication,
} from "@/lib/actions/careers";
import { Briefcase, Loader2, CheckCircle } from "lucide-react";
import BackButton from "@/components/navigation/BackButton";
import toast from "react-hot-toast";

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const inputClass =
  "w-full px-4 py-3 bg-white border border-line rounded-md text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink/25 focus:border-ink";
const labelClass = "block text-xs font-semibold text-ink mb-1.5";

export default function CareersPage() {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("cv_file") as File;

    if (!file || file.size === 0) {
      return toast.error("Please attach your CV.");
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return toast.error("Please upload a PDF, DOC or DOCX file.");
    }
    if (file.size > MAX_CV_BYTES) {
      return toast.error("Your CV must be smaller than 5 MB.");
    }

    setIsUploading(true);
    try {
      // 1. Ask the server for a one-time upload link (private bucket)
      const prep = await createCvUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      if ("error" in prep) {
        toast.error(prep.error);
        return;
      }

      // 2. Upload the CV straight to that link
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("tutor-cvs")
        .uploadToSignedUrl(prep.path, prep.token, file);

      if (uploadError) {
        toast.error("Failed to upload CV. Please try again.");
        return;
      }

      // 3. Send the file's path (not a link) with the rest of the form
      formData.delete("cv_file");
      formData.append("cv_path", prep.path);
    } finally {
      setIsUploading(false);
    }

    startTransition(async () => {
      const res = await submitTutorApplication(formData);
      if (res?.error) toast.error(res.error);
      else setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="bg-white border border-line rounded-lg p-10 max-w-lg text-center space-y-4">
          <CheckCircle className="w-14 h-14 text-accent mx-auto" />
          <h1 className="text-2xl font-semibold text-ink">
            Application received
          </h1>
          <p className="text-muted leading-relaxed">
            Thank you for your interest in teaching at KRL Academy. We have sent
            a confirmation to your email, and our team will review your CV and
            contact you if there is a fit.
          </p>
          <div className="pt-2 flex justify-center">
            <BackButton text="Return to Homepage" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper px-4 sm:px-6 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <BackButton text="Back to Home" />

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
            Join our team
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink">
            Teach at KRL Academy
          </h1>
          <p className="text-muted leading-relaxed max-w-2xl">
            We&apos;re looking for subject experts and lecturers to help
            students prepare for their ICAN and ATSWA exams. Tell us about your
            qualifications and the subjects you can teach.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-line rounded-lg p-6 sm:p-8 space-y-6"
        >
          {/* Honeypot: hidden from people, bots tend to fill it */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className={labelClass}>
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                required
                maxLength={120}
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                maxLength={30}
                autoComplete="tel"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="qualification" className={labelClass}>
                Professional Qualification *
              </label>
              <select
                id="qualification"
                name="qualification"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="ICAN (ACA / FCA)">ICAN (ACA / FCA)</option>
                <option value="ATSWA">ATSWA</option>
                <option value="Other accounting qualification">
                  Other accounting qualification
                </option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="subjects" className={labelClass}>
              Subjects You Can Teach *
            </label>
            <input
              id="subjects"
              type="text"
              name="subjects"
              required
              maxLength={300}
              placeholder="e.g. Financial Reporting, Taxation"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="experience" className={labelClass}>
                Teaching Experience
              </label>
              <select
                id="experience"
                name="experience"
                defaultValue=""
                className={inputClass}
              >
                <option value="">Select one</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1 to 3 years">1 to 3 years</option>
                <option value="4 to 7 years">4 to 7 years</option>
                <option value="8 years or more">8 years or more</option>
              </select>
            </div>
            <div>
              <label htmlFor="heard_from" className={labelClass}>
                How did you hear about us?
              </label>
              <select
                id="heard_from"
                name="heard_from"
                defaultValue=""
                className={inputClass}
              >
                <option value="">Select one</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="X (Twitter)">X (Twitter)</option>
                <option value="A friend or colleague">
                  A friend or colleague
                </option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="cover_letter" className={labelClass}>
              Brief Cover Letter / Experience
            </label>
            <textarea
              id="cover_letter"
              name="cover_letter"
              rows={4}
              maxLength={3000}
              className={inputClass}
              placeholder="Tell us about your qualifications and teaching experience..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="cv_file" className={labelClass}>
              Upload CV (PDF, DOC or DOCX, max 5 MB) *
            </label>
            <input
              id="cv_file"
              type="file"
              name="cv_file"
              accept=".pdf,.doc,.docx"
              required
              className="w-full p-2 bg-white border border-line border-dashed rounded-md text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-white cursor-pointer"
            />
          </div>

          <p className="text-xs text-muted leading-relaxed">
            We use your details only to review your application. Your CV is
            stored privately and is seen only by the KRL Academy team.
          </p>

          <button
            type="submit"
            disabled={isPending || isUploading}
            className="w-full py-3.5 bg-ink hover:bg-ink/90 text-white font-semibold rounded-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isPending || isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Briefcase className="w-5 h-5" />
            )}
            <span>
              {isUploading ? "Uploading CV..." : "Submit Application"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
