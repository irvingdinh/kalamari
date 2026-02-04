import { useCallback, useEffect, useRef, useState } from "react";

const MAX_EVENTS = 200;

export interface SseEvent {
  id: number;
  timestamp: Date;
  type: string;
  payload: unknown;
  raw: string;
}

export function useSSE() {
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const nextId = useRef(1);

  useEffect(() => {
    const source = new EventSource("/api/sse");

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

      const sseEvent: SseEvent = {
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
