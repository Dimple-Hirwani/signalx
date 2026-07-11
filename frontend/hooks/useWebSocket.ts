"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types/message";

const WS_BASE =
  typeof window !== "undefined"
    ? `ws://${window.location.hostname}:8000`
    : "ws://localhost:8000";

interface ReceiptFrame {
  type: "receipt";
  message_id: string;
  receipt_status: Message["receipt_status"];
}

interface MessageFrame extends Message {
  type: "message";
}

export function useWebSocket(
  conversationId: string | null,
  token: string | null,
  onMessage: (msg: Message) => void,
  onReceipt: (messageId: string, status: Message["receipt_status"]) => void
) {
  const onMessageRef = useRef(onMessage);
  const onReceiptRef = useRef(onReceipt);
  onMessageRef.current = onMessage;
  onReceiptRef.current = onReceipt;

  useEffect(() => {
    if (!conversationId || !token) return;

    let ws: WebSocket | null = null;
    let reconnected = false;
    let closed = false;

    function connect() {
      ws = new WebSocket(
        `${WS_BASE}/ws/conversations/${conversationId}?token=${encodeURIComponent(token!)}`
      );

      ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data as string) as
            | MessageFrame
            | ReceiptFrame;

          if (frame.type === "receipt") {
            onReceiptRef.current(frame.message_id, frame.receipt_status);
          } else {
            // type === "message" — strip the type field before passing on
            const { type: _type, ...msg } = frame;
            onMessageRef.current(msg as Message);
          }
        } catch {
          // malformed frame — ignore
        }
      };

      ws.onclose = (event) => {
        if (closed || event.code === 1008 || reconnected) return;
        reconnected = true;
        setTimeout(connect, 1500);
      };
    }

    connect();

    return () => {
      closed = true;
      ws?.close();
    };
  }, [conversationId, token]);
}
