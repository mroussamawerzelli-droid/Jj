import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ProfileData } from "../types";
import { Award, Heart, Search, Sparkles, Flame, ShieldAlert, Cpu } from "lucide-react";

interface LeaderboardProps {
  onSelectProfile: (profile: ProfileData) => void;
}

// Preset funny profiles to populate the app on startup so it never looks blank
const PRESET_PROFILES: ProfileData[] = [
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
      traits: [
        { trait: "Extroversion", value: 65, explanation: "Enthusiastic but quickly exhausted by real people versus terminal prompts." },
        { trait: "Coffee Dependency", value: 98, explanation: "Essentially relies on caffeine to stay vertical throughout the day." },
        { trait: "Meme Fluency", value: 94, explanation: "Has an instant custom response gif preselected for any emotional situation." },
        { trait: "Aux Cord Safety", value: 70, explanation: "Will probably blast cyberpunk synth tracks or lofi loops without warning." }
      ],
      communicationStyle: "Speaks primarily in Slack reactions and short snippets of highly complex sarcasm.",
      interests: ["Mechanical keyboards", "Iced Cold Brew", "Analyzing source code", "Fictional physics"],
      strengths: ["Can align divs instantly", "Unmatched keyboard typing velocity"],
      vibe: "Coffee-Fueled Cyberpunk",
      funFacts: [
        "Once attempted to automate watering their plants using a smart script, flooded their kitchen instead.",
        "Refuses to buy anything that doesn't have custom RGB backlighting.",
        "Drinks exactly 4.5 liters of sparkling water daily."
      ],
      metrics: {
        socialEnergy: 85,
        humor: 92,
        charisma: 78,
        mystery: 64
      }
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
      traits: [
        { trait: "Retro Energy", value: 96, explanation: "Lives in the wrong decade. Only buys things with physical dials." },
        { trait: "Aesthetic Defense", value: 92, explanation: "Will reject a restaurant purely if font pairing on menu is terrible." },
        { trait: "Text Velocity", value: 40, explanation: "Leaves you on read for 3 business days, then sends letters via mail." },
        { trait: "Vibe Quotient", value: 95, explanation: "Radiates effortless classic art-school energy with zero effort." }
      ],
      communicationStyle: "Replies with enigmatic moody polaroids or highly thoughtful prose.",
      interests: ["Vintage vinyl collecting", "Film photo scanning", "French espresso", "Designing posters"],
      strengths: ["Uncanny ability to find $4 designer leather jackets", "Perfect interior plant arrangement"],
      vibe: "Art-School Mid-Century Minimalist",
      funFacts: [
        "Refuses to use standard map navigation, prefers drawing customized compass coordinates on notebook sheets.",
        "Accidentally bought 40 vintage copies of the same jazz record at a flea market.",
        "Lives in constant fear that analog clocks will become illegal."
      ],
      metrics: {
        socialEnergy: 90,
        humor: 88,
        charisma: 95,
        mystery: 75
      }
    }
  },
  {
    id: "preset-3",
    name: "Marcus 'Crypto-Latte' Bell",
    instagram: "https://instagram.com/marcus_brews",
    description: "Financial tech enthusiast who is deeply passionate about micro-batch bean roasting methods. Practices yoga once on Tuesdays and doesn't shut up about it.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=260",
    createdAt: new Date().toISOString(),
    likesCount: 94,
    userId: "preset-user",
    metrics: {
      socialEnergy: 75,
      humor: 82,
      charisma: 84,
      mystery: 55
    },
    analysis: {
      traits: [
        { trait: "Yoga Devotion", value: 80, explanation: "Does basic child pose once, now recommends spiritual alignment to colleagues." },
        { trait: "Coffee Snobbery", value: 95, explanation: "Measures coffee grounds with a high-precision chemical scale." },
        { trait: "Text Frequency", value: 88, explanation: "Bridges conversation with endless voice messages and links." },
        { trait: "Charisma Level", value: 84, explanation: "Smooth conversationalist, especially explaining why crypto is the future." }
      ],
      communicationStyle: "High-paced and vocabulary-rich, dominated by productivity advice.",
      interests: ["Espresso extraction ratios", "Vibe monitoring", "Fintech startups", "Hot yoga workshops"],
      strengths: ["Superb productivity planning", "Makes a flawless double shot espresso"],
      vibe: "Productive Silicon-Valley Zen",
      funFacts: [
        "Unironically owns a physical hourglass to time their email-answering blocks.",
        "Once attempted to trade a vintage wool scarf for a high-end hand bean grinder.",
        "Has a spreadsheet tracking their daily sleep stage details."
      ],
      metrics: {
        socialEnergy: 75,
        humor: 82,
        charisma: 84,
        mystery: 55
      }
    }
  }
];

export default function Leaderboard({ onSelectProfile }: LeaderboardProps) {
  const [profiles, setProfiles] = useState<ProfileData[]>(PRESET_PROFILES);
  const [search, setSearch] = useState("");
  const [filterMetric, setFilterMetric] = useState<"likesCount" | "socialEnergy" | "humor" | "charisma" | "mystery">("likesCount");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchProfiles() {
      setIsLoading(true);
      try {
        const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"), limit(25));
        const querySnapshot = await getDocs(q);
        const fetched: ProfileData[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as ProfileData);
        });

        // Merge fetched profiles with preset profiles to keep data rich
        if (fetched.length > 0) {
          const joined = [...fetched];
          // Add presets that are not already present
          PRESET_PROFILES.forEach(p => {
            if (!joined.some(j => j.id === p.id)) {
              joined.push(p);
            }
          });
          setProfiles(joined);
        } else {
          setProfiles(PRESET_PROFILES);
        }
      } catch (err) {
        console.error("Failed to query leaderboard from Firestore:", err);
        // Fallback gracefully to presets if firebase database not synced
        setProfiles(PRESET_PROFILES);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  // Filter profiles based on search query
  const filteredProfiles = profiles
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.analysis?.vibe?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (filterMetric === "likesCount") {
        return b.likesCount - a.likesCount;
      } else {
        const valA = a.analysis?.metrics?.[filterMetric] || a.metrics?.[filterMetric] || 0;
        const valB = b.analysis?.metrics?.[filterMetric] || b.metrics?.[filterMetric] || 0;
        return valB - valA;
      }
    });

  return (
    <div id="leaderboard-section" className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-widest animate-pulse">
          <Award className="w-3.5 h-3.5" /> High Score Lounge
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3 font-sans">
          Chila Leaderboard
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          The ultimate hall of fame. See who rank highest in likes, charisma level, humor quotient, or deep mysterious energy.
        </p>
      </div>

      {/* Control Actions (Search & Sort) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search names, vibes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Sorting Toggles */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
          <span className="text-xs text-gray-400 mr-2 uppercase tracking-wider font-semibold">Rank By:</span>
          {[
            { label: "Trending 🔥", value: "likesCount" },
            { label: "Charisma ✨", value: "charisma" },
            { label: "Humor 😂", value: "humor" },
            { label: "Social Energy 🔋", value: "socialEnergy" },
            { label: "Mystery 🕶️", value: "mystery" }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterMetric(item.value as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                filterMetric === item.value
                  ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/25"
                  : "bg-black/30 border-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Querying active high scores corridors...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm">No profiles correspond to your query.</p>
            </div>
          ) : (
            filteredProfiles.map((profile, idx) => {
              const currentScore =
                filterMetric === "likesCount"
                  ? profile.likesCount
                  : profile.analysis?.metrics?.[filterMetric] || profile.metrics?.[filterMetric] || 0;

              return (
                <div
                  key={profile.id}
                  onClick={() => onSelectProfile(profile)}
                  className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:border-purple-500/50 hover:from-white/10 hover:to-white/[0.04] transition-all duration-300 group shadow-lg"
                >
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                        : idx === 1
                        ? "bg-gradient-to-br from-slate-200 to-slate-400 text-black"
                        : idx === 2
                        ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                        : "bg-white/10 text-gray-300"
                    }`}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="relative shrink-0">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/15 group-hover:border-purple-400 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-purple-600 w-5 h-5 rounded-full flex items-center justify-center border border-black shadow">
                      <Flame className="w-3" />
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="flex-1 text-center md:text-left space-y-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h3 className="font-extrabold text-lg text-white group-hover:text-purple-300 transition-colors truncate">
                        {profile.name}
                      </h3>
                      <span className="inline-block px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-semibold text-blue-400 uppercase tracking-wider self-center mx-auto md:mx-0">
                        {profile.analysis?.vibe || "Curator"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-1 italic">
                      "{profile.description}"
                    </p>
                  </div>

                  {/* Metric Display Spot */}
                  <div className="shrink-0 flex items-center gap-6 bg-black/30 border border-white/5 py-2 px-4 rounded-xl">
                    <div className="text-center">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                        {filterMetric === "likesCount" ? "LIKES" : filterMetric}
                      </span>
                      <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        {currentScore}{filterMetric !== "likesCount" && "%"}
                      </span>
                    </div>

                    <div className="w-[1px] h-8 bg-white/10" />

                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                      <span>{profile.likesCount}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Entertainment Disclaimer */}
      <div className="mt-12 text-center text-[10px] text-gray-500 max-w-2xl mx-auto space-y-1">
        <p className="flex items-center justify-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red-500" />
          <span>Results are AI-generated entertainment and may be completely inaccurate.</span>
        </p>
        <p>No real personality profiles or psychological claims are backed by scientific facts. Please share responsibly.</p>
      </div>
    </div>
  );
}
