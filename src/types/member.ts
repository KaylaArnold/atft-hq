export interface Member {
  id: string;

  firstName: string;
  lastName: string;

  email: string;

  phone?: string;

  status:
    | "active"
    | "inactive"
    | "pending";

  enrolledPrograms: string[];

  coachId?: string;

  joinedAt: string;
}