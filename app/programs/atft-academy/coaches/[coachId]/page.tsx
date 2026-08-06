import CoachProfile from "@/components/coaches/coach-profile";

type CoachProfilePageProps = {
  params: Promise<{
    coachId: string;
  }>;
};

export default async function CoachProfilePage({
  params,
}: CoachProfilePageProps) {
  const { coachId } = await params;

  return <CoachProfile coachId={coachId} />;
}