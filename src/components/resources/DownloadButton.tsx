"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Props {
  fileUrl: string;
  fileName: string;
}

export default function DownloadButton({ fileUrl, fileName }: Props) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    try {
      setDownloading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
      window.open(fileUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Downloading PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Download Document PDF</span>
        </>
      )}
    </button>
  );
}
