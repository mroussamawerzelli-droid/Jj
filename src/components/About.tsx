import { Info, Sparkles, Smile, ShieldAlert } from "lucide-react";

export default function About() {
  return (
    <div id="about-section" className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          About Chila.com
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          The internet's premiere destination for custom, friendly, AI-powered profile cards and character analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-white mb-2">How It Works</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            By uploading a friend's picture, link, and a short, playful description, our advanced Chila-Bot AI analyzes their digital footprint and personality style to draft a funny, custom collectible character card.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4">
            <Smile className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-white mb-2">Good-Natured Roasts</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            We love humorous, affectionate roasts! We look at habits like reaction-gif fluency, unread notifications, and iced coffee habits. No meanness allowed—we keep it warm and playful.
          </p>
        </div>
      </div>

      {/* Safety Policy Section */}
      <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl p-8 mb-12">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-500/10 p-3 rounded-xl text-yellow-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-white mb-2">Strict Guidelines & Safety Policies</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Chila is designed 100% for fun, laughter, and light entertainment. Our AI system operates under strict ethical guardrails:
            </p>
            <ul className="list-disc list-inside text-gray-400 text-xs space-y-2">
              <li>Religion, ethnicity, or political viewpoints are completely restricted.</li>
              <li>Under no circumstances is criminal history, medical conditions, or sexual orientation calculated or guessed.</li>
              <li>Explicitly prohibits cyberbullying, harassment, or derogatory remarks.</li>
              <li>Results are non-factual, fictional, and purely generated for creative expression.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Team/Mission Disclaimer */}
      <div className="text-center bg-white/5 border border-white/5 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-2">Disclaimer</h3>
        <p className="text-gray-400 text-xs leading-relaxed max-w-2xl mx-auto">
          Chila.com does not claim any analysis is accurate or reflects real-world fact. The diagnostic metrics, personality values, strengths, and stories are fictitiously produced by AI systems for user amusement. Please use responsibility and kindness when generating cards.
        </p>
      </div>
    </div>
  );
}
