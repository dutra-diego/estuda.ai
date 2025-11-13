import { z } from "zod";

const envSchema = z.object({
	SECRET_JWT: z.string().min(1, "Error SECRET_JWT is required"),
	GOOGLE_API_KEY: z.string().min(1, "Error GOOGLE_API_KEY is required"),
	SALT_ROUNDS: z.coerce.number().min(1, "Error SALT_ROUNDS is required"),
	PORT: z.coerce.number().min(1, "Error PORT is required"),
});
export const env = envSchema.parse(process.env);
