import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { writeDb } from '~/services/database.ts';
import { useDatabase } from './DatabaseContext.ts';
import { usePackingList } from './PackingListContext.ts';
import { VersionContext } from './VersionContext.ts';

const DEBOUNCE_DELAY_MS = 30000;

export function VersionProvider({ children }: { children: ReactNode }) {
  const { packItems } = useDatabase();
  const { packingList } = usePackingList();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const packItemsRef = useRef(packItems);
  const pendingReasonRef = useRef<string | null>(null);

  useEffect(() => {
    packItemsRef.current = packItems;
  }, [packItems]);

  const saveVersion = useCallback(async () => {
    const reason = pendingReasonRef.current ?? 'Before changes';
    pendingReasonRef.current = null;
    await writeDb.saveVersion(packingList.id, packItemsRef.current, reason);
  }, [packingList.id]);

  const cancelScheduledSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingReasonRef.current = null;
  }, []);

  const scheduleVersionSave = useCallback(
    (reason: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      pendingReasonRef.current = reason;
      timeoutRef.current = setTimeout(() => {
        saveVersion();
        timeoutRef.current = null;
      }, DEBOUNCE_DELAY_MS);
    },
    [saveVersion]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <VersionContext.Provider value={{ scheduleVersionSave, cancelScheduledSave }}>{children}</VersionContext.Provider>
  );
}
