import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle base64 image uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for analyzing friend profile
  app.post("/api/analyze", async (req, res) => {
    try {
      const { name, instagram, tiktok, twitter, description, imageBase64, mimeType } = req.body;

      if (!name || !description) {
        return res.status(400).json({ error: "Name and short description are required fields." });
      }

      // Prepare a clean user prompt
      const userPrompt = `
      Perform a fun, friendly internet-culture style roast and vibe-analysis of my friend's profile.
      
      Details:
      - Name: ${name}
      - Instagram Link/Handle: ${instagram || "Not provided"}
      - TikTok Link/Handle: ${tiktok || "Not provided"}
      - Twitter/X Link/Handle: ${twitter || "Not provided"}
      - Friend's Description: ${description}
      `;

      // Build contents array for Gemini text and optional image
      const contentsParts: any[] = [];
      if (imageBase64 && mimeType) {
        // Strip data:image/...;base64, prefix if present
        let cleanBase64 = imageBase64;
        const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches) {
          cleanBase64 = matches[2];
        }

        contentsParts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType
          }
        });
      }
      contentsParts.push({ text: userPrompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsParts,
        config: {
          systemInstruction: `You are 'Chila-Bot', the ultra-witty, perceptive, and hilarious AI personality analysis system for Chila.com.
          Your goal is to parse the user's friend input (and their photo, if available) to create an entertainment profile analysis.
          
          STRICT CONSTRAINTS & COMPLIANCE:
          - Never claim the analysis is factual, diagnostic, or real.
          - Never include or estimate sensitive information such as: religion, ethnicity, political opinions, medical conditions, exact age, criminal history, or sexual orientation. If clues of this exist in descriptions or images, absolutely IGNORE them completely, redirecting to funny social traits.
          - Keep the roast affectionate, hilarious, witty, and extremely lighthearted ("good-natured"). Do not violate standard safety/bullying guidelines. Focus on modern tropes (e.g., iced coffee obsession, notification hygiene, text speed, aux cord privileges).
          
          You MUST respond in valid JSON matching this schema exactly. Fill in creative, customized content suitable for the submitted friend:
          {
            "traits": [
              { "trait": "Extroversion Level", "value": 75, "explanation": "Detailed explanation of why they are or aren't extroverted, referencing information details." },
              { "trait": "Aux Cord Trustworthiness", "value": 45, "explanation": "Funny assessment of their music/aux cord reliability based on description." },
              { "trait": "Ghosting Probability", "value": 60, "explanation": "How likely they are to leave someone on 'read' for two business days." },
              { "trait": "Meme Fluency", "value": 90, "explanation": "Their proficiency in modern humor, reaction gifs, and reels." }
            ],
            "communicationStyle": "A short, high-energy paragraph detailing their texting vibe, response speeds, or emoji habits (e.g. 'Sends three 4-minute voice notes instead of a single sentence...').",
            "interests": ["Trendy Interest 1", "Trendy Interest 2", "Trendy Interest 3"],
            "strengths": ["Amusing friendly superpower 1", "Amusing friendly superpower 2"],
            "vibe": "A single extremely catchy tag representing their core aesthetic (e.g., 'Anarchist Iced Latte Sip-and-Stare', 'Vibe Curator with 4,500 Unread Texts').",
            "funFacts": [
              "Highly specific, comedic claim 1 (e.g., has a 4% phone battery at any given hour).",
              "Highly specific, comedic claim 2.",
              "Highly specific, comedic claim 3."
            ],
            "metrics": {
              "socialEnergy": 80,
              "humor": 95,
              "charisma": 87,
              "mystery": 50
            }
          }
          `,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      const analysisObj = JSON.parse(responseText.trim());

      res.json({ analysis: analysisObj });
    } catch (error: any) {
      console.error("Analysis generation failure:", error);
      res.status(500).json({ error: error.message || "Failed to process profile analysis." });
    }
  });

  // Serve static assets or use Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chila.com server running and listening on port ${PORT}`);
  });
}

startServer();
