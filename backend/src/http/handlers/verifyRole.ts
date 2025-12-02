import type { FastifyRequest } from "fastify";
import { AppError } from "../../lib/errors";
import type { JwtLoginType } from "../../schemas/jwtLogin-schema";

export const verifyUserRole = (requiredRole: "student" | "teacher") => {
	return async (request: FastifyRequest) => {
		try {
			const { role } = await request.jwtVerify<JwtLoginType>();

			if (role !== requiredRole) {
				throw new AppError(
					403,
					`Access denied. Route allowed only for: ${requiredRole}.`,
				);
			}
		} catch (_err) {
			throw new AppError(401, "Invalid or expired token.");
		}
	};
};
