export interface AttachmentOut {
  id: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
}

export interface ReplySnippet {
  message_id: string;
  sender_name: string;
  content_preview: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: "text" | "image" | "file";
  reply_to: ReplySnippet | null;
  attachments: AttachmentOut[];
  created_at: string; // ISO datetime
  receipt_status: "sending" | "sent" | "delivered" | "read";
}
