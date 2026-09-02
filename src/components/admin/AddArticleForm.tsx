"use client";

import { useState, useTransition, useRef, useMemo, forwardRef } from "react";
import dynamic from "next/dynamic";
import imageCompression from "browser-image-compression";
import { Level, Subject } from "@/types";
import { createArticleLesson } from "@/lib/actions/articles";
import { createClient } from "@/lib/supabase/client";
import { Edit3, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import "react-quill-new/dist/quill.snow.css";

// Dynamic import for ReactQuill supporting forwardRef
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return forwardRef((props: any, ref) => <RQ ref={ref} {...props} />);
  },
  {
    ssr: false,
    loading: () => <p className="p-4 text-slate-400">Loading editor...</p>,
  },
);

interface Props {
  levels: Level[];
  subjects: Subject[];
}

export default function AddArticleForm({ levels, subjects }: Props) {
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const quillRef = useRef<any>(null);

  const filteredSubjects = subjects.filter(
    (sub) => sub.level_id === selectedLevelId,
  );

  // COMPRESSING MULTI-IMAGE HANDLER
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/png, image/jpeg, image/webp");
    input.setAttribute("multiple", "true");
    input.click();

    input.onchange = async () => {
      const files = input.files ? Array.from(input.files) : [];
      if (files.length === 0) return;

      setIsImageUploading(true);
      const supabase = createClient();
      const editor = quillRef.current?.getEditor();

      const compressionOptions = {
        maxSizeMB: 0.8, // Target size ~800KB max
        maxWidthOrHeight: 1600, // Resize 4K photos down to a max width/height of 1600px
        useWebWorker: true, // Run in background thread to keep UI smooth
      };

      try {
        for (const file of files) {
          // 1. Compress Image Client-Side
          let fileToUpload: File | Blob = file;
          try {
            fileToUpload = await imageCompression(file, compressionOptions);
          } catch (compErr) {
            console.warn(
              `Compression failed for ${file.name}, uploading original:`,
              compErr,
            );
          }

          // 2. Upload to Supabase Storage
          const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const fileName = `lesson-images/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("ican-resources")
            .upload(fileName, fileToUpload, { upsert: false });

          if (uploadError) {
            alert(`Upload failed for ${file.name}: ` + uploadError.message);
            continue;
          }

          // 3. Get Public URL & Insert into Editor
          const { data } = supabase.storage
            .from("ican-resources")
            .getPublicUrl(fileName);

          if (editor) {
            const range = editor.getSelection(true);
            const index = range ? range.index : editor.getLength();
            editor.insertEmbed(index, "image", data.publicUrl);
            editor.insertText(index + 1, "\n");
            editor.setSelection(index + 2);
          }
        }
      } catch (error) {
        console.error("Image processing error:", error);
        alert("An error occurred while processing your images.");
      } finally {
        setIsImageUploading(false);
      }
    };
  };

  // REGISTER IMAGE RESIZE MODULE & SETUP TOOLBAR
  const modules = useMemo(() => {
    if (typeof window !== "undefined") {
      const { Quill } = require("react-quill-new");
      const ImageResize =
        require("quill-image-resize-module-react").default ||
        require("quill-image-resize-module-react");
      Quill.register("modules/imageResize", ImageResize);
    }

    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      imageResize: {
        parchment:
          typeof window !== "undefined"
            ? require("react-quill-new").Quill.import("parchment")
            : null,
        modules: ["Resize", "DisplaySize", "Toolbar"],
      },
    };
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createArticleLesson(formData, content);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({
          type: "success",
          text: "Text Lesson published successfully!",
        });
        form.reset();
        setContent("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-slate-900"
    >
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-bold text-[#1e3a8a] text-base flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-[#f59e0b]" />
          <span>Write a Text Lesson</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Type or paste lecture notes directly into the platform.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Lesson Title *
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Chapter 1: Introduction to Accounting"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Level *
          </label>
          <select
            name="level_id"
            required
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none"
          >
            <option value="">Select Level</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject *
          </label>
          <select
            name="subject_id"
            required
            disabled={!selectedLevelId}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none disabled:opacity-50"
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Category *
          </label>
          <select
            name="resource_type"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none capitalize"
          >
            <option value="notes">Lecture Notes</option>
            <option value="study_text">Study Text</option>
          </select>
        </div>
      </div>

      {/* RICH TEXT EDITOR WRAPPER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 relative">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Lesson Content *
          {isImageUploading && (
            <span className="text-[#f59e0b] ml-2 animate-pulse">
              Compressing & uploading image(s)...
            </span>
          )}
        </label>

        <div className="quill-editor-wrapper">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="border-none"
          />
        </div>
      </div>

      {/* AUTO-EXPAND & RESPONSIVE STYLING */}
      <style jsx global>{`
        .quill-editor-wrapper .ql-container {
          min-height: 250px;
          height: auto;
          font-size: 1rem;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 250px;
          height: auto;
          overflow-y: visible;
        }
        .quill-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          display: inline-block;
          border-radius: 0.5rem;
        }
      `}</style>

      <button
        type="submit"
        disabled={isPending || isImageUploading}
        className="w-full py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          "Publish Lesson"
        )}
      </button>
    </form>
  );
}
