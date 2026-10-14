// Minimal transactional store: rejects reads after writes and commits atomically.
export function paymentDb(seed: Record<string, any> = {}) {
  const rows = new Map<string, any>(Object.entries(structuredClone(seed)));
  const snapshot = (path: string) => ({
    id: path.split("/").at(-1),
    exists: rows.has(path),
    data: () => structuredClone(rows.get(path)),
  });
  const collection = (path: string): any => ({
    doc: (id: string) => ({
      id,
      path: `${path}/${id}`,
      get: async () => snapshot(`${path}/${id}`),
      collection: (name: string) => collection(`${path}/${id}/${name}`),
    }),
  });
  let queue = Promise.resolve();
  const db = {
    collection,
    runTransaction: (fn: any) => {
      const result = queue.then(async () => {
        const writes: { path: string; data: any; merge: boolean }[] = [];
        const output = await fn({
          get: async (ref: any) => {
            if (writes.length)
              throw Error("Firestore reads must precede writes");
            return snapshot(ref.path);
          },
          set: (ref: any, data: any, options?: any) =>
            writes.push({ path: ref.path, data, merge: !!options?.merge }),
          update: (ref: any, data: any) =>
            writes.push({ path: ref.path, data, merge: true }),
        });
        for (const w of writes)
          rows.set(
            w.path,
            w.merge ? { ...rows.get(w.path), ...w.data } : w.data,
          );
        return output;
      });
      queue = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },
  };
  return { db: db as unknown as FirebaseFirestore.Firestore, rows };
}
