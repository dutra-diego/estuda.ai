import { api } from "@/lib/axios";
import type { IInvitationsByStudent } from "@/types/invitation";

export async function getInvitationsStudent(): Promise<
	IInvitationsByStudent[]
> {
	const { data } = await api.get<IInvitationsByStudent[]>("/invitation");
	return data;
}
