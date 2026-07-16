export type ReplyTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  usageCount: number;
  body: string;
};

export const replyTemplates: ReplyTemplate[] = [
  {
    id: "community-access",
    title: "Community Access",
    category: "Access",
    description: "Member cannot locate or enter the correct Mighty space.",
    usageCount: 113,
    body:
      "Hello,\n\nYou have been granted access to the appropriate community spaces. Please refresh the app or log out and back in if you do not see them immediately.\n\nFor future classes and events, please enter through the ATFT Network community.\n\nThank you.",
  },
  {
    id: "replay-upload",
    title: "Replay Upload",
    category: "Replays",
    description: "Member is asking when a class replay will be available.",
    usageCount: 47,
    body:
      "Hello,\n\nClass replays are typically posted in the Replay Vault by 6:00 PM Eastern on the day they are recorded.\n\nPlease check the vault again after that time.\n\nThank you.",
  },
  {
    id: "payment-issue",
    title: "Payment Issue",
    category: "Billing",
    description: "Member reports that a payment method was declined.",
    usageCount: 18,
    body:
      "Hello,\n\nWe are sorry you are experiencing difficulty with your payment. Please verify your billing information and try another payment method if available.\n\nIf the issue continues, reply with a screenshot of the error so the team can review it further.\n\nThank you.",
  },
  {
    id: "mini-drippers-access",
    title: "Mini Drippers Access",
    category: "Programs",
    description: "Member needs help accessing the Mini Drippers program.",
    usageCount: 62,
    body:
      "Hello,\n\nYour Mini Drippers access has been reviewed. Please refresh the Mighty Networks app or log out and back in to view the program spaces.\n\nClasses, events, and replays can be accessed through the ATFT Network community.\n\nThank you.",
  },
];