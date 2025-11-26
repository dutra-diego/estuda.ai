import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { JwtLoginType } from "../../schemas/jwtLogin-schema";
import { reportSchema } from "../../schemas/report-schema";
import { reportService } from "../../services/report-service";
import { verifyUserRole } from "../handlers/verifyRole";

export const reportRoutes: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/report",
		{ schema: { body: reportSchema }, preHandler: [verifyUserRole("teacher")] },
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			const report = await reportService.createReport(userId, req.body.classId);
			return reply.status(201).send(report);
		},
	);
	server.get(
		"/report/:classId",
		{
			schema: { params: reportSchema },
			preHandler: [verifyUserRole("teacher")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			const report = await reportService.getReport(userId, req.params.classId);
			return reply.status(200).send(report);
		},
	);

	server.patch(
		"/report",
		{ schema: { body: reportSchema }, preHandler: [verifyUserRole("teacher")] },
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			const report = await reportService.updateReport(userId, req.body.classId);
			return reply.status(200).send(report);
		},
	);
};
