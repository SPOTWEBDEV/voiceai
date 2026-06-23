"use client";
import { useState } from "react";
import { Plus, Users, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import ContactImporter from "./ContactImporter";
import ContactsTable from "./ContactsTable";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  status: string;
  createdAt: string | Date;
}

interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  _count: { contacts: number };
  contacts: Contact[];
}

export default function ContactGroupsClient({ initialGroups }: { initialGroups: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [expandedId, setExpandedId] = useState<string | null>(
    initialGroups.length === 1 ? initialGroups[0].id : null
  );
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const refreshGroups = async () => {
    const res = await fetch("/api/contact-groups");
    if (res.ok) {
      // Re-fetch each group with contacts
      const list = await res.json();
      const full = await Promise.all(
        list.map((g: any) =>
          fetch(`/api/contact-groups/${g.id}`).then((r) => r.json())
        )
      );
      setGroups(full);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setCreateError("Group name is required."); return; }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/contact-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroups((prev) => [{ ...data, contacts: [] }, ...prev]);
      setExpandedId(data.id);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this group and all its contacts? This cannot be undone.")) return;
    await fetch(`/api/contact-groups/${id}`, { method: "DELETE" });
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const totalContacts = groups.reduce((sum, g) => sum + g._count.contacts, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            {groups.length} group{groups.length !== 1 ? "s" : ""} · {totalContacts} total contacts
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Group
        </button>
      </div>

      {/* Create group form */}
      {showCreate && (
        <div className="border rounded-xl bg-card p-5 space-y-4">
          <h2 className="font-semibold">Create Contact Group</h2>
          <p className="text-sm text-muted-foreground">
            Give this group a name so you can assign it to a specific campaign later.
          </p>
          <form onSubmit={createGroup} className="space-y-3">
            {createError && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg">
                {createError}
              </p>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Group Name *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='e.g. "Lagos Real Estate Leads Q3" or "Cold Prospects Jan 2025"'
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this group for?"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? "Creating…" : "Create Group"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); setCreateError(""); }}
                className="px-5 py-2 rounded-lg text-sm font-medium border hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-16 text-center">
          <Users size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg mb-1">No contact groups yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create a group first, then upload contacts to it.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={15} />Create your first group
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const expanded = expandedId === group.id;
            return (
              <div key={group.id} className="border rounded-xl bg-card overflow-hidden">
                {/* Group header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : group.id)}
                >
                  {expanded
                    ? <ChevronDown size={18} className="text-muted-foreground shrink-0" />
                    : <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                  }
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-muted-foreground">
                      {group._count.contacts} contact{group._count.contacts !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete group"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded: importer + table */}
                {expanded && (
                  <div className="border-t p-5 space-y-5">
                    <ContactImporter
                      groupId={group.id}
                      groupName={group.name}
                      onSuccess={refreshGroups}
                    />
                    <ContactsTable contacts={group.contacts} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
