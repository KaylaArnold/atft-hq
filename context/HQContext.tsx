"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { members as initialMembers } from "@/data/members";
import {
  supportTickets as initialTickets,
  type SupportStatus,
} from "@/data/support";
import type { MemberNote } from "@/data/member-notes";

type Ticket = (typeof initialTickets)[number];
type Member = (typeof initialMembers)[number];

export type NewTicketInput = {
  memberId: number;
  memberName: string;
  email: string;
  subject: string;
  body: string;
  program: string;
  status?: SupportStatus;
  assignedTo?: string | null;
};

export type UpdateTicketInput = {
  memberId: number;
  memberName: string;
  email: string;
  program: string;
  subject: string;
  body: string;
};

export type TicketActivityType =
  | "note"
  | "reply"
  | "status"
  | "assignment";

export type TicketActivity = {
  id: string;
  ticketId: number;
  type: TicketActivityType;
  body?: string;
  author: string;
  createdAt: string;
  previousStatus?: SupportStatus;
  newStatus?: SupportStatus;
  assignedTo?: string | null;
};

export type InternalNote = {
  id: string;
  body: string;
  createdAt: string;
  author: string;
};

type HQContextType = {
  members: Member[];
  tickets: Ticket[];

  ticketActivity: Record<number, TicketActivity[]>;
  ticketNotes: Record<number, InternalNote[]>;

  addTicket: (ticket: NewTicketInput) => number;

  updateTicketDetails: (
    ticketId: number,
    updates: UpdateTicketInput
  ) => void;

  updateTicketStatus: (
    ticketId: number,
    status: SupportStatus
  ) => void;

  updateTicketAssignment: (
    ticketId: number,
    assignedTo: string | null
  ) => void;

  addTicketNote: (
    ticketId: number,
    body: string
  ) => void;

  deleteTicketNote: (
    ticketId: number,
    noteId: string
  ) => void;

  addTicketReply: (
    ticketId: number,
    body: string
  ) => void;

  memberNotes: MemberNote[];

  addMemberNote: (
    memberId: number,
    author: string,
    body: string
  ) => void;

  updateMemberNote: (
    id: number,
    body: string
  ) => void;

  deleteMemberNote: (id: number) => void;

  resetHQData: () => void;
};

const HQContext = createContext<HQContextType | null>(null);

const TICKETS_STORAGE_KEY = "atft-hq-support-tickets";
const ACTIVITY_STORAGE_KEY = "atft-hq-ticket-activity";
const LEGACY_NOTES_STORAGE_KEY = "atft-hq-ticket-notes";

function createActivityId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createTicketPreview(body: string) {
  const normalizedBody = body.replace(/\s+/g, " ").trim();

  if (normalizedBody.length <= 140) {
    return normalizedBody;
  }

  return `${normalizedBody.slice(0, 137)}...`;
}

export function HQProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [members] = useState<Member[]>([
    ...initialMembers,
  ]);

  const [tickets, setTickets] = useState<Ticket[]>([
    ...initialTickets,
  ]);

  const [ticketActivity, setTicketActivity] = useState<
    Record<number, TicketActivity[]>
  >({});

  const [memberNotes, setMemberNotes] = useState<
    MemberNote[]
  >([]);

  const [storageLoaded, setStorageLoaded] =
    useState(false);

  useEffect(() => {
    try {
      const savedTickets = window.localStorage.getItem(
        TICKETS_STORAGE_KEY
      );

      const savedActivity = window.localStorage.getItem(
        ACTIVITY_STORAGE_KEY
      );

      const legacyNotes = window.localStorage.getItem(
        LEGACY_NOTES_STORAGE_KEY
      );

      if (savedTickets) {
        setTickets(JSON.parse(savedTickets) as Ticket[]);
      }

      if (savedActivity) {
        const parsedActivity = JSON.parse(
          savedActivity
        ) as Record<
          number,
          Array<
            TicketActivity & {
              type: TicketActivityType | "assingment";
            }
          >
        >;

        const normalizedActivity = Object.entries(
          parsedActivity
        ).reduce<Record<number, TicketActivity[]>>(
          (activityByTicket, [ticketId, activities]) => {
            activityByTicket[Number(ticketId)] =
              activities.map((activity) => ({
                ...activity,
                type:
                  activity.type === "assignment"
                    ? "assignment"
                    : activity.type,
              }));

            return activityByTicket;
          },
          {}
        );

        setTicketActivity(normalizedActivity);
      } else if (legacyNotes) {
        const parsedNotes = JSON.parse(
          legacyNotes
        ) as Record<number, InternalNote[]>;

        const migratedActivity = Object.entries(
          parsedNotes
        ).reduce<Record<number, TicketActivity[]>>(
          (activity, [ticketId, notes]) => {
            const numericTicketId = Number(ticketId);

            activity[numericTicketId] = notes.map(
              (note) => ({
                id: note.id,
                ticketId: numericTicketId,
                type: "note",
                body: note.body,
                author: note.author,
                createdAt: note.createdAt,
              })
            );

            return activity;
          },
          {}
        );

        setTicketActivity(migratedActivity);

        window.localStorage.removeItem(
          LEGACY_NOTES_STORAGE_KEY
        );
      }
    } catch (error) {
      console.error(
        "Unable to load saved HQ data:",
        error
      );
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        TICKETS_STORAGE_KEY,
        JSON.stringify(tickets)
      );

      window.localStorage.setItem(
        ACTIVITY_STORAGE_KEY,
        JSON.stringify(ticketActivity)
      );
    } catch (error) {
      console.error(
        "Unable to save HQ data:",
        error
      );
    }
  }, [tickets, ticketActivity, storageLoaded]);

  const ticketNotes = useMemo(() => {
    return Object.entries(ticketActivity).reduce<
      Record<number, InternalNote[]>
    >((notesByTicket, [ticketId, activities]) => {
      const notes = activities
        .filter(
          (activity) =>
            activity.type === "note" && activity.body
        )
        .map((activity) => ({
          id: activity.id,
          body: activity.body ?? "",
          createdAt: activity.createdAt,
          author: activity.author,
        }));

      if (notes.length > 0) {
        notesByTicket[Number(ticketId)] = notes;
      }

      return notesByTicket;
    }, {});
  }, [ticketActivity]);

  function addActivity(activity: TicketActivity) {
    setTicketActivity((currentActivity) => ({
      ...currentActivity,
      [activity.ticketId]: [
        ...(currentActivity[activity.ticketId] ?? []),
        activity,
      ],
    }));
  }

  function addTicket(ticketInput: NewTicketInput) {
    const nextTicketId = 
      tickets.reduce(
        (highestId, ticket) =>
          Math.max(highestId, ticket.id),
        0
      ) + 1;

    const trimmedBody = ticketInput.body.trim();

    const newTicket: Ticket = {
      id: nextTicketId,
      memberId: ticketInput.memberId,
      memberName: ticketInput.memberName.trim(),
      email: ticketInput.email.trim(),
      subject: ticketInput.subject.trim(),
      preview: createTicketPreview(trimmedBody),
      body: trimmedBody || null,
      program: ticketInput.program.trim(),
      status: ticketInput.status ?? "Needs Reply",
      assignedTo: ticketInput.assignedTo ?? null,
      receivedAt: new Date().toISOString(),
    };

    const updatedTickets = [
      newTicket,
      ...tickets,
    ];

    setTickets(updatedTickets);

    try {
      window.localStorage.setItem(
        TICKETS_STORAGE_KEY,
        JSON.stringify(updatedTickets)
      );
    } catch (error) {
      console.error(
        "Unable to save the new support ticket:",
        error
      );
    }

    return nextTicketId;
  }

  function updateTicketDetails(
    ticketId: number,
    updates: UpdateTicketInput
  ) {
    const trimmedBody = updates.body.trim();
    
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
            ...ticket,
            memberId: updates.memberId,
            memberName: updates.memberName.trim(),
            email: updates.email.trim(),
            subject: updates.subject.trim(),
            program: updates.program.trim(),
            body: trimmedBody,
            preview: createTicketPreview(trimmedBody),
          }
        : ticket
      )
    );
  }

  function updateTicketStatus(
    ticketId: number,
    status: SupportStatus
  ) {
    const currentTicket = tickets.find(
      (ticket) => ticket.id === ticketId
    );

    if (
      !currentTicket ||
      currentTicket.status === status
    ) {
      return;
    }

    const previousStatus = currentTicket.status;

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status }
          : ticket
      )
    );

    addActivity({
      id: createActivityId(),
      ticketId,
      type: "status",
      author: "Kayla",
      createdAt: new Date().toISOString(),
      previousStatus,
      newStatus: status,
    });
  }

  function updateTicketAssignment(
    ticketId: number,
    assignedTo: string | null
  ) {
    const currentTicket = tickets.find(
      (ticket) => ticket.id === ticketId
    );

    if (
      !currentTicket ||
      currentTicket.assignedTo === assignedTo
    ) {
      return;
    }

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, assignedTo }
          : ticket
      )
    );

    addActivity({
      id: createActivityId(),
      ticketId,
      type: "assignment",
      author: "Kayla",
      createdAt: new Date().toISOString(),
      assignedTo,
    });
  }

  function addTicketNote(
    ticketId: number,
    body: string
  ) {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return;
    }

    addActivity({
      id: createActivityId(),
      ticketId,
      type: "note",
      body: trimmedBody,
      author: "Kayla",
      createdAt: new Date().toISOString(),
    });
  }

  function deleteTicketNote(
    ticketId: number,
    noteId: string
  ) {
    setTicketActivity((currentActivity) => ({
      ...currentActivity,
      [ticketId]: (
        currentActivity[ticketId] ?? []
      ).filter(
        (activity) =>
          !(
            activity.id === noteId &&
            activity.type === "note"
          )
      ),
    }));
  }

  function addTicketReply(
    ticketId: number,
    body: string
  ) {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return;
    }

    addActivity({
      id: createActivityId(),
      ticketId,
      type: "reply",
      body: trimmedBody,
      author: "Kayla",
      createdAt: new Date().toISOString(),
    });
  }

  function addMemberNote(
    memberId: number,
    author: string,
    body: string
  ) {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return;
    }

    setMemberNotes((current) => [
      {
        id: Date.now(),
        memberId,
        author,
        body: trimmedBody,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }

  function deleteMemberNote(id: number) {
    setMemberNotes((current) =>
      current.filter((note) => note.id !== id)
    );
  }

  function updateMemberNote(
    id: number,
    body: string
  ) {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return;
    }

    setMemberNotes((current) =>
      current.map((note) =>
        note.id === id
          ? { ...note, body: trimmedBody }
          : note
      )
    );
  }

  function resetHQData() {
    setTickets([...initialTickets]);
    setTicketActivity({});

    window.localStorage.removeItem(
      TICKETS_STORAGE_KEY
    );

    window.localStorage.removeItem(
      ACTIVITY_STORAGE_KEY
    );

    window.localStorage.removeItem(
      LEGACY_NOTES_STORAGE_KEY
    );
  }

  const value = useMemo(
    () => ({
      members,

      tickets,
      ticketActivity,
      ticketNotes,

      addTicket,
      updateTicketDetails,
      updateTicketStatus,
      updateTicketAssignment,
      addTicketNote,
      deleteTicketNote,
      addTicketReply,

      memberNotes,
      addMemberNote,
      updateMemberNote,
      deleteMemberNote,

      resetHQData,
    }),
    [
      members,
      tickets,
      ticketActivity,
      ticketNotes,
      memberNotes,
    ]
  );

  return (
    <HQContext.Provider value={value}>
      {children}
    </HQContext.Provider>
  );
}

export function useHQ() {
  const context = useContext(HQContext);

  if (!context) {
    throw new Error(
      "useHQ must be used inside HQProvider."
    );
  }

  return context;
}