export class AppError extends Error {
	statusCode: number;

	constructor(statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
		Object.setPrototypeOf(this, AppError.prototype);
	}
}

export function isAppError(error: unknown): error is AppError {
	return error instanceof AppError;
}
