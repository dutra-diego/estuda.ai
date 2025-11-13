import { DialogStudent } from "@/components/chat/dialogStudent";
import { NavBarMobile } from "@/components/chat/nav-bar-mobile";
import { SideChats } from "@/components/chat/side-chats";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="w-full h-full flex flex-col md:flex-row md:justify-center">
			<DialogStudent />
			<SideChats />
			<NavBarMobile />
			{children}
		</div>
	);
}
