import { GraduationCap, Target, Award } from "lucide-react";
import BackButton from "@/components/navigation/BackButton";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <BackButton text="Back to Home" />

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center mx-auto text-[#1e3a8a]">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a8a]">
            About KRL Academy
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            KRL Academy is a premier digital learning institution dedicated to
            empowering the next generation of Chartered Accountants in Nigeria
            and West Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
            <Target className="w-8 h-8 text-[#f59e0b]" />
            <h2 className="text-xl font-bold text-[#1e3a8a]">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              To provide accessible, high-quality, and structured preparation
              materials for ICAN and ATSWA professional examinations. We bridge
              the gap between complex accounting concepts and exam success
              through expert-led video lectures, pathfinders, and intelligent
              practice engines.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
            <Award className="w-8 h-8 text-[#f59e0b]" />
            <h2 className="text-xl font-bold text-[#1e3a8a]">Why Choose Us?</h2>
            <p className="text-slate-600 leading-relaxed">
              Unlike traditional physical tutorials, our platform adapts to your
              schedule. With comprehensive analytics tracking your strong and
              weak subjects, live classes, and a vast library of past questions,
              we ensure you step into the exam hall with absolute confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
