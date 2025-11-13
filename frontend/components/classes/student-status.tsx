export type Status = "accepted" | "pending" | "rejected";

interface StudentStatusProps {
	status: Status;
}

const orderStatusMap: Record<Status, string> = {
	accepted: "Aceito",
	pending: "Pendente",
	rejected: "Rejeitado",
};
export function StudentStatus({ status }: StudentStatusProps) {
	return (
		<div className="flex items-center gap-2">
			{status === "pending" && (
				<span
					data-testid="badge"
					className="h-2 w-2 rounded-full bg-slate-400"
				/>
			)}
			{status === "rejected" && (
				<span
					data-testid="badge"
					className="h-2 w-2 rounded-full bg-rose-500"
				/>
			)}
			{status === "accepted" && (
				<span
					data-testid="badge"
					className="h-2 w-2 rounded-full bg-emerald-500"
				/>
			)}

			<span className="font-medium text-muted-foreground ">
				{orderStatusMap[status]}
			</span>
		</div>
	);
}
