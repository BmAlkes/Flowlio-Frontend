import { axios } from "@/configs/axios.config";

type Collection = { data: { id: string }[]; pagination?: { page: number; pageSize: number; hasMore: boolean } };

/** Complete collections for calendars/selectors, fetched in bounded HTTP pages. Never silently truncate. */
export async function fetchCollection<T extends Collection>(url: string, params: Record<string, unknown> = {}, signal?: AbortSignal): Promise<T> {
  const rows = new Map<string, T["data"][number]>();
  let first: T | undefined;
  for (let page = 1; page <= 10000; page++) {
    const response = await axios.get<T>(url, { params: { ...params, page, pageSize: 100 }, signal });
    const body = response.data;
    if (!Array.isArray(body?.data)) throw new Error("Invalid collection response");
    first ??= body;
    for (const row of body.data) {
      if (!row || typeof row.id !== "string") throw new Error("Invalid collection record");
      rows.set(row.id, row);
    }
    if (body.pagination && (body.pagination.page !== page || typeof body.pagination.hasMore !== "boolean")) throw new Error("Invalid pagination response");
    if (!body.pagination || !body.pagination.hasMore) return { ...first, data: [...rows.values()], pagination: undefined } as T;
    if (body.pagination.page !== page || body.data.length === 0) throw new Error("Invalid pagination response");
  }
  throw new Error("Collection exceeds the supported page count; narrow the filters");
}
