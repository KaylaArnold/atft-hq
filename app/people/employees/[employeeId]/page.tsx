import EmployeeProfile from "@/components/employees/employee-profile";

type EmployeeProfilePageProps = {
  params: Promise<{
    employeeId: string;
  }>;
};

export default async function EmployeeProfilePage({
  params,
}: EmployeeProfilePageProps) {
  const { employeeId } = await params;

  return <EmployeeProfile employeeId={employeeId} />;
}