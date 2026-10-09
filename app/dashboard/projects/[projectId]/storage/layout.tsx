"use client";

import { useParams } from "next/navigation";
import StorageProjectGate from "@/components/Storage/StorageProjectGate";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>();
  return <StorageProjectGate projectId={projectId}>{children}</StorageProjectGate>;
}
