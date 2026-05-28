import { useEffect, useState } from "preact/hooks";

export interface AsyncState<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

/** Runs an async fn on mount / when deps change; tracks loading + error. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    fn()
      .then((d) => !cancelled && setState({ data: d, loading: false }))
      .catch((e) => !cancelled && setState({ error: String(e?.message ?? e), loading: false }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
