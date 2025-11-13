import { useContext } from "react";
import { FormTypeContext } from "@/contexts/form-context";
import { Button } from "../ui/button";

export function FormUserForgot() {
	const { setFormType } = useContext(FormTypeContext);
	return (
		<div className="flex p-2 md:w-96 flex-col lg:h-[600px] items-center justify-center md:justify-self-center">
			<h2 className="self-start pb-2 text-lg font-bold text-zinc-100">
				Recuperar senha
			</h2>
			<form className="flex flex-col w-full space-y-2">
				<label htmlFor="email" className="text-md font-medium text-zinc-100">
					Email
				</label>
				<input
					type="email"
					name="email"
					id="email"
					className=" w-full border border-gray-300 rounded-md shadow-sm p-2"
					placeholder="Digite seu email"
				/>
				<Button type="submit" className="mt-1 w-full ">
					Criar conta
				</Button>
			</form>
			<div className="w-full py-2 flex justify-between">
				<Button
					onClick={() => setFormType("login")}
					variant={"link"}
					className=" text-zinc-100 hover:text-blue-400"
					type="button"
				>
					Retornar
				</Button>
			</div>
		</div>
	);
}
