import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { classSchema, updateClassSchema } from "../../schemas/class-schema";
import type { JwtLoginType } from "../../schemas/jwtLogin-schema";
import { classService } from "../../services/class-service";
import { verifyUserRole } from "../handlers/verifyRole";

export const classRoutes: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/class",
		{
			schema: { body: classSchema },
			preHandler: [verifyUserRole("teacher")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			const id = await classService.createClass(userId, req.body);
			return reply.status(201).send(id);
		},
	);
	server.patch(
		"/class",
		{
			schema: { body: updateClassSchema },
			preHandler: [verifyUserRole("teacher")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			await classService.updateClass(userId, req.body);
			return reply.status(204).send();
		},
	);
	server.get(
		"/class",

		async (req, reply) => {
			const { userId, role } = await req.jwtVerify<JwtLoginType>();
			if (role === "student") {
				const classes = await classService.getClassesByStudent(userId);
				return reply.status(200).send(classes);
			}
			const classes = await classService.getClassesByTeacher(userId);

			return reply.status(200).send(classes);
		},
	);
};
