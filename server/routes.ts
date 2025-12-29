import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.analyze.path, async (req, res) => {
    try {
      const { image, template, targetLocked } = api.analyze.input.parse(req.body);

      // Call OpenAI Vision
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using gpt-4o for vision capabilities
        messages: [
          {
            role: "system",
            content: `You are a professional videography guide. Analyze the image to provide optimal angles and lighting. 
            ${template ? `The user wants a "${template}" shot.` : ""}
            ${targetLocked ? `A target is locked at position: x=${targetLocked.x}, y=${targetLocked.y}, width=${targetLocked.width}, height=${targetLocked.height}.` : ""}
            Return a JSON object with:
            - "action": One of "UP", "DOWN", "LEFT", "RIGHT", "FORWARD", "BACKWARD", "OK" indicating how the user should move the camera.
            - "advice": A short, cinematic tip (max 15 words).`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this scene." },
              {
                type: "image_url",
                image_url: {
                  url: image, // Base64
                  detail: "low" // Optimization to keep payload small and fast
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No response from AI");

      const result = JSON.parse(content);
      
      // Store in DB for history
      await storage.createSnapshot({
        advice: result.advice,
        action: result.action,
        template,
        targetLocked,
      });

      res.json(result);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  app.get(api.snapshots.list.path, async (req, res) => {
    const snapshots = await storage.getSnapshots();
    res.json(snapshots);
  });

  return httpServer;
}
