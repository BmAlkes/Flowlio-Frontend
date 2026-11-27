import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "@/configs/i18n.config";
import { ConversationView } from "./ConversationView";
import type { Conversation, Message } from "./api";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
const session = vi.hoisted(() => ({ user: { id: "owner", role: "user", name: "Owner" } as Record<string, unknown> }));
vi.mock("@/configs/axios.config", () => ({ axios: api, backendURL: "http://localhost" }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org" }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: session.user, session: { id: "s1" } } }) }));
vi.mock("./realtime", () => ({ useConversationSocket: () => undefined }));
vi.mock("@/hooks/usegetallusermembers", () => ({ useGetCurrentOrgUserMembers: () => ({ data: { data: { userMembers: [{ id: "m", user: { id: "ana", name: "Ana Souza" } }] } } }) }));
vi.mock("@/hooks/usefetchtasks", () => ({ useFetchTasks: () => ({ data: { data: [{ id: "t1", title: "Layout no Figma" }] } }) }));

const message = (extra: Partial<Message>): Message => ({
  id: "m1", conversationId: "c1", authorId: "ana", authorKind: "member", authorName: "Ana Souza", authorImage: null, visibility: "internal",
  body: "Olá", parentId: null, mentions: [], approval: null, editedAt: null, deletedAt: null, createdAt: "2026-11-26T09:12:00Z",
  replies: { count: 0, lastAt: null }, reactions: [], tasks: [], ...extra,
});
const conversation = (access: Partial<Conversation["access"]> = {}): Conversation => ({
  id: "c1", kind: "project", name: null, title: "Site Padaria", projectId: "p1", taskId: null, clientId: null, clientName: "Padaria",
  access: { read: true, post: true, postToClient: true, clientOnly: false, manage: true, ...access },
});
let byAudience: Record<string, Message[]> = {};

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt");
  session.user = { id: "owner", role: "user", name: "Owner" };
  byAudience = {
    internal: [message({ body: "Combinado com @Ana Souza", tasks: [{ id: "t1", title: "Layout no Figma", status: "in_progress", endDate: null, assigneeName: "Lucas" }], replies: { count: 2, lastAt: null } })],
    client: [message({ id: "m2", visibility: "client", authorKind: "client", authorId: "marcos", authorName: "Marcos", body: "Podemos usar mais laranja?" }),
      message({ id: "m3", visibility: "client", body: "Versão 2", approval: { status: "pending", requestedBy: "owner" } })],
  };
  api.get.mockImplementation(async (url: string, config?: { params?: { audience?: string } }) => {
    if (url.endsWith("/messages")) return { data: { data: { messages: byAudience[config?.params?.audience ?? "internal"] ?? [], hasMore: false } } };
    if (url.endsWith("/thread")) return { data: { data: { parent: byAudience.internal[0], replies: [message({ id: "r1", body: "Feito", parentId: "m1" })] } } };
    return { data: { data: {} } };
  });
  api.post.mockResolvedValue({ data: { data: message({ id: "new" }) } });
});
afterEach(cleanup);

const renderView = (value: Conversation) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><ConversationView conversation={value} compact /></MemoryRouter></QueryClientProvider>);

it("keeps team talk and client talk apart, and warns before writing to the client", async () => {
  renderView(conversation());
  const user = userEvent.setup();
  expect(await screen.findByText(/Combinado com/)).toBeInTheDocument();
  expect(screen.getByText("@Ana Souza")).toHaveClass("font-semibold");
  expect(screen.getByRole("button", { name: /Layout no Figma/ })).toBeInTheDocument();
  expect(screen.getByText(/Interno: só a equipe vê/)).toBeInTheDocument();
  await user.type(screen.getByPlaceholderText(/Mensagem para a equipe/), "Bora{Enter}");
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/conversations/c1/messages", expect.objectContaining({ body: "Bora", visibility: "internal" })));

  await user.click(screen.getByRole("tab", { name: /Com o cliente/ }));
  expect(await screen.findByText("Podemos usar mais laranja?")).toBeInTheDocument();
  expect(screen.queryByText(/Combinado com/)).toBeNull();
  expect(screen.getByText(/Padaria vê esta mensagem no portal/)).toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Pedir aprovação" }));
  await user.type(screen.getByPlaceholderText(/Escreva para Padaria/), "Segue a versão 3");
  await user.click(screen.getByRole("button", { name: "Enviar ao cliente" }));
  await waitFor(() => expect(api.post).toHaveBeenLastCalledWith("/conversations/c1/messages", expect.objectContaining({ visibility: "client", requestApproval: true })));
  expect(screen.getByText("Aguardando aprovação do cliente")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Aprovar" })).toBeNull();
});

it("opens replies inline in compact views", async () => {
  renderView(conversation());
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "2 respostas" }));
  expect(await screen.findByText("Feito")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Responder…")).toBeInTheDocument();
});

it("shows the client only client messages, with no tabs, and lets them approve", async () => {
  session.user = { id: "marcos", role: "client", name: "Marcos" };
  renderView(conversation({ clientOnly: true, manage: false, postToClient: true }));
  const user = userEvent.setup();
  expect(await screen.findByText("Podemos usar mais laranja?")).toBeInTheDocument();
  expect(screen.queryByRole("tab")).toBeNull();
  expect(api.get).toHaveBeenCalledWith("/conversations/c1/messages", expect.objectContaining({ params: expect.objectContaining({ audience: "client" }) }));
  const card = screen.getByText("Aguardando aprovação do cliente").closest("div")!;
  await user.click(within(card).getByRole("button", { name: "Aprovar" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/conversations/messages/m3/approval", { decision: "approved", note: undefined }));
});

it("channels have no client side", async () => {
  renderView({ ...conversation({ postToClient: false }), kind: "channel", name: "geral", title: "geral", projectId: null, clientName: null });
  await screen.findByText(/Combinado com/);
  expect(screen.queryByRole("tab", { name: /Com o cliente/ })).toBeNull();
});
