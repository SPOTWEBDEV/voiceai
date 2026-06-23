"use client";
import { useState } from "react";
import ContactUpload from "./ContactUpload";
import ContactsTable from "./ContactsTable";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  status: string;
  createdAt: Date;
}

export default function ContactsClient({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [loading, setLoading] = useState(false);

  const refreshContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (e) {
      console.error("Failed to refresh contacts", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-muted-foreground">Upload and manage contacts for your campaigns</p>
      </div>
      <ContactUpload onSuccess={refreshContacts} />
      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm animate-pulse">Refreshing contacts…</div>
      ) : (
        <ContactsTable contacts={contacts} />
      )}
    </div>
  );
}
