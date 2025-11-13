export interface IInvitation {
	id?: string;
	email: string;
	classId: string;
	status: "pending" | "accepted" | "declined";
	createdAt?: string | null;
	acceptedAt?: string | null;
}

export interface IUpdateInvitation {
	id: string;
	classId: string;
	status: "accepted" | "declined";
}
export interface IInvitationsByTeacher {
	id: string;
	email: string;
	createdAt: string;
	status: "pending" | "accepted" | "rejected";
	student: {
		user: {
			name: string;
		};
		joinedAt: Date | null;
	} | null;
}

export interface IInvitationsByStudent {
	id: string;
	classId: string;
	class: {
		teacher: {
			user: {
				name: string;
			};
		};
		name: string;
	};
}
