"use client";

import { useEffect, useState } from "react";
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
import { AnalyticsPengunjungView } from "@/components/views/admin/AnalyticsPengunjungView";
import { EditWebsiteView } from "@/components/views/admin/EditWebsiteView";
import { AdminUsersView } from "@/components/views/admin/AdminUsersView";
import { ErrorBoundary } from "@/components/gemas/ErrorBoundary";
import { LoginView } from "@/components/views/auth/LoginView";
import { UserDashboardView } from "@/components/views/auth/UserDashboardView";
import { ConsultationFormView } from "@/components/views/auth/ConsultationFormView";
import { ConsultationDetailView } from "@/components/views/auth/ConsultationDetailView";
import { AdminLoginView } from "@/components/views/admin/AdminLoginView";
import { AdminDashboardView } from "@/components/views/admin/AdminDashboardView";
import { AdminConsultationsView } from "@/components/views/admin/AdminConsultationsView";
import { AdminConsultationDetailView } from "@/components/views/admin/AdminConsultationDetailView";
import { useGemasStore } from "@/lib/gemas/store";
import { useAuthStore } from "@/lib/gemas/auth-store";

export default function Home() {
  const { currentView, setView } = useGemasStore();

  // Restore Supabase session on app load (multi-device auth)
  // Only run ONCE on mount
  const restoreSession = useAuthStore((s) => s.restoreSession);
  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Secret admin access triggers:
  // 1. Keyboard shortcut: Ctrl + Shift + A (analytics)
  // 2. Keyboard shortcut: Ctrl + Shift + L (admin login)
  // 3. URL hash: #admin-gemas-tersembunyi (analytics)
  // 4. URL hash: #admin-login (admin login)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setView("admin-analytics");
      }
      if (e.ctrlKey && e.shiftKey && (e.key === "L" || e.key === "l")) {
        e.preventDefault();
        setView("admin-login");
      }
    };

    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#admin-gemas-tersembunyi" || hash === "#admin-gemas" || hash === "#admin") {
        setView("admin-analytics");
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
      if (hash === "#admin-login" || hash === "#login-admin") {
        setView("admin-login");
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

  // Views that should NOT show Navbar & Footer (auth, admin, analytics)
  const isHiddenView =
    currentView === "admin-analytics" ||
    currentView === "login" ||
    currentView === "register" ||
    currentView === "reset-password" ||
    currentView === "user-dashboard" ||
    currentView === "consultation-form" ||
    currentView === "consultation-detail" ||
    currentView === "admin-login" ||
    currentView === "admin-dashboard" ||
    currentView === "admin-consultations" ||
    currentView === "admin-consultation-detail" ||
    currentView === "admin-history" ||
    currentView === "admin-analytics-pengunjung" ||
    currentView === "admin-edit-website" ||
    currentView === "admin-users";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isHiddenView && <Navbar />}
      <main className="flex-1">
        {currentView === "home" && <HomeView />}
        {currentView === "cek-status-gizi" && <CekStatusGiziView />}
        {currentView === "mp-asi" && <MpasiView />}
        {currentView === "makan-anak" && <MakanAnakView />}
        {currentView === "video-edukasi" && <VideoEdukasiView />}
        {currentView === "hubungi-ahli" && <HubungiAhliView />}
        {currentView === "tentang" && <TentangView />}
        {currentView === "admin-analytics" && <AdminAnalyticsView />}
        {/* Auth & Consultation Views - wrapped with ErrorBoundary */}
        {(currentView === "login" || currentView === "register" || currentView === "reset-password") && (
          <ErrorBoundary><LoginView /></ErrorBoundary>
        )}
        {currentView === "user-dashboard" && (
          <ErrorBoundary><UserDashboardView /></ErrorBoundary>
        )}
        {currentView === "consultation-form" && (
          <ErrorBoundary><ConsultationFormView /></ErrorBoundary>
        )}
        {currentView === "consultation-detail" && (
          <ErrorBoundary><ConsultationDetailView /></ErrorBoundary>
        )}
        {/* Admin Views - wrapped with ErrorBoundary */}
        {currentView === "admin-login" && <AdminLoginView />}
        {currentView === "admin-dashboard" && (
          <ErrorBoundary>
            <AdminDashboardView />
          </ErrorBoundary>
        )}
        {currentView === "admin-consultations" && (
          <ErrorBoundary>
            <AdminConsultationsView />
          </ErrorBoundary>
        )}
        {currentView === "admin-consultation-detail" && (
          <ErrorBoundary>
            <AdminConsultationDetailView />
          </ErrorBoundary>
        )}
        {currentView === "admin-history" && (
          <ErrorBoundary>
            <AdminConsultationsView />
          </ErrorBoundary>
        )}
        {currentView === "admin-analytics-pengunjung" && (
          <ErrorBoundary>
            <AnalyticsPengunjungView />
          </ErrorBoundary>
        )}
        {currentView === "admin-edit-website" && (
          <ErrorBoundary>
            <EditWebsiteView />
          </ErrorBoundary>
        )}
        {currentView === "admin-users" && (
          <ErrorBoundary>
            <AdminUsersView />
          </ErrorBoundary>
        )}
      </main>
      {!isHiddenView && <Footer />}
    </div>
  );
}
