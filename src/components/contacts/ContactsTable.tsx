"use client";
import { useState } from "react";
import { Search, Users } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  CALLED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  INTERESTED: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  NOT_INTERESTED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  CALLBACK: "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  status: string;
  createdAt: Date | string;
}

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["ALL", "PENDING", "CALLED", "INTERESTED", "CALLBACK", "NOT_INTERESTED", "FAILED"];

  if (contacts.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl p-16 text-center">
        <Users size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold text-lg mb-1">No contacts yet</h3>
        <p className="text-muted-foreground text-sm">Upload a CSV or XLSX file above to import contacts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 w-72 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent border-input"
              }`}
            >
              {s === "ALL" ? `All (${contacts.length})` : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {contacts.length} contacts
      </p>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {["Name", "Phone", "Email", "Company", "Status", "Added"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No contacts match your search or filter.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.company || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[c.status] || "bg-muted text-muted-foreground"}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
