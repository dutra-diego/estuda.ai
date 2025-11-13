import z from "zod";

export const createInvitationSchema = z.object({
	classId: z.uuid(),
	email: z.email(),
	studentId: z.uuid().optional(),
	status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
	createdAt: z.date().default(new Date()),
});

export const invitationParamsSchema = z.object({
	classId: z.uuid(),
});

export const updateInvitationSchema = z.object({
	id: z.uuid(),
	classId: z.uuid(),
	status: z.enum(["accepted", "rejected"]),
});

export type CreateInvitationType = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationType = z.infer<typeof updateInvitationSchema>;
