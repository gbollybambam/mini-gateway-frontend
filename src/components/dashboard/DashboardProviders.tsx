"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "./ui";

export default function DashboardProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}