"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Report } from "@/components/classes/report";
import { StudentInvitation } from "@/components/classes/student-invitation";
import { StudentStatus } from "@/components/classes/student-status";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { FormTypeContext } from "@/contexts/form-context";
import { queryClient } from "@/lib/react-query";
import { createReport } from "@/services/create-report";
import { getInvitationsTeacher } from "@/services/get-invitations-teacher";
import { getReport } from "@/services/get-report";
import { updateReport } from "@/services/update-report";
import type { IReport } from "@/types/report";

export default function Page() {
	const router = useRouter();
	const { user, setActiveChat } = useContext(FormTypeContext);
	const [actuallyPage, setActuallyPage] = useState<"report" | "students">(
		"report",
	);

	const slug = useParams().slug as string;
	useEffect(() => {
		setActiveChat(slug);
	});
	const {
		data: report,
		isLoading: reportLoading,
	} = useQuery({
		queryKey: ["report", slug],
		queryFn: () => getReport(slug),
		enabled: !!user && actuallyPage === "report",
		refetchOnWindowFocus: false,
		retry: false,
	});

	const {
		data: invitations,
		isLoading: invitationsLoading,
		isError: invitationsError,
	} = useQuery({
		queryKey: ["invitations", slug],
		queryFn: () => getInvitationsTeacher(slug),
		enabled: !!user && actuallyPage === "students",
		refetchOnWindowFocus: false,
		retry: false,
	});

	
	const createReportMutation = useMutation({
		mutationFn: () => createReport({ classId: slug }),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["report", slug] });

			const previousReport = queryClient.getQueryData<IReport>([
				"report",
				slug,
			]);

			const tempReport: IReport = {
				content: "Gerando relatório...",
				class: report?.class || { name: "Carregando..." },
			};

			queryClient.setQueryData<IReport>(["report", slug], tempReport);

			if (actuallyPage !== "report") {
				setActuallyPage("report");
			}

			return { previousReport };
		},

		onError: (_err, _vars, context) => {
			if (context?.previousReport) {
				queryClient.setQueryData(["report", slug], context.previousReport);
			} else {
				queryClient.setQueryData(["report", slug], null);
			}
			toast.error("Erro ao criar relatório. Tente novamente.");
		},

		onSuccess: (data: IReport) => {
			if (!data || data.content.length === 0) {
				toast.warning(
					"Não há chats vinculados a esta turma para gerar o relatório.",
				);
				queryClient.setQueryData(["report", slug], null);
			} else {
				toast.success("Relatório criado com sucesso!");
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["report", slug] });
		},
	});

	const updateReportMutation = useMutation({
		mutationFn: () => updateReport({ classId: slug }),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["report", slug] });

			const previousReport = queryClient.getQueryData<IReport>([
				"report",
				slug,
			]);

			const tempReport: IReport = {
				content: "Gerando relatório...",
				class: report?.class || { name: "Carregando..." },
			};

			queryClient.setQueryData<IReport>(["report", slug], tempReport);

			if (actuallyPage !== "report") {
				setActuallyPage("report");
			}

			return { previousReport };
		},

		onError: (_err, _vars, context) => {
			if (context?.previousReport) {
				queryClient.setQueryData(["report", slug], context.previousReport);
			} else {
				queryClient.setQueryData(["report", slug], null);
			}
			toast.error("Erro ao criar relatório. Tente novamente.");
		},

		onSuccess: () => {
			toast.success("Relatório atualizado com sucesso!");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["report", slug] });
		},
	});

	return (
		<div className="w-full flex flex-col items-center lg:justify-center p-2 space-y-2 ">
			<div className="flex w-11/12 justify-between py-2">
				<div className="flex space-x-1">
					<Button
						variant={"link"}
						className={` ${actuallyPage === "report" ? "underline text-blue-400" : ""}`}
						onClick={() => setActuallyPage("report")}
					>
						Relatório
					</Button>
					<div className="border-zinc-700 border-r self-center w-0 h-4" />
					<Button
						variant={"link"}
						className={` ${actuallyPage === "students" ? "underline text-blue-400" : ""}`}
						onClick={() => setActuallyPage("students")}
					>
						Alunos
					</Button>
				</div>
				{report?.content ? (
					<Button
						className="flex self-end"
						onClick={() => updateReportMutation.mutate()}
					>
						Atualizar Relatório
					</Button>
				) : (
					<Button
						className="flex self-end"
						onClick={() => createReportMutation.mutate()}
					>
						Criar Relatório
					</Button>
				)}
			</div>
			<StudentInvitation classId={slug} />
			<div className="w-11/12 p-3 h-[580px] lg:h-[600px] border border-zinc-500 rounded-md overflow-y-auto scrollbar-thin scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-thumb-gray-800 scrollbar-track-gray-900 scrollbar-hover:scrollbar-thumb-gray-600">
				{actuallyPage === "report" ? (
					reportLoading ? (
						<Spinner className="size-8 h-96 self-center justify-self-center" />
					) : report?.content ? (
						<>
							<h1 className="text-2xl p-2">
								Relatório da turma {report?.class?.name || ""}
							</h1>
							<div className="leading-relaxed p-2 w-11/12 text-lg">
								<Report content={report.content} />
							</div>
						</>
					) : (
						<div className="flex items-center justify-center h-full text-zinc-400">
							<p>Nenhum relatório disponível.</p>
						</div>
					)
				) : invitationsLoading ? (
					<Spinner className="size-8 h-96 self-center justify-self-center" />
				) : invitationsError ? (
					<div className="flex items-center justify-center h-full text-zinc-400">
						<p>Erro ao carregar convites. Tente novamente.</p>
					</div>
				) : !invitations || invitations.length === 0 ? (
					<div className="flex items-center justify-center h-full text-zinc-400">
						<p>Nenhum convite encontrado. Adicione um aluno para começar.</p>
					</div>
				) : (
					<Table className="">
						<TableCaption className="py-2">
							Lista de convites enviados para esta turma.
						</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[360px]">Nome / Email</TableHead>
								<TableHead>Convite</TableHead>
								<TableHead className="text-center">Chamado</TableHead>
								<TableHead className="text-center">Aceito</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className="">
							{invitations.map((invitation) => (
								<TableRow key={invitation.id}>
									<TableCell className="font-medium">
										{invitation.student?.user?.name || invitation.email}
									</TableCell>
									<TableCell>
										<StudentStatus status={invitation.status} />
									</TableCell>
									<TableCell className="text-center">
										{new Date(invitation.createdAt).toLocaleDateString("pt-BR")}
									</TableCell>
									<TableCell className="text-center">
										{invitation.student?.joinedAt
											? new Date(
													invitation.student?.joinedAt,
												).toLocaleDateString("pt-BR")
											: "Pendente"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}
