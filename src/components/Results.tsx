import React, { useState } from "react";
import { ProfileData } from "../types";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { Award, Heart, Share2, Download, Check, RefreshCw, Instagram, HelpCircle, ShieldAlert, BadgeInfo } from "lucide-react";

interface ResultsProps {
  profile: ProfileData;
  onBackToAnalyze: () => void;
}

export default function Results({ profile, onBackToAnalyze }: ResultsProps) {
  const [likes, setLikes] = useState(profile.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Users' feedback reactions state
  const [reactions, setReactions] = useState({
    haha: profile.reactions?.haha || 0,
    spotOn: profile.reactions?.spotOn || 0,
    fire: profile.reactions?.fire || 0
  });
  const [userReaction, setUserReaction] = useState<"haha" | "spotOn" | "fire" | null>(null);

  // Submit reaction count feedback
  const handleReaction = async (type: "haha" | "spotOn" | "fire") => {
    if (userReaction) return;
    setUserReaction(type);
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1
    }));

    try {
      const docRef = doc(db, "profiles", profile.id);
      
      // Safety precaution: initialize map in Firestore if missing on older documents
      if (!profile.reactions) {
        const fallbackObj = { haha: 0, spotOn: 0, fire: 0 };
        fallbackObj[type] = 1;
        await updateDoc(docRef, {
          reactions: fallbackObj
        });
      } else {
        await updateDoc(docRef, {
          [`reactions.${type}`]: increment(1)
        });
      }
    } catch (err) {
      console.error("Failed to append reaction to Firestore card:", err);
      // Revert if write was denied
      setReactions((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1)
      }));
      setUserReaction(null);
    }
  };

  // Handle upvoting
  const handleLike = async () => {
    if (hasLiked) return;
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    try {
      // Update in Firestore matching standard security policy increments
      const path = `profiles/${profile.id}`;
      await updateDoc(doc(db, "profiles", profile.id), {
        likesCount: increment(1)
      });
    } catch (err) {
      console.error("Failed to update profile like in Firestore:", err);
      // Fallback revert
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  // Handle sharing link
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?profile=${profile.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Printable screen/card instructions info
  const handleSaveCard = () => {
    // Print window triggers standard browser capture, or provide simple visual guidance
    window.print();
  };

  const getMetricGradient = (metricName: string) => {
    switch (metricName) {
      case "socialEnergy": return "from-emerald-400 to-teal-500 shadow-emerald-500/10";
      case "humor": return "from-yellow-400 to-orange-500 shadow-orange-500/10";
      case "charisma": return "from-purple-500 to-pink-500 shadow-pink-500/10";
      case "mystery": return "from-blue-500 to-indigo-600 shadow-blue-500/10";
      default: return "from-purple-500 to-blue-500 shadow-purple-500/10";
    }
  };

  const a = profile.analysis;

  return (
    <div id="results-section" className="max-w-5xl mx-auto px-4 py-8 space-y-12 print:py-0 print:bg-black">
      
      {/* Disclaimer on top as instructed */}
      <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl p-4 flex items-start gap-3 max-w-3xl mx-auto print:hidden">
        <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0" />
        <div className="text-xs text-gray-400 leading-relaxed">
          <span className="font-bold text-white block mb-0.5">AI Entertainment Disclaimer</span>
          This analysis is a fictional creative product of Chila.com's AI systems and is not a factual, diagnostic, or scientific representation. We strictly verify and filter sensitive details to promote respectful, friendly roasts. Please share responsibly.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Playable Collectible Character Card (Left: span 5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* Card Container styled like a holographic premium sport card */}
          <div className="relative w-full max-w-[340px] aspect-[2.5/3.5] rounded-[24px] overflow-hidden bg-gradient-to-b from-purple-900/30 via-slate-900 to-black border-2 border-purple-500/40 p-4 shadow-2xl shadow-purple-500/10 flex flex-col justify-between group print:border-purple-600 print:shadow-none">
            {/* Holographic background sheen glow effect */}
            <div className="absolute inset-x-0 -top-40 -bottom-40 bg-gradient-to-tr from-cyan-400/5 via-transparent to-pink-500/5 transform skew-y-12 rotate-12 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="space-y-4 relative z-10">
              {/* Header section (Name + Likes) */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[9px] text-cyan-400 font-extrabold tracking-widest uppercase font-mono block">
                    CHILA COLLECTIBLE
                  </span>
                  <h3 className="text-xl font-black text-white leading-none tracking-tight">
                    {profile.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-black/60 border border-white/10 rounded-full">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span className="text-white text-[10px] font-extrabold">{likes}</span>
                </div>
              </div>

              {/* Card Main Image */}
              <div className="w-full h-44 rounded-xl overflow-hidden border border-white/10 relative">
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Vibe tag label badge overlay */}
                <div className="absolute bottom-2 left-2 px-3 py-1 bg-purple-950/80 backdrop-blur-md border border-purple-500/40 rounded-full">
                  <span className="text-[10px] text-purple-200 font-black uppercase tracking-wider">
                    ✨ {a?.vibe || profile.metrics ? "Vibe Curator" : "Chila Profile"}
                  </span>
                </div>
              </div>

              {/* Four top metrics on the card */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(a?.metrics || profile.metrics || {}).map(([key, val]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                  const percentage = Number(val);
                  return (
                    <div key={key} className="bg-black/40 border border-white/5 p-2 rounded-lg text-center space-y-1">
                      <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-widest">{label}</span>
                      <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono text-sm leading-none">
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Footer watermarks */}
            <div className="pt-2 border-t border-white/5 flex justify-between items-center relative z-10 text-[9px] text-gray-500 font-mono">
              <span>CHILA.COM © 2026</span>
              <span className="text-purple-400/70 font-extrabold">SERIAL #{(profile.id || "").slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Card action controls (Likes, Copy, Print) */}
          <div className="mt-6 flex gap-3 print:hidden">
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition duration-300 ${
                hasLiked
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-500 text-rose-500 animate-bounce" : "text-gray-400"}`} />
              <span>{hasLiked ? "Upvoted!" : "Upvote"}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-xs flex items-center gap-1.5 transition duration-300"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Share Card</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveCard}
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 font-bold text-xs flex items-center gap-1.5 transition duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Print/Save</span>
            </button>
          </div>
        </div>

        {/* AI generated profile analysis breakdown panel (Right: span 7) */}
        <div className="lg:col-span-7 space-y-8 bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
          
          {/* Header Title with core tagline */}
          <div>
            <h1 className="text-3xl font-black text-white leading-tight">
              AI Roast & Vibe Report
            </h1>
            <p className="text-gray-400 text-sm italic mt-1">
              "{profile.description}"
            </p>
          </div>

          {/* Social Vibe and Communication Style display */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 font-mono">
              Core Personality & Communication Style
            </h3>
            <p className="text-gray-200 text-sm bg-black/45 hover:bg-black/55 rounded-2xl p-4 border border-white/5 leading-relaxed">
              {a?.communicationStyle || "This person exhibits highly dynamic social response, texting in either 4-second blocks or completely disappearing for several days to ponder life's choices."}
            </p>
          </div>

          {/* Estimated Personality traits sliders */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-purple-400 font-mono">
              Estimated Personality Traits
            </h3>
            <div className="space-y-4">
              {a?.traits?.map((t) => (
                <div key={t.trait} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-200">{t.trait}</span>
                    <span className="text-purple-400">{t.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${t.value}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mb-2 leading-snug">{t.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hobbies & Strong aspects columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-blue-400 font-mono">
                Interests & Hobbies
              </h4>
              <div className="flex flex-wrap gap-2">
                {a?.interests?.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold rounded-lg"
                  >
                    🚀 {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-pink-400 font-mono">
                Funny Superpowers
              </h4>
              <div className="space-y-1.5">
                {a?.strengths?.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-gray-300 leading-snug">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Playful Hilarious Fun Facts */}
          <div className="bg-gradient-to-tr from-purple-950/20 via-black/30 to-cyan-950/20 rounded-2xl p-5 border border-purple-500/20 relative overflow-hidden space-y-4">
            <h3 className="text-xs font-black uppercase text-purple-300 tracking-widest font-mono flex items-center gap-1.5">
              <BadgeInfo className="w-4 h-4 text-purple-400 animate-pulse" /> Playful AI Speculation (Fun Facts)
            </h3>
            <ul className="space-y-3">
              {a?.funFacts?.map((fact, idx) => (
                <li key={idx} className="text-gray-300 text-xs leading-relaxed flex gap-3 items-start">
                  <span className="text-xs font-extrabold text-cyan-400 font-mono shrink-0">#{idx + 1}</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Reaction feedback section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 font-mono">
                  Accuracy Feedback
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  How accurate was this AI deconstruction and roast? Let us know:
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleReaction("haha")}
                disabled={userReaction !== null}
                className={`py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  userReaction === "haha"
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300 scale-[1.02]"
                    : userReaction !== null
                    ? "bg-white/[0.01] border-white/5 text-gray-500 cursor-not-allowed opacity-50"
                    : "bg-white/5 border-white/10 text-gray-200 hover:bg-yellow-500/10 hover:border-yellow-500/25 cursor-pointer hover:shadow-lg hover:shadow-yellow-500/5"
                }`}
              >
                <span className="text-2xl select-none">😂</span>
                <span className="text-xs font-bold font-sans">Haha</span>
                <span className="text-[10px] font-mono mt-0.5 px-2 py-0.5 rounded-full bg-black/40 text-yellow-400/80 font-bold">
                  {reactions.haha}
                </span>
              </button>

              <button
                onClick={() => handleReaction("spotOn")}
                disabled={userReaction !== null}
                className={`py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  userReaction === "spotOn"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 scale-[1.02]"
                    : userReaction !== null
                    ? "bg-white/[0.01] border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                    : "bg-white/5 border-white/10 text-gray-200 hover:bg-emerald-500/10 hover:border-emerald-500/25 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5"
                }`}
              >
                <span className="text-2xl select-none">🎯</span>
                <span className="text-xs font-bold font-sans">Spot On</span>
                <span className="text-[10px] font-mono mt-0.5 px-2 py-0.5 rounded-full bg-black/40 text-emerald-400/80 font-bold">
                  {reactions.spotOn}
                </span>
              </button>

              <button
                onClick={() => handleReaction("fire")}
                disabled={userReaction !== null}
                className={`py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  userReaction === "fire"
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-300 scale-[1.02]"
                    : userReaction !== null
                    ? "bg-white/[0.01] border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                    : "bg-white/5 border-white/10 text-gray-200 hover:bg-orange-500/10 hover:border-orange-500/25 cursor-pointer hover:shadow-lg hover:shadow-orange-500/5"
                }`}
              >
                <span className="text-2xl select-none">🔥</span>
                <span className="text-xs font-bold font-sans">Fire</span>
                <span className="text-[10px] font-mono mt-0.5 px-2 py-0.5 rounded-full bg-black/40 text-orange-400/80 font-bold">
                  {reactions.fire}
                </span>
              </button>
            </div>

            {userReaction && (
              <p className="text-[11px] text-center text-emerald-400 font-semibold animate-pulse">
                ✨ Calibration locked! Feedback submitted to Chila.com AI models.
              </p>
            )}
          </div>

          {/* Back Action button */}
          <div className="pt-4 flex justify-end print:hidden">
            <button
              onClick={onBackToAnalyze}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm tracking-wide hover:bg-white/10 transition flex items-center gap-2 group cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>Deconstruct Another Friend</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
