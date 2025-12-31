import { GoogleGenAI, Type } from "@google/genai";
import { AiResponseSchema } from '../types';

export const parseAudioTransaction = async (audioBase64: string, mimeType: string): Promise<AiResponseSchema> => {
  // Use gemini-3-flash-preview for high reliability and speed
  const modelId = "gemini-3-flash-preview"; 
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expert Thai accountant assistant.
    The user provides audio of financial transactions.
    
    CRITICAL RULES:
    1. STRICT MAPPING: Extract ONLY the transactions explicitly spoken. 1 mentioned amount = 1 transaction. 
    2. NO HALLUCINATION: Do NOT invent extra items. If you hear "500", return EXACTLY ONE transaction.
    3. SHORT INPUTS: If the user says only a number (e.g., "500" or "ห้าร้อย"), create one entry:
       - Description: "Spoken amount"
       - Category: "Other"
       - Amount: the number
       - Type: "EXPENSE" (default)
    4. THAI CONTEXT: Descriptions should be in Thai if possible (e.g., "ค่าอาหาร", "ค่าเดินทาง").
    5. DATA TYPES: Amount must be a NUMBER. Date is YYYY-MM-DD. Today is ${new Date().toISOString().split('T')[0]}.
    
    JSON format only. Do not include any text outside the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          { text: "Extract exactly what was spoken into JSON. Do not add extra entries." }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
                  date: { type: Type.STRING, description: "ISO 8601 date string YYYY-MM-DD" }
                },
                required: ["description", "category", "amount", "type"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      console.error("Empty response from Gemini");
      throw new Error("No response from AI");
    }
    
    const parsed = JSON.parse(text) as AiResponseSchema;
    
    // Safety check: ensure we don't return null or empty if the AI hallucinated an empty object
    if (!parsed.transactions) {
      return { transactions: [] };
    }

    return parsed;

  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    throw error;
  }
};