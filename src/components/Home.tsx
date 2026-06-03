import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";
import { ProfileData } from "../types";
import { Sparkles, Heart, Search, Award, ShieldAlert, Cpu } from "lucide-react";

interface HomeProps {
  onAnalyzeClick: () => void;
  onSelectProfile: (profile: ProfileData) => void;
}

// Preset funny profiles for home catalog trending showcase
const TRENDING_PRESETS: ProfileData[] = [
  {
    id: "preset-1",
    name: "Chad 'Hyper-Grid' Miller",
    instagram: "https://instagram.com/hyperchad_dev",
    description: "Believes iced coffee is a substitute for basic physiological sleep. Owns 5 mechanical keyboards. Can identify a CSS alignment issue from 20 yards away.",
    imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=260",
    createdAt: new Date().toISOString(),
    likesCount: 154,
    userId: "preset-user",
    metrics: {
      socialEnergy: 85,
      humor: 92,
      charisma: 78,
      mystery: 64
    },
    analysis: {
      traits: [],
      communicationStyle: "",
      interests: [],
      strengths: [],
      vibe: "Coffee-Fueled Cyberpunk",
      funFacts: [],
      metrics: {
        socialEnergy: 85,
        humor: 92,
        charisma: 78,
        mystery: 64
      }
    },
    reactions: {
      haha: 12,
      spotOn: 24,
      fire: 18
    }
  },
  {
    id: "preset-2",
    name: "Sophia 'Thrift-Lord' Chen",
    instagram: "https://instagram.com/vintage_soph",
    description: "Thrift shop purist. Currently owns 12 pairs of vintage sunglasses. Can debate for 3 hours why film cameras sound better than phone sensors.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=260",
    createdAt: new Date().toISOString(),
    likesCount: 129,
    userId: "preset-user",
    metrics: {
      socialEnergy: 90,
      humor: 88,
      charisma: 95,
      mystery: 75
    },
    analysis: {
      traits: [],
      communicationStyle: "",
      interests: [],
      strengths: [],
      vibe: "Art-School Vintage",
      funFacts: [],
      metrics: {
        socialEnergy: 90,
        humor: 88,
        charisma: 95,
        mystery: 75
      }
    },
    reactions: {
      haha: 8,
      spotOn: 19,
      fire: 22
    }
  }
];

export default function Home({ onAnalyzeClick, onSelectProfile }: HomeProps) {
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<ProfileData[]>(TRENDING_PRESETS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRecent() {
      setIsLoading(true);
      try {
        const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"), limit(6));
        const querySnapshot = await getDocs(q);
        const fetched: ProfileData[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as ProfileData);
        });

        if (fetched.length > 0) {
          const joined = [...fetched];
          TRENDING_PRESETS.forEach(p => {
            if (!joined.some(j => j.id === p.id)) {
              joined.push(p);
            }
          });
          setProfiles(joined);
        } else {
          setProfiles(TRENDING_PRESETS);
        }
      } catch (err) {
        console.error("Home query silent error:", err);
        setProfiles(TRENDING_PRESETS); // Fallback to presets
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecent();
  }, []);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.analysis?.vibe?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div id="home-section" className="space-y-16 py-8">
      {/* Hero Banner Section */}
      <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-purple-500/10 border border-purple-500/15 rounded-full text-purple-400 font-extrabold text-[10px] tracking-widest uppercase animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI-powered Profile Deconstruction
        </div>

        <h1 className="text-6xl md:text-7xl font-sans font-black tracking-tight leading-[0.9] text-white">
          Who is your <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent italic selection:bg-purple-600">
            friend, really?
          </span>
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans">
          Upload a friend's details—along with their social handles or image—to generate a funny, good-natured AI roast and collectible digital personality card.
        </p>

        {/* Home CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-2">
          <button
            onClick={onAnalyzeClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-purple-600/25 transition duration-300 uppercase cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Analyze a Friend</span>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </button>

          <a
            href="#trending-section"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm tracking-wide transition text-center"
          >
            Browse Cards
          </a>
        </div>
      </div>

      {/* Featured Search Catalog Section */}
      <div id="trending-section" className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center pb-4 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black text-white">Trending Chila Cards</h2>
            <p className="text-gray-500 text-xs">Recently submitted profiles and highly liked cards.</p>
          </div>

          {/* Catalog search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search catalog profiles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm animate-pulse">Syncing dynamic collectibles corridors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-white/5 rounded-2xl">
            <p className="text-gray-400 text-sm">No profiles found corresponding to your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/[0.08] flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-4">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/5">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      <span className="text-white text-[10px] font-extrabold">{profile.likesCount}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-block px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold text-purple-300 uppercase tracking-widest leading-none">
                      {profile.analysis?.vibe || "Vibe Curator"}
                    </span>
                    <h3 className="font-extrabold text-white text-lg group-hover:text-purple-300 transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 italic">
                      "{profile.description}"
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>CHILA CARD</span>
                  <span className="text-purple-400/60 uppercase group-hover:text-purple-400 transition-colors">VIEW VIBES →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust & Safety notice section */}
      <div className="max-w-4xl mx-auto bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start gap-4 mx-4">
        <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-widest">Safety & Ethics Guarantee</h4>
          <p className="text-gray-400 text-xs leading-relaxed">
            Chila.com is strictly an entertainment application for friendly roasts. We operate tight filters ensuring that no sensitive issues (ethnicity, religion, political viewpoints, criminal or medical records) are evaluated. Please practice mutual respect when generating profiles.
          </p>
        </div>
      </div>
    </div>
  );
}
