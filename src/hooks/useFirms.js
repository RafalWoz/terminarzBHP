import { useLiveQuery } from 'dexie-react-hooks';
import { getAllFirms, getFirm, getSessionKey, isUnlocked } from '../storage';

export function useFirms(searchQuery = '') {
  return useLiveQuery(async () => {
    if (!isUnlocked()) return null;
    const key = getSessionKey();
    
    if (!searchQuery) {
      return getAllFirms(key);
    }
    
    const q = searchQuery.toLowerCase();
    const all = await getAllFirms(key);
    return all.filter((f) =>
      f.name?.toLowerCase().includes(q) ||
      f.nip?.includes(q)
    );
  }, [searchQuery]);
}

export function useFirm(id) {
  return useLiveQuery(async () => {
    if (!id || !isUnlocked()) return null;
    const key = getSessionKey();
    return getFirm(parseInt(id), key);
  }, [id]);
}
