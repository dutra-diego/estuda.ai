export interface IUser {
	name: string;
	email: string;
}
export interface ICreateUser {
	name: string;
	email: string;
	password: string;
	role: "student" | "teacher";
}