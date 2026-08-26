"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/gemas/Navbar";
import { Footer } from "@/components/gemas/Footer";
import { HomeView } from "@/components/views/HomeView";
import { CekStatusGiziView } from "@/components/views/CekStatusGiziView";
import { MpasiView } from "@/components/views/MpasiView";
import { MakanAnakView } from "@/components/views/MakanAnakView";
import { VideoEdukasiView } from "@/components/views/VideoEdukasiView";
import { HubungiAhliView } from "@/components/views/HubungiAhliView";
import { TentangView } from "@/components/views/TentangView";
import { AdminAnalyticsView } from "@/components/views/AdminAnalyticsView";
import { useGemasStore } from "@/lib/gemas/store";

export default function Home() {
  const { currentView, setView } = useGemasStore();

  // Secret admin access triggers:
  // 1. Keyboard shortcut: Ctrl + Shift + A
  // 2. URL hash: #admin-gemas-tersembunyi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setView("admin-analytics");
      }
    };

    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#admin-gemas-tersembunyi" || hash === "#admin-gemas" || hash === "#admin") {
        setView("admin-analytics");
        // Clear hash to keep it secret
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", checkHash);
    };
  }, [setView]);

  const isAdminView = currentView === "admin-analytics";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hide Navbar & Footer on admin view for secrecy */}
      {!isAdminView && <Navbar />}
      <main className="flex-1">
        {currentView === "home" && <HomeView />}
        {currentView === "cek-status-gizi" && <CekStatusGiziView />}
        {currentView === "mp-asi" && <MpasiView />}
        {currentView === "makan-anak" && <MakanAnakView />}
        {currentView === "video-edukasi" && <VideoEdukasiView />}
        {currentView === "hubungi-ahli" && <HubungiAhliView />}
        {currentView === "tentang" && <TentangView />}
        {currentView === "admin-analytics" && <AdminAnalyticsView />}
      </main>
      {!isAdminView && <Footer />}
    </div>
  );
}
