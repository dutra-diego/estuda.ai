import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";

export const gemini = new GoogleGenAI({
	apiKey: env.GOOGLE_API_KEY,
	
});
