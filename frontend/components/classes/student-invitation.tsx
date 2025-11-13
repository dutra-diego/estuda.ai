import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { queryClient } from "@/lib/react-query";
import { createInvitation } from "@/services/create-invitation";
import type { IInvitation } from "@/types/invitation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const formSchema = z.object({
	email: z.email("Digite um email válido"),
});

type typeForm = z.infer<typeof formSchema>;

type StudentInvitationProps = {
	classId: string;
};

export function StudentInvitation({ classId }: StudentInvitationProps) {
	const {
		handleSubmit,
		register,
		formState: { errors },
		reset,
	} = useForm<typeForm>({
		resolver: zodResolver(formSchema),
		mode: "onTouched",
	});

	const studentMutate = useMutation({
		mutationFn: createInvitation,

		onMutate: async (newInvitation) => {
			await queryClient.cancelQueries({ queryKey: ["invitations", classId] });
			const previousInvitations = queryClient.getQueryData<IInvitation[]>([
				"invitations",
				classId,
			]);

			const tempInvitation: IInvitation = {
				id: crypto.randomUUID(),
				classId: classId,
				email: newInvitation.email,
				status: "pending",
				createdAt: new Date().toISOString(),
				acceptedAt: null,
			};

			queryClient.setQueryData<IInvitation[]>(
				["invitations", classId],
				(old = []) => [...old, tempInvitation],
			);
			return { previousInvitations };
		},

		onError: (_err, _newInvitation, context) => {
			if (context?.previousInvitations) {
				queryClient.setQueryData(
					["invitations", classId],
					context.previousInvitations,
				);
			}
			toast.error("Erro ao enviar convite. Tente novamente.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["invitations", classId] });
		},
		onSuccess: () => {
			toast.success("Convite enviado com sucesso!");
			reset();
		},
	});

	const onValid: SubmitHandler<typeForm> = async (data) => {
		studentMutate.mutate({
			classId: classId,
			email: data.email,
			status: "pending",
		});
	};

	const onInvalid = () => {
		toast.error("Por favor, preencha todos os campos corretamente.");
	};

	return (
		<div className="w-11/12 h-20 flex">
			<form
				className="flex items-center space-x-2"
				onSubmit={handleSubmit(onValid, onInvalid)}
			>
				<label className="md:w-44 md:-mr-0.5" htmlFor="new-student">
					Novo aluno:
				</label>
				<Input
					id="new-student"
					className={`${errors.email ? "border-red-500" : ""} -pl-2`}
					placeholder="Digite o e-mail do aluno"
					type="email"
					autoComplete="username"
					{...register("email")}
					disabled={studentMutate.isPending}
				/>
				<Button
					disabled={studentMutate.isPending}
					className="gap-2 flex items-center"
				>
					<Plus /> Adicionar
				</Button>
			</form>
		</div>
	);
}
