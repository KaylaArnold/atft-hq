"use client";

import Link from "next/link";
import TicketActions from "./ticket-actions";
import TicketMessage from "./ticket-message";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SupportTicket } from "@/data/support";
import {
  replyTemplates,
  type ReplyTemplate,
} from "@/data/reply-templates";
import AISuggestion from "./ai-suggestion";
import ReplyEditor from "./reply-editor";
import TemplatePicker from "./template-picker";

type TicketViewProps = {
  ticket: SupportTicket;
};

export default function TicketView({ ticket }: TicketViewProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [reply, setReply] = useState("");

  const suggestedTemplate = useMemo(() => {
    const content = `${ticket.subject} ${ticket.preview}`.toLowerCase();

    if (content.includes("replay") || content.includes("recording")) {
      return replyTemplates.find((item) => item.id === "replay-upload");
    }

    if (content.includes("payment") || content.includes("declined")) {
      return replyTemplates.find((item) => item.id === "payment-issue");
    }

    if (
      content.includes("mini dripper") ||
      content.includes("live session")
    ) {
      return replyTemplates.find(
        (item) => item.id === "mini-drippers-access"
      );
    }

    return replyTemplates.find((item) => item.id === "community-access");
  }, [ticket]);

  useEffect(() => {
    setSelectedTemplateId(null);
    setReply("");
  }, [ticket.id]);

  function selectTemplate(template: ReplyTemplate) {
    setSelectedTemplateId(template.id);
    setReply(template.body);
  }

  function useSuggestion() {
    if (!suggestedTemplate) return;

    setSelectedTemplateId(suggestedTemplate.id);
    setReply(suggestedTemplate.body);
  }

  return (
    <main className="min-w-0 border-b border-white/[0.06] xl:border-b-0 xl:border-r">
     <TicketMessage ticket={ticket} /> 
      <div className="space-y-6 p-5 sm:p-6">

        {suggestedTemplate && (
          <AISuggestion
            suggestion={suggestedTemplate.body}
            onUse={useSuggestion}
          />
        )}

        <TemplatePicker
          templates={replyTemplates}
          selectedTemplateId={selectedTemplateId}
          onSelect={selectTemplate}
        />

        <ReplyEditor
          ticket={ticket}
          value={reply}
          onChange={setReply}
        />
        <TicketActions
          ticket={ticket}
          canSend={Boolean(reply.trim())}
        />
      </div>
    </main>
  );
}