import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import AnnouncementBanner from "@/components/navigation/AnnouncementBanner";
import { getLatestAnnouncement } from "@/lib/actions/announcements";
import "./globals.css";

export const metadata = {
  title: "CA Prep Academy | ICAN Exam Preparation Platform",
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
      <body className="bg-slate-950 text-white min-h-screen flex flex-col antialiased">
        <AnnouncementBanner announcement={announcement} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
