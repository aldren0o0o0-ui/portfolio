import { useEffect, useState } from "react";

const COUNTER_NAMESPACE = "aldren-dico-portfolio";
const COUNTER_KEY = "visits";
const BASE_URL = `https://api.counterapi.dev/v2/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;
const SESSION_FLAG_KEY = "portfolio_visit_counted";
const SESSION_VALUE_KEY = "portfolio_visit_count";

let inFlightPromise: Promise<number | null> | null = null;

async function fetchVisitorCount(signal?: AbortSignal): Promise<number | null> {
  if (typeof window === "undefined") return null;

  const alreadyCounted = window.sessionStorage.getItem(SESSION_FLAG_KEY) === "1";
  const endpoint = alreadyCounted ? BASE_URL : `${BASE_URL}/up`;

  // Mark synchronously before awaiting so React StrictMode double-effect won't double-increment
  if (!alreadyCounted) {
    window.sessionStorage.setItem(SESSION_FLAG_KEY, "1");
  }

  try {
    const res = await fetch(endpoint, { signal });
    if (!res.ok) {
      if (!alreadyCounted) {
        window.sessionStorage.removeItem(SESSION_FLAG_KEY);
      }
      return null;
    }
    const data = (await res.json()) as { count?: number };
    if (typeof data.count === "number") {
      window.sessionStorage.setItem(SESSION_VALUE_KEY, String(data.count));
      return data.count;
    }
    return null;
  } catch {
    if (!alreadyCounted) {
      window.sessionStorage.removeItem(SESSION_FLAG_KEY);
    }
    return null;
  }
}

export function useVisitorCount(): number | null {
  const [count, setCount] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const cached = window.sessionStorage.getItem(SESSION_VALUE_KEY);
    if (cached !== null) {
      const parsed = Number(cached);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  });

  useEffect(() => {
    const controller = new AbortController();

    if (!inFlightPromise) {
      inFlightPromise = fetchVisitorCount(controller.signal).finally(() => {
        inFlightPromise = null;
      });
    }

    inFlightPromise.then((val) => {
      if (!controller.signal.aborted && val !== null) {
        setCount(val);
      }
    });

    return () => controller.abort();
  }, []);

  return count;
}
