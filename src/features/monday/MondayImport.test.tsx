import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "@/configs/i18n.config";
import { MondayImport } from "./MondayImport";

const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.token-for-tests";
beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt");
  api.post.mockImplementation(async (url: string, body: { boardId?: string }) => {
    if (url === "/integrations/monday/boards") return { data: { data: [{ id: "1", name: "Projetos de Clientes", itemsCount: 16, workspace: "Agência" }, { id: "2", name: "CRM", itemsCount: 9, workspace: null }] } };
    if (body.boardId === "2") throw { response: { data: { message: "Tasks: your plan allows 50" } } };
    return { data: { data: { boardId: "1", projectId: "p1", projectName: "Projetos de Clientes", projectCreated: true, created: 16, updated: 0, fields: 4, unmatchedPeople: ["Carlos"], skippedColumns: ["Files"] } } };
  });
});
afterEach(cleanup);

it("connects with a token, imports the chosen boards one by one and reports each result", async () => {
  const onClose = vi.fn();
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><MondayImport onClose={onClose} /></MemoryRouter></QueryClientProvider>);
  const user = userEvent.setup();
  const connect = screen.getByRole("button", { name: "Conectar" });
  expect(connect).toBeDisabled();
  await user.type(screen.getByLabelText("Token da API do monday.com"), TOKEN);
  await user.click(connect);
  expect(api.post).toHaveBeenCalledWith("/integrations/monday/boards", { token: TOKEN });
  await user.click(await screen.findByRole("button", { name: "Marcar todos" }));
  await user.click(screen.getByRole("button", { name: "Importar 2 quadros" }));
  await waitFor(() => expect(screen.getAllByText(/Concluído|Falhou/)).toHaveLength(2));
  expect(api.post).toHaveBeenNthCalledWith(2, "/integrations/monday/import", { token: TOKEN, boardId: "1" });
  expect(api.post).toHaveBeenNthCalledWith(3, "/integrations/monday/import", { token: TOKEN, boardId: "2" });
  expect(screen.getByText(/16 tarefas novas, 0 atualizadas, 4 campos/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Abrir Projetos de Clientes" })).toHaveAttribute("href", "/dashboard/project/view/p1");
  expect(screen.getByText(/Carlos/)).toBeInTheDocument();
  expect(within(screen.getAllByRole("alert")[0]).getByText("Tasks: your plan allows 50")).toBeInTheDocument();
  // The footer button, not the dialog's own close (X) icon.
  await user.click(screen.getAllByRole("button", { name: "Fechar" }).find(button => !button.querySelector("svg"))!);
  expect(onClose).toHaveBeenCalled();
});

it("shows monday's refusal when the token is wrong", async () => {
  api.post.mockRejectedValueOnce({ response: { data: { message: "monday.com refused this token" } } });
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><MondayImport onClose={vi.fn()} /></MemoryRouter></QueryClientProvider>);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Token da API do monday.com"), TOKEN);
  await user.click(screen.getByRole("button", { name: "Conectar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("monday.com refused this token");
});
