
import { GoogleGenAI, Modality } from "@google/genai";
import type { EditedImageResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImageWithGemini = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<EditedImageResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const result: EditedImageResult = { image: null, text: null };

        if (response.candidates && response.candidates.length > 0) {
            const parts = response.candidates[0].content.parts;
            for (const part of parts) {
                if (part.text) {
                    result.text = part.text;
                } else if (part.inlineData) {
                    result.image = part.inlineData.data;
                }
            }
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to edit image with AI. Please check the console for more details.");
    }
};
