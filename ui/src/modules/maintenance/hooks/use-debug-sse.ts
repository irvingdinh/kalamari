import { useCallback, useEffect, useRef, useState } from "react";

const MAX_EVENTS = 200;

export interface DebugSseEvent {
  id: number;
  timestamp: Date;
  type: string;
  payload: unknown;
  raw: string;
}

export function useDebugSSE() {
  const [events, setEvents] = useState<DebugSseEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const nextId = useRef(1);

  useEffect(() => {
    const source = new EventSource("/api/sse/debug");

    source.onopen = () => {
      setIsConnected(true);
    };

    source.onmessage = (event) => {
      const raw = event.data;
      let parsed: { type?: string; payload?: unknown } = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        // keep raw as-is
      }

      if (parsed.type === "heartbeat") {
        return;
      }

      const sseEvent: DebugSseEvent = {
        id: nextId.current++,
        timestamp: new Date(),
        type: parsed.type ?? "unknown",
        payload: parsed.payload ?? parsed,
        raw,
      };

      setEvents((prev) => [sseEvent, ...prev].slice(0, MAX_EVENTS));
    };

    source.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      source.close();
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, isConnected, clearEvents };
}
