import React, { useState, useRef } from "react";
import { Upload, HelpCircle, Instagram, Sparkles, CheckCircle, ShieldAlert, Video } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { ProfileData } from "../types";

interface AnalyzeProps {
  onAnalysisComplete: (newProfile: ProfileData) => void;
}

// Playful funny messages during loading
const LOADING_MESSAGES = [
  "Awakening Chila-Bot...",
  "Calibrating meme detectors...",
  "Running profile photo diagnostics...",
  "Assessing unread DM response latency...",
  "Calculating aux cord safety levels...",
  "Simulating potential roast impact... 🌶️",
  "Checking for coffee-dependency biomarkers...",
  "Structuring digital collectible profile..."
];

export default function Analyze({ onAnalysisComplete }: AnalyzeProps) {
  const [form, setForm] = useState({
    name: "",
    instagram: "",
    tiktok: "",
    twitter: "",
    description: ""
  });
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  // Loading process states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File exceeds 2MB limit. Please upload a smaller avatar.");
        return;
      }
      setErrorMessage(null);
      setImageName(file.name);
      setMimeType(file.type);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File exceeds 2MB limit. Please upload a smaller avatar.");
        return;
      }
      setErrorMessage(null);
      setImageName(file.name);
      setMimeType(file.type);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startLoadingAnimations = () => {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_MESSAGES.length - 1) {
          return prev + 1;
        } else {
          return prev; // keep at last
        }
      });
    }, 1800);
    return interval;
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      setErrorMessage("Please fill out the friend's name and description.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    const animInterval = startLoadingAnimations();

    try {
      // 1. Submit to Gemini AI proxy endpoint on Express server
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          instagram: form.instagram,
          tiktok: form.tiktok,
          twitter: form.twitter,
          description: form.description,
          imageBase64: imageBase64 || "", // passed if provided
          mimeType: mimeType || ""
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Express proxy analysis failure");
      }

      const { analysis } = await response.json();

      // 2. Fallbacks for safety or missing fields
      const finalAnalysis = {
        traits: analysis.traits || [
          { trait: "Vibe Score", value: 80, explanation: "Standard friendly calibration checks out." }
        ],
        communicationStyle: analysis.communicationStyle || "Responds immediately or in 4 business weeks.",
        interests: analysis.interests || ["Checking social stories", "Grabbing coffee"],
        strengths: analysis.strengths || ["Incredible aux cord selection"],
        vibe: analysis.vibe || "Enigmatic Soul",
        funFacts: analysis.funFacts || ["Always has 4% phone battery left."],
        metrics: analysis.metrics || {
          socialEnergy: 75,
          humor: 80,
          charisma: 75,
          mystery: 50
        }
      };

      // 3. Setup default dynamic background/avatar if none was uploaded
      const finalImage = imageBase64 || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=260`;

      // 4. Save analysis to Firebase Firestore under collection "profiles"
      const docPayload = {
        name: form.name,
        instagram: form.instagram || "Not provided",
        tiktok: form.tiktok || "",
        twitter: form.twitter || "",
        description: form.description,
        imageUrl: finalImage,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser?.uid || "anonymous",
        likesCount: 0,
        metrics: finalAnalysis.metrics,
        analysis: finalAnalysis,
        reactions: {
          haha: 0,
          spotOn: 0,
          fire: 0
        }
      };

      const pathForWrite = "profiles";
      let docRef;
      try {
        docRef = await addDoc(collection(db, pathForWrite), docPayload);
      } catch (firestoreError) {
        // Enforce Firestore error handling requirements
        handleFirestoreError(firestoreError, OperationType.WRITE, pathForWrite);
      }

      const completedProfile: ProfileData = {
        id: docRef?.id || "temp-id-" + Date.now(),
        ...docPayload
      };

      clearInterval(animInterval);
      onAnalysisComplete(completedProfile);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to analyze friend. Please verify your local networking or credentials.");
      setIsAnalyzing(false);
    } finally {
      clearInterval(animInterval);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="relative w-24 h-24 mx-auto">
          {/* Neon spinning loading element */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-ping" />
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-cyan-400 animate-spin" />
          <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center text-purple-400">
            <Sparkles className="w-8 h-8 animate-pulse text-cyan-400" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold font-mono">
            Chila AI Engine Active
          </p>
          <h2 className="text-2xl font-black text-white selection:bg-purple-600">
            {LOADING_MESSAGES[loadingStep]}
          </h2>
          <p className="text-sm text-gray-400 animate-pulse">
            Chila-Bot is evaluating the digital footprint...
          </p>
        </div>

        {/* Loading progress visualization indicator */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden max-w-sm mx-auto">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-1000"
            style={{ width: `${((loadingStep + 1) / LOADING_MESSAGES.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div id="analyze-section" className="max-w-2xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3 font-sans">
          Analyze a Friend
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Submit details below and our friendly AI engine will draft a comedic collectible character card.
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-xs font-semibold mb-6 flex items-center gap-2">
          <span>❌ {errorMessage}</span>
        </div>
      )}

      {/* Main Glassmorphic Form Card */}
      <form onSubmit={handleStartAnalysis} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl space-y-6">
        
        {/* Photo Upload with drag support */}
        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wide">
            Friend's Photo (Optional)
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-black/20 group relative overflow-hidden"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {imageBase64 ? (
              <div className="space-y-4">
                <img
                  src={imageBase64}
                  alt="Pre-uploaded avatar"
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                />
                <p className="text-xs text-purple-300 font-semibold truncate max-w-xs mx-auto">
                  {imageName || "Custom Avatar Configured ✔"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-purple-400 mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm text-gray-300 font-medium">
                  Drag and drop photo here, or <span className="text-purple-400 font-bold">browse</span>
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  Supports PNG, JPG (Max 2MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Input Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">
              Friend's Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Liam Parker"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">
              Instagram Handle/URL
            </label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-pulse" />
              <input
                type="text"
                placeholder="e.g. @liam.parker"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Additional Optional Links */}
        <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4">
          <p className="text-[10px] text-purple-300 uppercase tracking-widest font-extrabold flex items-center gap-1">
            <Sparkles className="w-3" /> Optional Social Links
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1.5">TikTok Link</label>
              <input
                type="text"
                placeholder="e.g. tiktok.com/@liam"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                className="w-full bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1.5">Twitter / X Link</label>
              <input
                type="text"
                placeholder="e.g. twitter.com/liam"
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                className="w-full bg-black/50 border border-white/5 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">
            Short, funny description of your friend
          </label>
          <textarea
            required
            rows={4}
            placeholder="Tell us what makes them hilarious, unique, or worthy of a roast. Focus on their coffee habits, text response frequency, aux cord reliability, or hobbies..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
        </div>

        {/* Safety disclaimer snippet */}
        <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 flex items-start gap-2 text-gray-400 text-[10px]">
          <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
          <p className="leading-relaxed">
            By submitting, you represent that this profile is friendly entertainment. Results are AI-generated, fictional, and may be inaccurate. Chila strictly blocks generation of sensitive topics like religion, politics, exact age, ethnicity, or medical conditions.
          </p>
        </div>

        {/* Launch Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-extrabold py-4 rounded-2xl transition duration-300 flex items-center justify-center gap-2 text-base shadow-lg shadow-purple-600/25 cursor-pointer uppercase tracking-wider"
        >
          <span>Deconstruct Vibe</span>
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </button>
      </form>
    </div>
  );
}
