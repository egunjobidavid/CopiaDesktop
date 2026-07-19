import { useState, useCallback, useRef } from 'react';

interface OptimisticOptions<T> {
  /** Current state snapshot */
  current: T[];
  /** Setter to update the state optimistically */
  setState: (items: T[]) => void;
  /** Server mutation function */
  mutation: (item: T) => Promise<any>;
  /** Get a stable key for dedup/rollback */
  getKey: (item: T) => string;
  /** Whether to insert (default) or update */
  mode?: 'insert' | 'update';
  /** Where to insert — 'start' or 'end' (default: 'start') */
  insertPosition?: 'start' | 'end';
}

interface OptimisticMutationResult<T> {
  execute: (item: T) => Promise<boolean>;
  isPending: boolean;
  error: unknown;
}

/**
 * Optimistic mutation hook. Updates local state immediately,
 * then confirms with the server. Rolls back on error.
 */
export function useOptimisticMutation<T>({
  current,
  setState,
  mutation,
  getKey,
  mode = 'insert',
  insertPosition = 'start',
}: OptimisticOptions<T>): OptimisticMutationResult<T> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const snapshotRef = useRef<T[]>([]);

  const execute = useCallback(
    async (item: T): Promise<boolean> => {
      setIsPending(true);
      setError(null);
      snapshotRef.current = [...current];

      const key = getKey(item);

      // Optimistic update
      if (mode === 'insert') {
        const exists = current.some((i) => getKey(i) === key);
        if (!exists) {
          setState(
            insertPosition === 'start' ? [item, ...current] : [...current, item],
          );
        }
      } else {
        setState(current.map((i) => (getKey(i) === key ? { ...i, ...item } : i)));
      }

      try {
        await mutation(item);
        return true;
      } catch (err) {
        // Rollback
        setError(err);
        setState(snapshotRef.current);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [current, setState, mutation, getKey, mode, insertPosition],
  );

  return { execute, isPending, error };
}

/**
 * Optimistic status transition. Updates an item's status field
 * instantly, then confirms via PATCH.
 */
export function useOptimisticStatus<T extends { id: string; status?: string }>({
  current,
  setState,
  endpoint,
  getKey,
}: {
  current: T[];
  setState: (items: T[]) => void;
  endpoint: (id: string) => string;
  getKey?: (item: T) => string;
}) {
  const getKeyFn = getKey ?? ((item: T) => item.id);
  const [isPending, setIsPending] = useState(false);

  const transition = useCallback(
    async (id: string, newStatus: string): Promise<boolean> => {
      setIsPending(true);
      const snapshot = [...current];

      // Optimistic
      setState(
        current.map((i) =>
          getKeyFn(i) === id ? { ...i, status: newStatus } : i,
        ),
      );

      try {
        const api = (await import('../api/client')).default;
        await api.patch(endpoint(id), { status: newStatus });
        return true;
      } catch (err) {
        // Rollback
        setState(snapshot);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [current, setState, endpoint, getKeyFn],
  );

  return { transition, isPending };
}

/**
 * Optimistic delete. Removes item instantly, restores on failure.
 */
export function useOptimisticDelete<T extends { id: string }>({
  current,
  setState,
  mutation,
  getKey,
}: {
  current: T[];
  setState: (items: T[]) => void;
  mutation: (id: string) => Promise<any>;
  getKey?: (item: T) => string;
}) {
  const getKeyFn = getKey ?? ((item: T) => item.id);
  const [isPending, setIsPending] = useState(false);

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setIsPending(true);
      const snapshot = [...current];

      setState(current.filter((i) => getKeyFn(i) !== id));

      try {
        await mutation(id);
        return true;
      } catch (err) {
        setState(snapshot);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [current, setState, mutation, getKeyFn],
  );

  return { remove, isPending };
}
