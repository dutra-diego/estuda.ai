"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/react-query";
import { createClass } from "@/services/create-class";
import type { IClass } from "@/types/class";

export default function Class() {
	const router = useRouter();
	const createClassMutation = useMutation({
		mutationFn: () => createClass("Nova Turma"),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["classes"] });
			const previousClasses = queryClient.getQueryData<IClass[]>(["classes"]);

			const optimisticClass: IClass = {
				id: `temp-${Date.now()}`,
				name: "Nova Turma",
			};

			queryClient.setQueryData<IClass[]>(["classes"], (old) =>
				old ? [optimisticClass, ...old] : [optimisticClass],
			);

			return { previousClasses, optimisticClass };
		},

		onSuccess: (newClassId, _, context) => {
			queryClient.setQueryData<IClass[]>(["classes"], (old) => {
				if (!old) return old;
				return old.map((c) =>
					c.id === context?.optimisticClass.id
						? { ...context.optimisticClass, id: newClassId }
						: c,
				);
			});

			router.push(`/classes/${newClassId}`);
		},

		onError: (_error, _, context) => {
	
			if (context?.previousClasses) {
				queryClient.setQueryData(["classes"], context.previousClasses);
			}

			router.push("/classes");
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
		},
	});

	return (
		<div className=" h-96 flex items-center justify-center ">
			<h1 className="w-96 text-xl text-center">
				Olá, selecione a turma ou
				<Button
					variant={"link"}
					className="text-xl p-1.5 underline"
					onClick={() => createClassMutation.mutate()}
				>
					crie uma nova
				</Button>
			</h1>
		</div>
	);
}
