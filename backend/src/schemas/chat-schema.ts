import z from "zod";

export const createChatSchema = z.object({
	title: z.string().min(1).max(100),
});

export const createChatWithMessageSchema = z.object({
	title: z.string().min(1).max(100),
	classId: z.uuid().optional(),
	text: z.string().min(1).max(1500),
	difficulty: z.enum(["easy", "medium", "hard"]),
	sender: z.enum(["user", "ai"]),
});

export const updateChatSchema = z.object({
	id: z.uuid(),
	title: z.string().min(1).max(100),
});
export const updateChatClassSchema = z.object({
	id: z.uuid(),
	classId: z.uuid(),
});
export const paramsChatSchema = z.object({
	userId: z.uuid(),
});

export type CreateChatType = z.infer<typeof createChatSchema>;
export type CreateChatWithMessageType = z.infer<
	typeof createChatWithMessageSchema
>;
export type updateChatClassType = z.infer<typeof updateChatClassSchema>;
export type UpdateChatType = z.infer<typeof updateChatSchema>;
export type ParamsChatType = z.infer<typeof paramsChatSchema>;
