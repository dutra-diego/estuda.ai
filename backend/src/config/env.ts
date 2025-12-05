import { z } from "zod";

function parseOrigin(val: unknown): string[] | undefined {
	if (val === undefined || val === null) return undefined;
	if (Array.isArray(val)) return val.map(String);
	if (typeof val !== "string") return undefined;

	const s = val.trim();
	if (s === "") return undefined;

	try {
		const parsed = JSON.parse(s);
		if (Array.isArray(parsed)) return parsed.map(String);
	} catch {
		return undefined;
	}

	return undefined;
}

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, "Error DATABASE_URL is required"),
	SECRET_JWT: z.string().min(1, "Error SECRET_JWT is required"),
	GOOGLE_API_KEY: z.string().min(1, "Error GOOGLE_API_KEY is required"),
	SALT_ROUNDS: z.coerce.number().min(1, "Error SALT_ROUNDS is required"),
	CORS_ORIGIN: z
		.preprocess(parseOrigin, z.array(z.string()))
		.default(["http://localhost:3000", "https://estuda-ai-three.vercel.app"]),
	PORT: z.coerce.number().min(1, "Error PORT is required"),
});
export const env = envSchema.parse(process.env);
