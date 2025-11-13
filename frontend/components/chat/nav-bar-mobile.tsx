"use client";
import { Menu } from "lucide-react";
import { Button } from "@/components//ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function NavBarMobile() {
	const { setOpenMobile } = useSidebar();
	function handleOpenMenu() {
		setOpenMobile(true);
	}

	return (
		<nav className="md:hidden flex m-2 items-center">
			<Button
				asChild={true}
				variant="ghost"
				size="icon"
				onClick={handleOpenMenu}
			>
				<span>
					<Menu />
				</span>
			</Button>
		</nav>
	);
}
