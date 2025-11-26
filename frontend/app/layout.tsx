import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FormTypeProvider } from "@/contexts/form-context";
import { QueryProvider } from "@/contexts/query-provider";

const RobotoFont = Roboto({
	variable: "--font-roboto",
	subsets: ["latin"],
	display: "swap",
	preload: true,
	adjustFontFallback: true,
});

const RobotoFontMono = Roboto_Mono({
	variable: "--font-roboto-mono",
	subsets: ["latin"],
	display: "swap",
	preload: true,
	adjustFontFallback: true,
});

export const metadata: Metadata = {
	title: "Estuda.ai",
	description: "Sistema de chat educacional com IA",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body
				className={`${RobotoFont.variable} ${RobotoFontMono.variable} antialiased bg-linear-to-b from-stone-950 to-slate-950`}
			>
				<QueryProvider>
					<SidebarProvider>
						<Toaster
							toastOptions={{
								duration: 2000,
								style: {
									background: "black",
									color: "white",
								},
							}}
							position="top-center"
						/>
						<FormTypeProvider>{children}</FormTypeProvider>
					</SidebarProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
