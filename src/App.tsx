import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, initializeUserSession, isAnonymousAuthError } from "./firebase";
import { ProfileData } from "./types";

// Page Components
import Home from "./components/Home";
import Analyze from "./components/Analyze";
import Results from "./components/Results";
import Leaderboard from "./components/Leaderboard";
import About from "./components/About";
import Contact from "./components/Contact";
import AdminPanel from "./components/AdminPanel";

// Icons
import { Sparkles, Trophy, Info, MessagesSquare, Award, ShieldAlert } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "analyze" | "results" | "leaderboard" | "about" | "contact">("home");
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  
  // Secret admin state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isLoadingMain, setIsLoadingMain] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [adminInputCode, setAdminInputCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [hasAuthError, setHasAuthError] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(true);
 
  // Initialize session and parse shared links on startup
  useEffect(() => {
    // Start anonymous Session for seamless database safety checks
    initializeUserSession().then(() => {
      if (isAnonymousAuthError) {
        setHasAuthError(true);
      }
    });

    // Check if there's an existing valid admin session stored locally
    if (localStorage.getItem("chila_admin_session") === "true") {
      setIsAdminSession(true);
    }

    // Check query params for deep-link profile sharing
    const params = new URLSearchParams(window.location.search);
    const sharedProfileId = params.get("profile");

    if (sharedProfileId) {
      async function fetchSharedProfile() {
        setIsLoadingMain(true);
        try {
          const docRef = doc(db, "profiles", sharedProfileId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profile = { id: docSnap.id, ...docSnap.data() } as ProfileData;
            setSelectedProfile(profile);
            setActiveTab("results");
          }
        } catch (err) {
          console.error("Shared profile load unsuccessful:", err);
        } finally {
          setIsLoadingMain(false);
        }
      }
      fetchSharedProfile();
    }
  }, []);

  const handleProfileSelection = (profile: ProfileData) => {
    setSelectedProfile(profile);
    setActiveTab("results");
    
    // Update URL quietly to reflect deep link without reloading for clean sharing
    const newUrl = `${window.location.origin}?profile=${profile.id}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const handleBackToAnalyze = () => {
    setSelectedProfile(null);
    setActiveTab("analyze");
    // Clear URL query params
    const newUrl = window.location.origin;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const handleLogoClick = () => {
    setSelectedProfile(null);
    setActiveTab("home");
    // Clear URL query params
    const newUrl = window.location.origin;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between font-sans relative antialiased selection:bg-purple-600">
      
      {/* Background radial overlays for premium ambient atmosphere */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-purple-900/10 via-indigo-900/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[130px] rounded-full pointer-events-none" />

      {/* Modern sticky glassmorphic Top Navbar */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo with cyber-neon premium gradient styling */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-gradient-to-br from-purple-500 through-indigo-500 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-purple-500/10 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight leading-none text-white font-sans">
              Chila<span className="text-purple-400">.com</span>
            </span>
          </div>

          {/* Navigation Links Menu */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 md:gap-3">
            {[
              { id: "home", label: "Home" },
              { id: "analyze", label: "Analyze Friend" },
              { id: "leaderboard", label: "Leaderboard", icon: Trophy },
              { id: "about", label: "About", icon: Info },
              { id: "contact", label: "Contact", icon: MessagesSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id !== "results") setSelectedProfile(null);
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 md:px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white border-b-2 border-purple-500 shadow-md shadow-purple-500/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Dynamic Top Admin Bar Gateway */}
      <div className="shrink-0 bg-purple-950/25 border-b border-purple-500/10 py-1.5 px-4 text-xs font-mono text-gray-300 print:hidden relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-purple-300">Admin Control Gate</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdminSession ? (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-emerald-400 font-bold">● Active Session Unlocked</span>
                <span className="text-gray-600 hidden sm:inline">|</span>
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/50 text-white px-2 py-0.5 rounded transition cursor-pointer text-[10px] font-bold"
                >
                  Manage Console
                </button>
                <span className="text-gray-600">|</span>
                <button
                  onClick={() => {
                    setIsAdminSession(false);
                    localStorage.removeItem("chila_admin_session");
                  }}
                  className="text-gray-400 hover:text-white transition cursor-pointer text-[10px]"
                >
                  Lock Session
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminInputCode === "190704") {
                    setIsAdminSession(true);
                    localStorage.setItem("chila_admin_session", "true");
                    setAdminInputCode("");
                    setAdminError("");
                    setShowAdminPanel(true); // Open panel immediately
                  } else {
                    setAdminError("Invalid Code");
                    setAdminInputCode("");
                    setTimeout(() => setAdminError(""), 3000);
                  }
                }}
                className="flex items-center gap-2"
              >
                {adminError && <span className="text-red-400 font-bold text-[10px] mr-1">{adminError}</span>}
                <input
                  type="password"
                  placeholder="Admin passcode..."
                  value={adminInputCode}
                  onChange={(e) => setAdminInputCode(e.target.value)}
                  className="bg-black/60 border border-white/10 px-2.5 py-1 rounded text-[10px] text-white focus:outline-none focus:border-purple-500 w-32 tracking-wider placeholder:text-gray-600 placeholder:tracking-normal text-center"
                />
                <button
                  type="submit"
                  className="bg-purple-600/20 hover:bg-purple-600/35 text-purple-200 px-2.5 py-1 rounded border border-purple-500/20 transition cursor-pointer text-[10px] font-bold"
                >
                  Unlock
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main content viewport */}
      <main className="flex-grow relative z-10 px-4 py-8">
        {isLoadingMain ? (
          <div className="max-w-md mx-auto text-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 text-sm">Parsing shared collectible card corridor...</p>
          </div>
        ) : (
          <>
            {hasAuthError && showAuthWarning && (
              <div className="max-w-7xl mx-auto mb-6 bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 mt-1 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-200">Firebase Anonymous Auth Disabled</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
                      Anonymous Authentication is currently disabled under your Firebase Console sign-in methods. 
                      However, we have auto-activated <strong className="text-amber-300">Guest Mode fallback</strong>—allowing your users to still roast, like, and interact seamlessly!
                      To resolve this permanently, simply enable <strong className="text-amber-200">Anonymous</strong> sign-in under <strong className="text-gray-300">Firebase Console → Authentication → Sign-in method</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthWarning(false)}
                  className="px-3 py-1.5 self-end md:self-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-semibold cursor-pointer transition shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {activeTab === "home" && (
              <Home
                onAnalyzeClick={() => setActiveTab("analyze")}
                onSelectProfile={handleProfileSelection}
              />
            )}
            {activeTab === "analyze" && (
              <Analyze onAnalysisComplete={handleProfileSelection} />
            )}
            {activeTab === "results" && selectedProfile && (
              <Results
                profile={selectedProfile}
                onBackToAnalyze={handleBackToAnalyze}
              />
            )}
            {activeTab === "leaderboard" && (
              <Leaderboard onSelectProfile={handleProfileSelection} />
            )}
            {activeTab === "about" && <About />}
            {activeTab === "contact" && <Contact />}
          </>
        )}
      </main>

      {/* Modern clean footer watermarks */}
      <footer className="shrink-0 border-t border-white/5 py-8 px-4 text-center text-xs text-gray-500 space-y-3 relative z-10 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Chila.com. Built with Gemini AI and Firebase Firestore. All rights reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => { setSelectedProfile(null); setActiveTab("about"); }} className="hover:text-gray-300 transition">Disclaimer</button>
            <button onClick={() => { setSelectedProfile(null); setActiveTab("about"); }} className="hover:text-gray-300 transition">Privacy Policy</button>
            <button onClick={() => { setSelectedProfile(null); setActiveTab("contact"); }} className="hover:text-gray-300 transition">Feedback</button>
          </div>
        </div>
      </footer>

      {/* TRIGGER SPOT FOR SECRET ADMIN PANEL
          A small, invisible clickable hotspot on the right edge of the screen, as instructed.
          When clicked, the passcode authenticating overlay appears! */}
      <div
        id="secret-admin-trigger"
        onClick={() => setShowAdminPanel(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 w-2 h-16 bg-white/10 hover:bg-white/20 transition-all opacity-0 hover:opacity-[0.15] cursor-pointer z-50 rounded-l-md"
        title="Admin Zone"
      />

      {/* Secret admin panel overlay verification modal */}
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          isAdminSession={isAdminSession}
        />
      )}

    </div>
  );
}
