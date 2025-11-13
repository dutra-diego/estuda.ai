import { NavBarMobile } from "@/components/chat/nav-bar-mobile";
import { SideClass } from "@/components/classes/side-classes";

export default function ClassLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="w-full h-full flex flex-col md:flex-row md:justify-center">
			<NavBarMobile />
			<SideClass />
			{children}
		</div>
	);
}
