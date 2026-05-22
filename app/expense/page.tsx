"use client";

import { useLiff } from "@/components/LiffProvider";
import ExpenseForm from "@/components/ExpenseForm";

export default function Page() {
  const { ready, error } = useLiff();

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!ready) return <div className="flex items-center justify-center h-screen text-gray-400">読み込み中...</div>;

  return <ExpenseForm />;
}
