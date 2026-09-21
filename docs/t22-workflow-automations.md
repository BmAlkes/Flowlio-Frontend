# T22 — Notificações por fluxo

Donos e gestores: **Configurações → Notificações por fluxo**, `/dashboard/settings/workflows`.

Gatilhos: conversão de proposta aprovada em projeto; aprovação de entrega; solicitação de ajustes. Condição opcional: status atual do projeto no momento da avaliação. Ação disponível: notificação interna para o próprio autor da regra, com título e mensagem configurados. Esta versão não envia e-mails, cria tarefas nem executa ações externas.

Regras são criadas pausadas. A simulação lê até 100 eventos históricos, informa quantos eventos acessíveis correspondem à regra e não grava efeitos. Ativar ou reativar processa apenas eventos posteriores à ativação, aproximadamente a cada minuto enquanto o worker estiver funcionando. Pausar preserva o histórico. Conteúdo de regra é imutável; máximo de 20 regras por pessoa e 100 por organização.

O job persistente `workflow-events` distribui trabalho por organização. Transações gravam notificação e recibo juntos; unicidade por regra/evento evita duplicações em concorrência e retries. Até 100 eventos por regra são avaliados em cada execução. Eventos gerados por notificações não alimentam os gatilhos: encadeamento máximo de uma ação. Eventos permanecem dependentes da retenção de `recent_activities`.

Permissões do autor e vínculo ativo são reavaliados; revogação pausa a regra. Projetos privados e organizações isolados. Simulação não expõe IDs ou títulos inacessíveis. Histórico mostra as últimas 50 avaliações com resultado, sem payload privado. A regra e seu histórico só são gerenciados pelo autor no contexto da organização.

API: `GET/POST /api/workflows`, `PATCH /api/workflows/:id` (`enabled`), `GET /api/workflows/:id/simulate`, `GET /api/workflows/:id/history`. Migração `0009_workflow_rules.sql`.

Testes cobrem simulação sem gravação, retries concorrentes, condição, visibilidade, isolamento, revogação, pausa/reativação, rollback e payload forjado. Frontend cobre simulação sem ativação, ativação explícita e falha. Conferência visual usa dados fictícios; não representa uma conta de produção.
