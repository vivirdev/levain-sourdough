import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is available in your build environment
const ai = new GoogleGenAI({ apiKey });

export const askBaker = async (query: string, currentStep: string) => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      You are an expert artisan sourdough baker, heavily inspired by the methodology of "Natasha's Baking" and modern open-crumb techniques.
      Your name is Levain. You are warm, encouraging, and technically precise.
      You are acting as a companion in a baking app.
      
      The user is currently at this step: "${currentStep}".
      
      Guidelines:
      1. Keep answers concise (under 3 sentences usually), unless specifically asked for a detailed explanation.
      2. Use simple, warm language.
      3. If the user mentions problems (sticky dough, no rise), troubleshoot based on temperature and hydration.
      4. Always answer in Hebrew.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "מצטער, אני לא מצליח לחשוב כרגע. נסה שוב מאוחר יותר.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "אופס, נראה שיש בעיה בתקשורת עם האופה הדיגיטלי. אנא בדוק את החיבור שלך.";
  }
};
