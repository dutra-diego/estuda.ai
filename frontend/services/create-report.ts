import { api } from "@/lib/axios";
import type { ICreateReport, IReport } from "@/types/report";

export async function createReport(
	reportData: ICreateReport,
): Promise<IReport> {
	const { data } = await api.post<IReport>("/report", reportData);
	return data;
}
