export interface IChatMessage {
	id: string;
	difficulty: string;
	text: string;
	sender: "user" | "ai";
}

export interface IChatMessageCreate {
	difficulty: string;
	text: string;
	sender: "user" | "ai";
}
export interface ISSEMessage {
	type: string;
	payload: {
		message: IChatMessage;
		chatId: string;
	};
}
