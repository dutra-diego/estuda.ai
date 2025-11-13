import z from "zod";

export const geminiStudentSchema = z.object({
	difficulty: z.enum(["easy", "medium", "hard"]),
	text: z.string().min(1).max(500),
	sender: z.enum(["user", "ai"]),
});

export const geminiTeacherSchema = z.object({
	id: z.uuid(),
	messages: z.array(
		z.object({
			id: z.uuid(),
			text: z.string().min(1).max(500),
			sender: z.enum(["user", "ai"]),
		}),
	),
});

export type geminiTeacherSchemaType = z.infer<typeof geminiTeacherSchema>;
export type geminiStudentSchemaType = z.infer<typeof geminiStudentSchema>;
