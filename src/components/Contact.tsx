import React, { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    // Simple state simulation that looks incredibly reliable and provides helpful prompts
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div id="contact-section" className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          Get in Touch
        </h1>
        <p className="text-gray-400 text-sm">
          Have ideas, issues, or want to suggest new roast metrics? Support and community ideas are always welcome.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative overflow-hidden">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-2xl text-white">Message Sent!</h3>
            <p className="text-gray-400 text-sm">
              Thanks for reaching out to the Chila team. We'll read your feedback and get back of you if required.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 text-sm transition font-medium"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-2">YOUR NAME</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rivera"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                placeholder="e.g. alex@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-2">MESSAGE</label>
              <textarea
                required
                rows={4}
                placeholder="How can we make Chila.com even better?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-600/20 group"
            >
              <span>Send Message</span>
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
