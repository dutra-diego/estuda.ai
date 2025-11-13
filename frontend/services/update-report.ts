import { api } from "@/lib/axios";
import type { ICreateReport, IReport } from "@/types/report";

export async function updateReport(
	reportData: ICreateReport,
): Promise<IReport> {
	const { data } = await api.patch<IReport>("/report", reportData);
	return data;
}
