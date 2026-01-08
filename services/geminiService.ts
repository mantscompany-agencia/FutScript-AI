
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptRequest, GeneratedScript, GeneratedImage } from "../types";

export class GeminiService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateScript(params: ScriptRequest): Promise<GeneratedScript> {
    const prompt = `
      Você é um redator sênior especializado em roteiros de futebol para vídeos curtos (Reels, TikTok, Shorts).
      Gere um roteiro de 30 a 45 segundos sobre: "${params.topic}".
      
      OBJETIVO: ${params.goal}
      PÚBLICO-ALVO: ${params.audience}
      TOM: ${params.tone}

      O roteiro DEVE ser em Português do Brasil, humanizado, natural e persuasivo.
      Use técnicas de copywriting como curiosidade, FOMO e urgência.
      O CTA deve SEMPRE conduzir para o link na bio.

      RETORNE APENAS UM JSON no seguinte formato:
      {
        "hook": "Gancho inicial impactante (primeiros 3 segundos)",
        "body": "Desenvolvimento narrativo envolvente",
        "cta": "Chamada para ação final direcionando à bio",
        "fullScript": "O texto completo para leitura fluída"
      }
      
      Use informações atualizadas sobre o futebol mundial consultando as últimas notícias.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
            fullScript: { type: Type.STRING }
          },
          required: ["hook", "body", "cta", "fullScript"]
        }
      },
    });

    const data = JSON.parse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    return { ...data, sources };
  }

  async generateImages(topic: string, script: string): Promise<GeneratedImage[]> {
    // 1. First, generate 10 specific prompts for the sketches based on the script
    const promptGen = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `Com base neste roteiro de futebol: "${script}", gere 10 descrições visuais curtas para ilustrações em estilo SKETCH (esboço). 
          Foque em jogadores, estádios, expressões faciais, lances de gol. 
          Retorne apenas um array JSON de strings.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const visualPrompts: string[] = JSON.parse(promptGen.text);
    
    // 2. Map visual prompts to image generations
    const imagePromises = visualPrompts.map(async (vPrompt, index) => {
      const fullPrompt = `Pencil sketch drawing, charcoal style, dynamic football scene: ${vPrompt}. Professional artistic style, high contrast, clean background, consistent identity.`;
      
      const res = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: {
          imageConfig: { aspectRatio: "9:16" }
        }
      });

      let base64 = "";
      for (const part of res.candidates[0].content.parts) {
        if (part.inlineData) {
          base64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      return {
        id: `img-${index}`,
        url: base64,
        prompt: vPrompt
      };
    });

    return Promise.all(imagePromises);
  }
}
