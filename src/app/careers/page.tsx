"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitTutorApplication } from "@/lib/actions/careers";
import { Briefcase, Upload, Loader2, CheckCircle } from "lucide-react";
import BackButton from "@/components/navigation/BackButton";
import toast from "react-hot-toast";

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

    setIsUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `resumes/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload CV to Supabase
    const { error: uploadError } = await supabase.storage
      .from("ican-resources")
      .upload(fileName, file, { upsert: false });

    if (uploadError) {
      setIsUploading(false);
      return toast.error("Failed to upload CV. Please try again.");
    }

    const { data: publicUrlData } = supabase.storage
      .from("ican-resources")
      .getPublicUrl(fileName);

    formData.delete("cv_file");
    formData.append("cv_url", publicUrlData.publicUrl);
    setIsUploading(false);

    // Save to Database
    startTransition(async () => {
      const res = await submitTutorApplication(formData);
      if (res.error) toast.error(res.error);
      else setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg text-center shadow-xl space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold text-ink">Application Received!</h1>
          <p className="text-slate-600">
            Thank you for your interest in joining KRL Academy. Our academic
            directors will review your CV and reach out to you shortly.
          </p>
          <BackButton text="Return to Homepage" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <BackButton text="Back to Home" />

        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
            Teach at KRL Academy
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Join our roster of elite Chartered Accountants and help thousands of
            students pass their ICAN and ATSWA exams.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-ink outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-ink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-ink outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brief Cover Letter / Experience
            </label>
            <textarea
              name="cover_letter"
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-ink outline-none"
              placeholder="Tell us about your ICAN qualifications and teaching experience..."
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Upload CV (PDF) *
            </label>
            <input
              type="file"
              name="cv_file"
              accept=".pdf,.doc,.docx"
              required
              className="w-full p-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ink file:text-white cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isUploading}
            className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
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
