import { api } from "@/lib/axios";
import type { IInvitation } from "@/types/invitation";

export async function createInvitation(invite: IInvitation) {
	await api.post("/invitation", invite);
}
