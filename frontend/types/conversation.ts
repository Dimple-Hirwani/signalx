export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null; // ISO datetime string
  unread_count: number;
}

export interface Member {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_online: boolean;
  last_seen_at: string | null; // ISO datetime string
}
