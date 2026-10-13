import "server-only";
import { backendRequest } from "./request";

// Read-only compatibility layer for server-rendered pages. Every read is authorized
// again by the backend; database credentials and writes never live here.
type Data = Record<string, any>;
type ReadSpec = {
  path: string;
  group?: boolean;
  document?: boolean;
  filters?: [string, string, unknown][];
  order?: [string, "asc" | "desc"][];
  limit?: number;
  count?: boolean;
  select?: string[];
};
type Row = { id: string; path: string; data: Data };
function document(row: Row) {
  const parts = row.path.split("/");
  return {
    id: row.id,
    exists: true,
    data: () => row.data,
    ref: {
      path: row.path,
      parent: {
        parent: parts.length > 2 ? { id: parts[parts.length - 3] } : null,
      },
    },
  };
}
class RemoteQuery {
  constructor(
    private spec: ReadSpec,
    private publicRequest = false,
  ) {}
  where(field: string, operator: string, value: unknown) {
    return new RemoteQuery(
      {
        ...this.spec,
        filters: [...(this.spec.filters || []), [field, operator, value]],
      },
      this.publicRequest,
    );
  }
  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new RemoteQuery(
      { ...this.spec, order: [...(this.spec.order || []), [field, direction]] },
      this.publicRequest,
    );
  }
  limit(limit: number) {
    return new RemoteQuery({ ...this.spec, limit }, this.publicRequest);
  }
  select(...fields: string[]) {
    return new RemoteQuery(
      { ...this.spec, select: fields },
      this.publicRequest,
    );
  }
  doc(id: string) {
    return new RemoteQuery(
      { ...this.spec, path: `${this.spec.path}/${id}`, document: true },
      this.publicRequest,
    );
  }
  collection(name: string) {
    return new RemoteQuery(
      { path: `${this.spec.path}/${name}` },
      this.publicRequest,
    );
  }
  count() {
    return {
      get: async () => {
        const result = await backendRequest<{ count: number }>(
          "/api/data/read",
          { ...this.spec, count: true },
          this.publicRequest,
        );
        return { data: () => result };
      },
    };
  }
  async get() {
    const result = await backendRequest<{ rows: Row[] }>(
      "/api/data/read",
      this.spec,
      this.publicRequest,
    );
    const docs = result.rows.map(document);
    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      exists: docs.length > 0,
      id: docs[0]?.id,
      data: () => docs[0]?.data(),
      forEach: (callback: (doc: ReturnType<typeof document>) => void) =>
        docs.forEach(callback),
    };
  }
}
function database(publicRequest = false) {
  return {
    collection: (path: string) => new RemoteQuery({ path }, publicRequest),
    collectionGroup: (path: string) =>
      new RemoteQuery({ path, group: true }, publicRequest),
  };
}
export const adminDb = database();
export const publicDb = database(true);
export const adminAuth = {
  getUser: (uid: string) =>
    backendRequest<{
      displayName?: string;
      email?: string;
      photoURL?: string;
      phoneNumber?: string;
      emailVerified: boolean;
      metadata: { creationTime?: string };
    }>(`/api/admin/auth-users/${encodeURIComponent(uid)}`),
};
