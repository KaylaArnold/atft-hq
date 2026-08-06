export type EmployeeRole =
  | "Founder"
  | "Chief Operating Officer"
  | "Trading Coach"
  | "Coach"
  | "Community Director"
  | "Technology Coordinator"
  | "Hospitality Coordinator"
  | "Office Coordinator"
  | "Instructional Coordinator"
  | "Administrative Coordinator";

export type EmployeeDepartment =
  | "Executive Leadership"
  | "Coaching"
  | "Community"
  | "Technology"
  | "Hospitality"
  | "Office Operations"
  | "Instruction"
  | "Administration";

export type EmployeeStatus = "Active" | "Inactive";

export type LoginStatus =
  | "Active"
  | "Invite Pending"
  | "Not Invited"
  | "Disabled";

export type Employee = {
  id: number;
  name: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
  email: string | null;
  phone: string | null;
  status: EmployeeStatus;
  loginStatus: LoginStatus;
  initials: string;
};