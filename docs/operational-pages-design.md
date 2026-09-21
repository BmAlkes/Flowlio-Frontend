# Refinamento visual das telas operacionais

Branch: `redesign/operational-pages`.

As telas T15, T19, T21 e T22 receberam uma hierarquia visual mais presente, preservando a tipografia do sistema, a escala dos títulos, os componentes existentes e o azul Flowlio `#1797ba`. Superfícies, bordas e textos usam os tokens do tema claro/escuro; azul mais escuro é usado em textos e botões para contraste.

- **Histórico operacional:** indicadores por origem com ícones, alertas destacados e histórico em um painel próprio, com filtros e referências de erro preservados. `/dashboard/settings/operations` e `/superadmin/operations`.
- **Rentabilidade:** filtros agrupados, indicadores financeiros com resultado em destaque e bloco separado de horas e valores ainda não faturados. `/dashboard/project/view/:id/profitability`.
- **Capacidade:** cartões por pessoa, identificação da equipe, destaque de sobrecarga e barra de ocupação quando há disponibilidade positiva conhecida. Não apresenta disponibilidade desconhecida como zero; a barra não representa progresso da tarefa. `/dashboard/team-capacity`.
- **Notificações por fluxo:** editor e regras em colunas no desktop; evento, condição e mensagem conectados visualmente; estado ativo/pausado e ações explícitas. `/dashboard/settings/workflows`.

Componentes compartilhados em `src/components/ui/workspace-page.tsx`. Não foram alterados endpoints, permissões, cálculos financeiros ou execução das regras. Não há migração nem deploy do backend para esta entrega.

Validação: lint, 185 testes existentes e build de produção aprovados. As quatro telas foram revisadas em desktop, 390/320 px e hebraico/RTL com tema escuro, sem erros JavaScript ou overflow horizontal. A revisão corrigiu também as chaves de tradução do status do projeto nas regras. Revisão visual usa dados fictícios; não substitui validação autenticada em produção. Permanecem os avisos preexistentes do build sobre Gantt e tamanho do chunk de PDF.
