
import { GoogleGenAI } from "@google/genai";
import { TranslationStyle } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const translateText = async (
    text: string,
    targetLanguage: string,
    style: TranslationStyle
): Promise<string> => {
    try {
        const prompt = `Translate the following text into ${targetLanguage}.
        The translation style should be: ${style}.
        Do not add any introductory phrases like "Here is the translation:".
        Only return the translated text.

        Text to translate:
        ---
        ${text}
        ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error in translateText:", error);
        return `Error: Could not translate.`;
    }
};

export const transcribeAndFormatToSrt = async (
    audioBase64: string,
    language: string
): Promise<string> => {
    try {
        const audioPart = {
            inlineData: {
                mimeType: 'audio/wav',
                data: audioBase64,
            },
        };

        const textPart = {
            text: `This is an audio file in ${language}. 
            1. Transcribe the audio content accurately.
            2. After transcribing, format the entire transcript into a standard SRT (SubRip Text) file format.
            3. Create logical timestamps (HH:MM:SS,msl --> HH:MM:SS,msl) for each subtitle block based on natural speaking pauses.
            4. Ensure the output is ONLY the valid SRT content and nothing else. Do not include any extra text, explanations, or code fences like \`\`\`srt.
            `,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
        });

        // Clean up the response to ensure it's a valid SRT.
        // Remove potential code block fences and leading/trailing whitespace.
        let srtResult = response.text;
        srtResult = srtResult.replace(/^```srt\n/i, '');
        srtResult = srtResult.replace(/\n```$/, '');
        
        return srtResult.trim();
    } catch (error) {
        console.error("Error in transcribeAndFormatToSrt:", error);
        throw new Error("Failed to transcribe audio and format to SRT.");
    }
};