import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { queryClient } from "@/lib/react-query";
import { updateClass } from "@/services/update-class";
import type { IClass } from "@/types/class";
import { Button } from "../ui/button";

const formSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1).max(100),
});

type typeForm = z.infer<typeof formSchema>;

type FormUpdateClassProps = {
	classId: string;
	setEditingClassId: React.Dispatch<React.SetStateAction<string | null>>;
};

export function FormUpdateClass({
	classId,
	setEditingClassId,
}: FormUpdateClassProps) {
	const { register, handleSubmit } = useForm<typeForm>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: classId,
			name: "",
		},
	});

	const updateNameMutatate = useMutation({
		mutationFn: updateClass,
		onMutate: async (classes: { id: string; name: string }) => {
			await queryClient.cancelQueries({ queryKey: ["classes"] });
			const previous = queryClient.getQueryData<IClass[]>(["classes"]);
			queryClient.setQueryData<IClass[]>(["classes"], (old) =>
				(old ?? []).map((c) =>
					c.id === classes.id ? { ...c, name: classes.name } : c,
				),
			);
			return { previous };
		},
		onError: (_err, _vars, context?: { previous?: IClass[] }) => {
			if (context?.previous) {
				queryClient.setQueryData(["classes"], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["classes"] });
		},
		onSuccess: () => {
			setEditingClassId(null);
		},
	});

	const onSubmit: SubmitHandler<typeForm> = async (data) => {
		updateNameMutatate.mutate({
			id: classId,
			name: data.name,
		});
	};

	function handleCancelEdit() {
		setEditingClassId(null);
	}

	useEffect(() => {
		const input = document.querySelector(
			'input[name="name"]',
		) as HTMLInputElement | null;
		input?.focus();
	}, []);

	return (
		<form
			className="flex items-center justify-between w-full h-10 mb-2 border rounded-md px-2"
			onSubmit={handleSubmit(onSubmit)}
		>
			<input
				className="h-full w-full pr-2 border-none bg-transparent outline-none focus:ring-0"
				type="text"
				{...register("name")}
			/>
			<Button className="p-0" size="sm" variant="ghost" type="submit">
				<Check width={16} color="green" />
			</Button>
			<Button
				className="p-0"
				size="sm"
				variant="ghost"
				type="button"
				onClick={handleCancelEdit}
			>
				<X width={16} color="red" />
			</Button>
		</form>
	);
}
