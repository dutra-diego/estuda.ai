import z from "zod";

export const classSchema = z.object({
	name: z.string().min(1).max(100),
});

export const updateClassSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1).max(100).optional(),
});

export type ClassType = z.infer<typeof classSchema>;
export type UpdateClassType = z.infer<typeof updateClassSchema>;
