import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";

export type WhiteboardSummary = {
  id: string;
  title: string;
  projectId: string | null;
  projectName: string | null;
  updatedAt: string;
  updatedByName: string | null;
  elementCount: number;
  canDelete: boolean;
};

export type StoredElement = { id: string; version: number; versionNonce: number; [key: string]: unknown };
export type StoredFile = { id: string; mimeType: string; dataURL: string; created: number; [key: string]: unknown };

export type Whiteboard = {
  id: string;
  title: string;
  projectId: string | null;
  revision: number;
  elements: StoredElement[];
  appState: { viewBackgroundColor?: string; gridSize?: number | null };
  files: Record<string, StoredFile>;
  canEdit: boolean;
  canDelete: boolean;
  updatedAt: string;
};

export type SaveResult = { revision: number; title: string; elements: StoredElement[]; fileIds: string[]; updatedAt: string };

const unwrap = <T,>(response: { data: { data: T } }) => response.data.data;

export const whiteboardApi = {
  list: async (projectId?: string | null) => unwrap<WhiteboardSummary[]>(await axios.get("/whiteboards", { params: projectId ? { projectId } : {} })),
  get: async (id: string) => unwrap<Whiteboard>(await axios.get(`/whiteboards/${encodeURIComponent(id)}`)),
  revision: async (id: string) => unwrap<{ revision: number }>(await axios.get(`/whiteboards/${encodeURIComponent(id)}/revision`)),
  files: async (id: string, ids: string[]) =>
    unwrap<Record<string, StoredFile>>(await axios.get(`/whiteboards/${encodeURIComponent(id)}/files`, { params: { ids: ids.join(",") } })),
  save: async (id: string, body: { title?: string; elements?: StoredElement[]; appState?: Whiteboard["appState"]; files?: Record<string, StoredFile> }) =>
    unwrap<SaveResult>(await axios.put(`/whiteboards/${encodeURIComponent(id)}`, body)),
};

export function useWhiteboards(projectId?: string | null) {
  const scope = useDataScope();
  return useQuery({ queryKey: ["whiteboards", scope, projectId ?? null], queryFn: () => whiteboardApi.list(projectId) });
}

export function useWhiteboard(id: string | undefined) {
  const scope = useDataScope();
  // The editor owns the scene once loaded; refetching would reset the canvas under the user.
  return useQuery({ queryKey: ["whiteboard", scope, id], queryFn: () => whiteboardApi.get(id!), enabled: !!id, staleTime: Infinity, gcTime: 0, refetchOnWindowFocus: false });
}

export function useCreateWhiteboard() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; projectId?: string | null }) => unwrap<Whiteboard>(await axios.post("/whiteboards", input)),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["whiteboards"] }),
  });
}

export function useDeleteWhiteboard() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => axios.delete(`/whiteboards/${encodeURIComponent(id)}`),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["whiteboards"] }),
  });
}
