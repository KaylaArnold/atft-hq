import MemberProfile from "@/components/members/member-profile";

type MemberProfilePageProps = {
  params: Promise<{
    memberId: string;
  }>;
};

type MemberProfileProps = {
  memberId: string;
};

export default async function MemberProfilePage(
  props: MemberProfilePageProps
) {
  const { memberId } = await props.params;

  return <MemberProfile memberId={memberId} />;
}