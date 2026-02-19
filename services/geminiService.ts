import { GoogleGenAI } from "@google/genai";

// We will use gemini-2.5-flash-image for general image generation as per guidelines.
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateAIImage = async (prompt: string): Promise<Blob> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      // Using a basic config for 1:1 aspect ratio which is standard for test assets
      config: {
         imageConfig: {
           aspectRatio: "1:1"
         }
      }
    });

    // Extract image
    // The guideline says: "The output response may contain both image and text parts; you must iterate through all parts to find the image part."
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: part.inlineData.mimeType || 'image/png' });
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
