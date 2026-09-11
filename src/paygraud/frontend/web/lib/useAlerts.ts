import { useEffect, useRef } from "react";

import { useAuthStore } from "@/store/authStore";
import { WS_URL } from "@/lib/api";

export function usePaymentAlerts(onEvent: (type: string, data: unknown) => void): void {
  const socketRef = useRef<WebSocket | null>(null);
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const socket = new WebSocket(`${WS_URL}?token=${token}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string);
        handlerRef.current(payload.type ?? "", payload.data ?? {});
      } catch {
        // ignore non-JSON frames
      }
    };

    return () => socket.close();
  }, []);
}