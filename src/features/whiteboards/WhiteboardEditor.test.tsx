import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Whiteboard } from "./api";

type Scene = { id: string; type: string; version: number; versionNonce: number; [key: string]: unknown }[];
const state = vi.hoisted(() => ({
  scene: [] as { id: string; type: string; version: number; versionNonce: number; [key: string]: unknown }[],
  selected: {} as Record<string, true>,
  props: null as null | Record<string, any>,
  save: vi.fn(),
  revision: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@excalidraw/excalidraw/index.css", () => ({}));
vi.mock("@excalidraw/excalidraw", () => ({
  CaptureUpdateAction: { NEVER: "NEVER", IMMEDIATELY: "IMMEDIATELY" },
  hashElementsVersion: (elements: Scene) => elements.map(e => `${e.id}:${e.version}`).join("|"),
  reconcileElements: (_local: Scene, remote: Scene) => remote,
  newElementWith: (element: Scene[number], changes: Record<string, unknown>) => ({ ...element, ...changes, version: element.version + 1 }),
  Excalidraw: (props: Record<string, any>) => {
    state.props = props;
    props.excalidrawAPI({
      getSceneElementsIncludingDeleted: () => state.scene,
      getSceneElements: () => state.scene.filter(e => !e.isDeleted),
      getAppState: () => ({ viewBackgroundColor: "#ffffff", selectedElementIds: state.selected }),
      getFiles: () => ({}),
      updateScene: ({ elements }: { elements: Scene }) => { state.scene = elements; },
      addFiles: vi.fn(),
    });
    return <div data-testid="canvas" data-view-mode={String(props.viewModeEnabled)} />;
  },
}));
vi.mock("./api", () => ({ whiteboardApi: { save: state.save, revision: state.revision, get: vi.fn(), files: vi.fn(async () => ({})) } }));
vi.mock("@/configs/axios.config", () => ({ axios: { post: state.post } }));
vi.mock("@/hooks/usefetchprojects", () => ({ useFetchProjects: () => ({ data: { data: [{ id: "p1", projectName: "Site Padaria" }] } }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light" }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt" } }) }));

const { WhiteboardEditor } = await import("./WhiteboardEditor");

const board = (extra: Partial<Whiteboard> = {}): Whiteboard => ({
  id: "w1", title: "Brainstorm", projectId: "p1", revision: 1, elements: [], appState: {}, files: {}, canEdit: true, canDelete: true, updatedAt: "", ...extra,
});
const change = () => act(() => state.props!.onChange(state.scene, { viewBackgroundColor: "#ffffff", selectedElementIds: state.selected }));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  state.scene = [];
  state.selected = {};
  state.save.mockImplementation(async (_id: string, body: { elements?: Scene }) => ({ revision: 2, title: "Brainstorm", elements: body.elements ?? state.scene, fileIds: [], updatedAt: "" }));
  state.revision.mockResolvedValue({ revision: 1 });
  state.post.mockResolvedValue({ data: {} });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("saves a moment after the drawing changes and shows when it is saved", async () => {
  render(<MemoryRouter><WhiteboardEditor board={board()} /></MemoryRouter>);
  state.scene = [{ id: "r1", type: "rectangle", version: 1, versionNonce: 1 }];
  change();
  expect(screen.getByRole("status")).toHaveTextContent("whiteboards.saving");
  await act(() => vi.advanceTimersByTimeAsync(1300));
  expect(state.save).toHaveBeenCalledWith("w1", expect.objectContaining({ elements: state.scene, files: {} }));
  expect(screen.getByRole("status")).toHaveTextContent("whiteboards.saved");
});

it("opens read-only boards in view mode and never saves them", async () => {
  render(<MemoryRouter><WhiteboardEditor board={board({ canEdit: false })} /></MemoryRouter>);
  expect(screen.getByTestId("canvas")).toHaveAttribute("data-view-mode", "true");
  expect(screen.queryByRole("button", { name: /whiteboards.tasks.open/ })).toBeNull();
  state.scene = [{ id: "r1", type: "rectangle", version: 1, versionNonce: 1 }];
  change();
  await act(() => vi.advanceTimersByTimeAsync(2000));
  expect(state.save).not.toHaveBeenCalled();
});

it("turns selected sticky notes into tasks of the board's project and paints them green", async () => {
  state.scene = [
    { id: "n1", type: "rectangle", version: 1, versionNonce: 1, boundElements: [{ id: "t1", type: "text" }] },
    { id: "t1", type: "text", version: 1, versionNonce: 1, text: "Criar landing page\ncom formulário", originalText: "Criar landing page\ncom formulário", containerId: "n1" },
  ];
  state.selected = { n1: true };
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><WhiteboardEditor board={board({ elements: state.scene })} /></MemoryRouter></QueryClientProvider>);
  change();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.click(screen.getByRole("button", { name: /whiteboards.tasks.open/ }));
  expect(screen.getByRole("combobox")).toHaveValue("p1");
  await user.click(screen.getByRole("button", { name: "whiteboards.tasks.submit" }));
  expect(state.post).toHaveBeenCalledWith("/tasks/create", { title: "Criar landing page", description: "com formulário", projectId: "p1" });
  expect(state.scene.find(e => e.id === "n1")?.backgroundColor).toBe("#b2f2bb");
  expect(screen.queryByRole("dialog")).toBeNull();
});
