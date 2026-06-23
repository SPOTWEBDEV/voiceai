"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserActions({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleRole = async () => {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: currentRole === "ADMIN" ? "USER" : "ADMIN" }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggleRole}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded border font-medium transition-colors disabled:opacity-50 ${
        currentRole === "ADMIN"
          ? "border-muted text-muted-foreground hover:bg-muted"
          : "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      }`}
    >
      {loading ? "…" : currentRole === "ADMIN" ? "Remove Admin" : "Make Admin"}
    </button>
  );
}
