export type {
  User,
  Contact,
  Campaign,
  Call,
  CallTranscript,
  CallStatus,
  CampaignStatus,
  ContactStatus,
  Role,
} from "@prisma/client";

export interface UploadResult {
  imported: number;
}

export interface StartCampaignResult {
  started: number;
  calls: { contactId: string; callId: string; sid: string }[];
}

export interface ApiError {
  error: string;
}

// ─── NextAuth type augmentation ───────────────────────────────────────────────
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
