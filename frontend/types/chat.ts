export interface IChatWithMessages {
	title: "Novo chat";
	classId?: string;
	text: string;
	difficulty: "easy" | "medium" | "hard";
	sender: "user" ;
}

export interface IChat {
	id: string;
	title: string;
	classId?: string;
}

export interface IUpdateChatClass {
	id: string;
	classId: string;
}

export interface IUpdateChat {
	id: string;
	title: string;
}
