"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/react-query";
import { getInvitationsStudent } from "@/services/get-invitations-student";
import { updateInvitation } from "@/services/update-invitation";
import type { IInvitation } from "@/types/invitation";

export function DialogStudent() {
	const [open, setOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const { data: invitations } = useQuery({
		queryKey: ["invitations"],
		queryFn: getInvitationsStudent,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: Infinity,
	});

	const updateInvitationMutation = useMutation({
		mutationFn: updateInvitation,
		onMutate: async (updatedInvitation) => {
			await queryClient.cancelQueries({ queryKey: ["invitations"] });

			const previousInvitations = queryClient.getQueryData<IInvitation[]>([
				"invitations",
			]);

			queryClient.setQueryData<IInvitation[]>(["invitations"], (old = []) =>
				old.map((inv) =>
					inv.classId === updatedInvitation.classId
						? { ...inv, status: updatedInvitation.status }
						: inv,
				),
			);

			return { previousInvitations };
		},

		onError: (_err, _updatedInvitation, context) => {
			if (context?.previousInvitations) {
				queryClient.setQueryData(["invitations"], context.previousInvitations);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["invitations"] });
		},

		onSuccess: () => {
			queryClient.setQueryData<IInvitation[]>(["invitations"], (old = []) =>
				old.filter((inv) => inv.classId !== currentInvitation.classId),
			);

			const remainingInvitations = queryClient.getQueryData<IInvitation[]>([
				"invitations",
			]);

			if (remainingInvitations && remainingInvitations.length > 0) {
				if (currentIndex >= remainingInvitations.length) {
					setCurrentIndex(remainingInvitations.length - 1);
				}
			} else {
				setOpen(false);
			}
		},
	});

	useEffect(() => {
		if (invitations && invitations.length > 0) {
			setOpen(true);
			setCurrentIndex(0);
		}
	}, [invitations]);

	if (!invitations || invitations.length === 0) return null;

	const currentInvitation = invitations[currentIndex];
	const hasNext = currentIndex < invitations.length - 1;
	const hasPrevious = currentIndex > 0;

	const handleNext = () => {
		if (hasNext) setCurrentIndex(currentIndex + 1);
	};

	const handlePrevious = () => {
		if (hasPrevious) setCurrentIndex(currentIndex - 1);
	};

	const handleAccept = () => {
		updateInvitationMutation.mutate({
			id: currentInvitation.id,
			classId: currentInvitation.classId,
			status: "accepted",
		});
	};

	const handleReject = () => {
		updateInvitationMutation.mutate({
			id: currentInvitation.id,
			classId: currentInvitation.classId,
			status: "declined",
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Convite para {currentInvitation.class?.name || "uma turma"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						Você foi convidado para participar desta turma.
						<br />
						<span className="text-sm text-muted-foreground">
							Convite {currentIndex + 1} de {invitations.length}
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="flex-col sm:flex-row gap-2">
					<div className="flex gap-2 flex-1">
						<Button
							variant="outline"
							size="sm"
							onClick={handlePrevious}
							disabled={!hasPrevious}
						>
							← Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNext}
							disabled={!hasNext}
						>
							Próximo →
						</Button>
					</div>
					<div className="flex gap-2">
						<AlertDialogCancel onClick={handleReject}>
							Recusar
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleAccept}>
							Aceitar
						</AlertDialogAction>
					</div>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
