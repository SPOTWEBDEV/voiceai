export type {
  User,
  Contact,
  ContactGroup,
  Campaign,
  CampaignContactGroup,
  Call,
  CallTranscript,
  Message,
  CallStatus,
  CampaignStatus,
  ContactStatus,
  MessageStatus,
  ChannelType,
  Role,
  Plan,
} from "@prisma/client";

export interface UploadResult {
  imported: number;
  total: number;
}

export interface StartCampaignResult {
  started: number;
  failed: number;
  total: number;
  message: string;
  results: { contactId: string; callId?: string; sid?: string; error?: string }[];
}

export interface ApiError {
  error: string;
}

// NextAuth type augmentation
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
