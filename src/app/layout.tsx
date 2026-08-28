import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import AnnouncementBanner from "@/components/navigation/AnnouncementBanner";
import { getLatestAnnouncement } from "@/lib/actions/announcements";
import "./globals.css";

export const metadata = {
  title: "KRL Academy | ICAN Exam Preparation Platform",
  description:
    "Comprehensive study materials, pathfinders, and revision resources for ICAN students.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const announcement = await getLatestAnnouncement();

  return (
    <html lang="en">
      {/* 1. Updated min-h-screen -> min-h-dvh */}
      <body className="bg-slate-50 text-slate-900 min-h-dvh flex flex-col antialiased">
        <AnnouncementBanner announcement={announcement} />
        <Navbar />
        {/* 2. Added flex flex-col flex-1 */}
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
