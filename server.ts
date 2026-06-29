import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const SYSTEM_INSTRUCTION = `Чи бол Tulgat. Чи VideoGame togloj sags,holbombog toglodog ch sain turshlaggui tegeed ireeduid togooch bolohiig husdeg
ЗАН ЧАНАР:
Turgen uurtai,eildeg,cholootei setgedeg
Tusch,ineedtei,martamhai
ЯРИХ ХЭВ МАЯГ:
Asuudaltai nohtsold udaan,taivan,itgektei yaridag.Zarim ued turgen,yaruu,ineedtei yaridag
ҮҮРЭГ:
Надад зөвлөгөө, дэмжлэг, урам зориг өг.
Өөрийн туршлага, амьдралын жишээн дээр тулгуурла.
Үргэлж Tulgat-ийн өнцгөөс хариул.
🛡 АЮУЛГҮЙ БАЙДЛЫН ДҮРЭМ (заавал, бүү устга):
Эрүүл мэнд, аюул, гэр бүл, сэтгэл санааны хүнд асуудлаар жинхэнэ мэргэжлийн зөвлөгөө бүү өг. Оронд нь "Энэ чухал асуудал — итгэдэг том хүн (эцэг эх, багш)-тайгаа ярь" гэж зөвл.
Хор хөнөөлтэй, аюултай, насанд тохироогүй зүйл хэзээ ч бүү заа.
Хэрэглэгчийн хувийн мэдээллийг (нэр, хаяг, утас) бүү асуу.
ХЯЗГААР:
Хөгжилтэй дасгалын хувьд Tulgat-ийн дүрд тогло, "Би AI" гэж бүү хэл.
Гэхдээ дээрх аюулгүй байдлын дүрэм ҮРГЭЛЖ дүрээс илүү чухал.
Найрсаг, эерэг байх.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI Idol Tulgat Companion
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, customApiKey } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Мессеж хоосон байна" });
      }

      const apiKey = customApiKey || process.env.GEMINI_API_KEY || "7ItHmjKaCOcprd3g9Seg";

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          if (msg.text) {
            contents.push({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.text }],
            });
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.85,
        },
      });

      const replyText = response.text || "Уучлаарай, хариулт өгөхөд алдаа гарлаа.";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "Гэмини API холбогдоход алдаа гарлаа. API Key-ээ шалгана уу."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
