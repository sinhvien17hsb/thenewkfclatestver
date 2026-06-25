"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export function usePolling<T>(
  url: string,
  interval = 4000,
  enabled = true
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetch(url, {
        signal: abortRef.current.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setError(String(e));
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    if (interval <= 0) return () => { abortRef.current?.abort(); };
    const timer = setInterval(fetchData, interval);
    return () => {
      clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [fetchData, interval, enabled]);

  return { data, loading, error, refetch: fetchData };
}

export function useStaffAuth() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    employeeId: string;
    role: string;
    branch: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
