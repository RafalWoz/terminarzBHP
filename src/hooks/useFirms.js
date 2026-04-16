import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useFirms(searchQuery = '') {
  return useLiveQuery(async () => {
    if (!searchQuery) {
      return db.firms.orderBy('name').toArray();
    }
    const q = searchQuery.toLowerCase();
    return db.firms
      .filter((f) =>
        f.name.toLowerCase().includes(q) ||
        (f.nip || '').includes(q)
      )
      .toArray();
  }, [searchQuery]);
}
