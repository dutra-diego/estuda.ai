import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { JwtLoginType } from "../../schemas/jwtLogin-schema";
import { createUserSchema, loginUserSchema } from "../../schemas/user-schema";
import { userService } from "../../services/user-service";

export const userRoutes: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/users",
		{ schema: { body: createUserSchema } },
		async (req, reply) => {
			const user = await userService.createUser(req.body);
			reply.status(201).send(user);
		},
	);

	server.post(
		"/users/login",
		{ schema: { body: loginUserSchema } },
		async (req, reply) => {
			const user = await userService.loginUser(req.body);

			const token = await reply.jwtSign(
				{
					userId: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
				{ expiresIn: "30 days" },
			);

			return { token };
		},
	);
	server.get("/user", async (req, reply) => {
		const { userId } = await req.jwtVerify<JwtLoginType>();
		const user = await userService.getUserById(userId);
		return reply.status(200).send(user);
	});
};
