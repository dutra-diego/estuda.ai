import z from "zod";

export const jwtLoginSchema = z.object({
	userId: z.uuid(),
	name: z.string(),
	email: z.email(),
	role: z.enum(["student", "teacher"]),
});

export type JwtLoginType = z.infer<typeof jwtLoginSchema>;
