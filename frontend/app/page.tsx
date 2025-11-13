"use client";
import { useContext } from "react";
import { FormCreateUser } from "@/components/auth/form-create-user";
import { FormLogin } from "@/components/auth/form-login";
import { FormUserForgot } from "@/components/auth/form-user-forgot";
import TextType from "@/components/ui/textType";
import { FormTypeContext } from "@/contexts/form-context";

export default function Home() {
	const { formType } = useContext(FormTypeContext);
	return (
		<div className="w-full h-full mt-4 lg:flex justify-center items-center lg:justify-evenly ">
			<div className="flex flex-col items-center justify-center h-20">
				<h1 className="text-2xl font-bold text-gray-200">
					<TextType
						text={["Bem vindo a Estude.AI"]}
						typingSpeed={75}
						pauseDuration={1500}
						showCursor={true}
						cursorCharacter="_"
					/>
				</h1>
				<p className="mt-2">Sua plataforma de estudos com IA.</p>
			</div>
			{formType === "login" ? (
				<FormLogin />
			) : formType === "register" ? (
				<FormCreateUser />
			) : (
				<FormUserForgot />
			)}
		</div>
	);
}
