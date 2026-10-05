"use client";

import { useParams } from "next/navigation";
import MailProjectGate from "@/components/Mail/MailProjectGate";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>();
  return <MailProjectGate projectId={projectId}>{children}</MailProjectGate>;
}
