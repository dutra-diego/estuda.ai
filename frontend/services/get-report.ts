import { api } from "@/lib/axios";
import type { IReport } from "@/types/report";

export async function getReport(classId: string): Promise<IReport> {
	const { data } = await api.get<IReport>(`/report/${classId}`);
	return data;
}
