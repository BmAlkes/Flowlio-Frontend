# T07 — Faturamento de horas

Branch: `feat/t07-time-invoicing`, nos dois repositórios. Backend: `1a40867`.

## Entrega

- `GET /invoices/billable-time`: horas concluídas, positivas e faturáveis de projetos do cliente, incluindo registros da equipe e respeitando organização e visibilidade de projeto/tarefa. Período com início inclusivo e fim exclusivo; limite explícito de 500 registros por seleção.
- `POST /invoices/from-time`: valida IDs e versões selecionadas, calcula valores no servidor em centavos e grava fatura, itens, vínculos, atividade e chave de repetição na mesma transação. Valores enviados pelo navegador não definem o total.
- A tarifa de cada registro prevalece. Uma tarifa padrão é usada apenas onde não existe tarifa registrada. Cada item é arredondado ao centavo antes da soma.
- Trava por organização, bloqueio dos registros e vínculo único impedem faturamento concorrente das mesmas horas. Repetir uma requisição retorna a fatura original; reutilizar a chave com outro conteúdo é rejeitado. Falha de gravação desfaz inclusive o número reservado.
- O modal substitui as duas chamadas antigas por uma única operação. Exibe seleção por registro, colaborador/projeto/tarefa, duração, tarifa, total e estados distintos de carregamento/erro/vazio. Em falha de conexão, conserva o pedido exato para recuperar a resposta. Conflitos exigem revisão da seleção.
- Faturas geradas exibem o ícone de relógio **View tracked hours**, que consulta `GET /invoices/:id/time-items` e mostra os valores registrados na emissão. Mantidos os componentes, fontes e destaque `#1797ba` do Flowlio.

## Dados e compatibilidade

- Migração aditiva `0035_time_invoicing.sql`: tabelas de itens/vínculos e requisições, restrições de integridade e trigger para proteger os campos faturados. A inicialização aguarda essa preparação antes de aceitar tráfego.
- Horas vinculadas não podem ser alteradas nos campos de faturamento nem excluídas enquanto sua fatura existir. Excluir a fatura libera os registros; a chave antiga continua registrada e não recria silenciosamente uma fatura excluída. Alterar apenas o status da fatura não libera as horas.
- Faturas anteriores não tinham IDs de horas persistidos. Não foi inventado um vínculo retroativo: clientes com descrições reconhecidas do fluxo antigo recebem aviso para revisar as faturas anteriores antes de selecionar horas. A prevenção automática cobre os vínculos criados pelo novo fluxo.
- Abas antigas que ainda enviam a descrição padronizada do fluxo descontinuado recebem orientação para atualizar a aplicação, antes de qualquer emissão.
- Publicar backend antes do frontend. Em recuperação, preservar tabelas, vínculos, chaves e contadores; manter o endpoint disponível ou desabilitar a ação. Não restaurar o fluxo de duas chamadas. Consolidação do histórico/snapshots de migração permanece na T09.

## Validação

- Backend: build aprovado e 144 testes aprovados; uma integração PostgreSQL de IA ignorada, sem alteração nessa área. Inclui 14 testes de numeração e 11 de faturamento com PostgreSQL 16 local descartável: concorrência, repetição, isolamento, alterações de tarifa, rollback, exclusão, itens persistidos e compatibilidade com navegador antigo.
- Frontend: lint limpo, build aprovado e 106 testes em 21 arquivos (`npm test -- --maxWorkers=2`). A execução com paralelismo padrão apresentou timeouts; a execução limitada passou integralmente. Os avisos preexistentes de build sobre Gantt e tamanho do PDF permanecem.
- Chromium com componente real, CSS da aplicação e API simulada: desktop, mobile e tema escuro com RTL, total conferido e ausência de transbordamento horizontal. Nenhuma fatura ou cobrança real foi criada nos testes. Arquivos auxiliares de prévia removidos.
- Para repetir as integrações, usar exclusivamente bancos locais descartáveis `flowlio_time_invoice_test` e `flowlio_invoice_test`, nas variáveis `TIME_INVOICE_TEST_DATABASE_URL` e `INVOICE_TEST_DATABASE_URL`, e executar `npm test` no backend.

## Onde conferir

1. `/dashboard/invoice` → aba de todas as faturas → **From Time Tracking**.
2. Escolher cliente e período, selecionar registros, preencher tarifa padrão somente se solicitada e conferir o total antes de criar.
3. Na fatura gerada, abrir o ícone de relógio **View tracked hours** para conferir os itens persistidos. Os registros vinculados deixam de aparecer como disponíveis para faturamento.

## Publicação

Backend `1a40867cdf760a27748242d643bd50e48192829c` integrado por fast-forward e enviado para `origin/main`; deploy no Railway confirmado pelo usuário em 17/09/2026.

Frontend `0a5c8b7fc964c3eb8af16395910b082a806c598a` integrado por fast-forward e enviado para `origin/main` após a confirmação do backend. Check **Cloudflare Pages** concluído com **success**, registrado em 17/09/2026 às 11:17:32 UTC. [Deploy confirmado no Cloudflare](https://dash.cloudflare.com/?to=/3a6e0eb38c63bf937ab269786e305640/pages/view/flowlio-frontend/33e98edf-8d2a-4e98-829d-30060ea83c2f).

O commit posterior de encerramento altera apenas a documentação; o código da aplicação corresponde à versão validada e publicada acima. Contêiner PostgreSQL, arquivos de prévia e capturas temporárias removidos. Alterações locais de `.claude-flow` preservadas fora dos commits.
