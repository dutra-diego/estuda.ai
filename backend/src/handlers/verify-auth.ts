import type { FastifyRequest } from "fastify";
import type { JwtLoginType } from "../schemas/jwtLogin-schema";

export async function verifyAuth(request: FastifyRequest) {
	const { userId } = await request.jwtVerify<JwtLoginType>();
	if (!userId) {
		throw new Error("Unauthorized");
	}
}
