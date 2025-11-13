import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
	createInvitationSchema,
	invitationParamsSchema,
	updateInvitationSchema,
} from "../../schemas/invitation";
import type { JwtLoginType } from "../../schemas/jwtLogin-schema";
import { invitationService } from "../../services/invitation-service";
import { verifyUserRole } from "../handlers/verifyRole";

export const invitationRoutes: FastifyPluginAsyncZod = async (server) => {
	server.post(
		"/invitation",
		{
			schema: { body: createInvitationSchema },
			preHandler: [verifyUserRole("teacher")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			const invitation = await invitationService.createInvitation(
				userId,
				req.body,
			);
			return reply.status(201).send(invitation);
		},
	);
	server.get(
		"/invitation",
		{
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { email } = await req.jwtVerify<JwtLoginType>();

			const invitations =
				await invitationService.getInvitationsByStudent(email);
			return reply.status(200).send(invitations);
		},
	);
	server.get(
		"/invitation/:classId",
		{
			schema: { params: invitationParamsSchema },
			preHandler: [verifyUserRole("teacher")],
		},
		async (req, reply) => {
			const { userId } = await req.jwtVerify<JwtLoginType>();

			const invitation = await invitationService.getInvitationByTeacher(
				req.params.classId,
				userId,
			);

			if (!invitation) {
				return reply.status(404).send({ error: "Invitation not found" });
			}
			return reply.status(200).send(invitation);
		},
	);
	server.patch(
		"/invitation",
		{
			schema: { body: updateInvitationSchema },
			preHandler: [verifyUserRole("student")],
		},
		async (req, reply) => {
			const { email, userId } = await req.jwtVerify<JwtLoginType>();
			await invitationService.updateInvitation(email, userId, req.body);
			return reply.status(204).send();
		},
	);
};
