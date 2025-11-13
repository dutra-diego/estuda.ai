import type { FastifyReply, FastifyRequest } from "fastify";
import type { JwtLoginType } from "../../schemas/jwtLogin-schema";

export const verifyUserRole = (requiredRole: "student" | "teacher") => {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			const { role } = await request.jwtVerify<JwtLoginType>();

			if (role !== requiredRole) {
				return reply.status(403).send({
					message: `Acesso negado. Rota permitida apenas para: ${requiredRole}.`,
				});
			}
		} catch (_err) {
			return reply.status(401).send({ message: "Token inválido ou expirado." });
		}
	};
};
