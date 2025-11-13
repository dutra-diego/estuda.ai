export interface SseEvent {
	type: "connected" | "ai-chunk" | "ai-end" | "error";
	payload: string | object;
}

export interface SseClient {
	readonly userId: string;
	send(data: SseEvent): void;
	onClose(callback: () => void): void;
}
