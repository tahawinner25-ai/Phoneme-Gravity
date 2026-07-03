import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import "dotenv/config";
import { GoogleGenAI, Modality } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // TTS Endpoint utilisant Gemini 3.1 TTS Preview avec support des accents africains
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, language, accent } = req.body;
      if (!text) return res.status(400).json({ error: "Text required" });

      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!geminiKey) return res.status(500).json({ error: "No API key configured" });

      const client = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      // Configuration de la voix par défaut et du guidage d'accent
      let voiceName = "Zephyr"; 
      let promptText = text;

      if (accent) {
        if (accent === "marocain") {
          voiceName = "Zephyr";
          promptText = `[Prononcez le mot français "${text}" avec un accent marocain authentique : un léger roulement du 'r', une articulation claire et la cadence caractéristique de la Darija marocaine.]`;
        } else if (accent === "senegalais") {
          voiceName = "Zephyr";
          promptText = `[Prononcez le mot français "${text}" avec un accent sénégalais / wolof-français chaleureux : des voyelles bien ouvertes, un rythme vocalique typique de Dakar et une douceur mélodique.]`;
        } else if (accent === "congolais") {
          voiceName = "Zephyr";
          promptText = `[Prononcez le mot français "${text}" avec un accent congolais expressif et chantant, issu du métissage linguistique lingala-français : intonation rythmée, voyelles pleines.]`;
        } else if (accent === "kenyan") {
          voiceName = "Puck";
          promptText = `[Pronounce the word "${text}" with a distinct, warm Kenyan English accent: clear syllable-timed pronunciation, slight hardening of consonants, and local East African resonance.]`;
        } else if (accent === "sud_africain") {
          voiceName = "Puck";
          promptText = `[Pronounce the word "${text}" with a deep, crisp South African English accent: rich resonance, Zulu/Xhosa-influenced phonetics, and characteristic clean articulation.]`;
        }
      } else {
        if (language === "English") {
          voiceName = "Puck";
          promptText = `[British accent, natural cadence, friendly, expert enunciation] ${text}`;
        } else if (language === "French") {
          voiceName = "Zephyr";
          promptText = `[chaleureux, voix douce, excellente diction française d'instituteur] ${text}`;
        }
      }
      
      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        res.status(500).json({ error: "No audio generated" });
      }
    } catch (e) {
      console.error("TTS API Error:", e);
      res.status(500).json({ error: String(e) });
    }
  });

  // Chargement de Vite et Fallbacks SPA
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
