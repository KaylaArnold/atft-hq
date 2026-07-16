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

type Ticket = (typeof initialTickets)[number];
type Member = (typeof initialMembers)[number];

type HQContextType = {
  members: Member[];
  tickets: Ticket[];

  updateTicketStatus: (
    ticketId: number,
    status: SupportStatus
  ) => void;

  resetHQData: () => void;
};

const HQContext = createContext<HQContextType | null>(null);

const TICKETS_STORAGE_KEY = "atft-hq-support-tickets";

export function HQProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [members] = useState<Member[]>([...initialMembers]);
  const [tickets, setTickets] = useState<Ticket[]>([
    ...initialTickets,
  ]);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedTickets = window.localStorage.getItem(
        TICKETS_STORAGE_KEY
      );

      if (savedTickets) {
        setTickets(JSON.parse(savedTickets) as Ticket[]);
      }
    } catch (error) {
      console.error("Unable to load saved HQ tickets:", error);
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
    } catch (error) {
      console.error("Unable to save HQ tickets:", error);
    }
  }, [tickets, storageLoaded]);

  function updateTicketStatus(
    ticketId: number,
    status: SupportStatus
  ) {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status }
          : ticket
      )
    );
  }

  function resetHQData() {
    setTickets([...initialTickets]);
    window.localStorage.removeItem(TICKETS_STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      members,
      tickets,
      updateTicketStatus,
      resetHQData,
    }),
    [members, tickets]
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
    throw new Error("useHQ must be used inside HQProvider.");
  }

  return context;
}