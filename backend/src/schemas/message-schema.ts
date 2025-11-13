import z from "zod";

export const messageIdParamSchema = z.object({
	chatId: z.uuid(),
});
export const createMessageSchema = z.object({
	difficulty: z.enum(["easy", "medium", "hard"]),
	text: z.string().min(1).max(1500),
	sender: z.enum(["user", "ai"]),
});
export const createMessageArraySchema = createMessageSchema.array();

export type CreateMessageType = z.infer<typeof createMessageSchema>;
export type CreateMessageArrayType = z.infer<typeof createMessageArraySchema>;
export type MessageIdParamType = z.infer<typeof messageIdParamSchema>;
