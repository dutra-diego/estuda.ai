import z from "zod";

export const createUserSchema = z.object({
	email: z.email(),
	name: z.string().min(2).max(100),
	password: z.string().min(6).max(100),
	role: z.enum(["student", "teacher"]),
});

export const loginUserSchema = z.object({
	email: z.email(),
	password: z.string().min(6).max(100),
});

export type CreateUserType = z.infer<typeof createUserSchema>;
export type LoginUserType = z.infer<typeof loginUserSchema>;
