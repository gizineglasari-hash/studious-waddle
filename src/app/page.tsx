"use client";

import { Navbar } from "@/components/gemas/Navbar";
import { Footer } from "@/components/gemas/Footer";
import { HomeView } from "@/components/views/HomeView";
import { CekStatusGiziView } from "@/components/views/CekStatusGiziView";
import { MpasiView } from "@/components/views/MpasiView";
import { MakanAnakView } from "@/components/views/MakanAnakView";
import { VideoEdukasiView } from "@/components/views/VideoEdukasiView";
import { HubungiAhliView } from "@/components/views/HubungiAhliView";
import { TentangView } from "@/components/views/TentangView";
import { useGemasStore } from "@/lib/gemas/store";

export default function Home() {
  const { currentView } = useGemasStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {currentView === "home" && <HomeView />}
        {currentView === "cek-status-gizi" && <CekStatusGiziView />}
        {currentView === "mp-asi" && <MpasiView />}
        {currentView === "makan-anak" && <MakanAnakView />}
        {currentView === "video-edukasi" && <VideoEdukasiView />}
        {currentView === "hubungi-ahli" && <HubungiAhliView />}
        {currentView === "tentang" && <TentangView />}
      </main>
      <Footer />
    </div>
  );
}
