"use client";

import { useState, useTransition } from "react";
import { submitContactMessage } from "@/lib/actions/contact";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import BackButton from "@/components/navigation/BackButton";

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await submitContactMessage(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Message sent! Our team will get back to you shortly.");
        form.reset();
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <BackButton text="Back" />

        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a8a]">
            Get in Touch
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Have questions about our ICAN or ATSWA courses? Our support team is
            here to help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CONTACT INFO */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Email Support</h3>
                <p className="text-sm text-slate-500 mt-1">
                  support@krlacademy.com
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-[#f59e0b] rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Phone & WhatsApp</h3>
                <p className="text-sm text-slate-500 mt-1">
                  +234 (0) 800 000 0000
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Office Location</h3>
                <p className="text-sm text-slate-500 mt-1">Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          {/* MESSAGE FORM */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#1e3a8a] mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
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
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#f59e0b] hover:bg-[#d97706] active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
