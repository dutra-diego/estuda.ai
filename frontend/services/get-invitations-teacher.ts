import { api } from "@/lib/axios";
import type { IInvitationsByTeacher } from "@/types/invitation";

export async function getInvitationsTeacher(
	classId: string,
): Promise<IInvitationsByTeacher[]> {
	const { data } = await api.get<IInvitationsByTeacher[]>(
		`/invitation/${classId}`,
	);
	return data;
}
