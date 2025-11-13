import { api } from "@/lib/axios";
import type { IUpdateInvitation } from "@/types/invitation";

export async function updateInvitation(invite: IUpdateInvitation) {
	await api.patch("/invitation", invite);
}
