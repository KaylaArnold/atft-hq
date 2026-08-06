export type PeerCoachRole = "Peer Coach" | "Accountability Coach";

export type PeerCoachMeetingStatus = "Attended" | "Did Not Attend";

export type PeerCoach = {
  id: number;
  name: string;
  phone: string;
  role: PeerCoachRole;
  meetingStatus: PeerCoachMeetingStatus;
  comments: string;
};