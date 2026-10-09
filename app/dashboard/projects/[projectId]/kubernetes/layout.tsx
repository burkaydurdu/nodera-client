"use client";

import { useParams } from "next/navigation";
import KubernetesProjectGate from "@/components/Kubernetes/KubernetesProjectGate";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId: string }>();
  return <KubernetesProjectGate projectId={projectId}>{children}</KubernetesProjectGate>;
}
