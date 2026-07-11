export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null; // ISO datetime string
  unread_count: number;
}
