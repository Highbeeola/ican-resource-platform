import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import AnnouncementBanner from "@/components/navigation/AnnouncementBanner";
import { Toaster } from "react-hot-toast";
import { getLatestAnnouncement } from "@/lib/actions/announcements";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

const heading = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

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
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-slate-50 text-slate-900 min-h-dvh flex flex-col antialiased font-sans">
        <AnnouncementBanner announcement={announcement} />
        <Toaster position="top-center" />
        <Navbar />
        {/* Added flex flex-col flex-1 */}
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
