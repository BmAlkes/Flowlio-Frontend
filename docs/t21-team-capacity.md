# T21 — Capacidade da equipe

Disponível para donos e gestores em **Capacidade da equipe**, `/dashboard/team-capacity`.

- Disponibilidade semanal informada por membro ativo, com equipe opcional e filtro por semana/equipe. Ausência de configuração significa desconhecido; zero significa indisponível.
- Estimativas das tarefas abertas distribuídas proporcionalmente pelos dias corridos entre início e fim, para a semana UTC de segunda a domingo. Horas já registradas não são descontadas. A consulta reflete o estado atual, não um retrato histórico.
- Dependências pendentes, sobrecarga, tarefas sem estimativa/datas e tarefas sem responsável ativo aparecem explicitamente. Detalhes mostram as primeiras dez tarefas por membro.
- Visibilidade de projeto e tarefa respeitada. Havendo trabalho inacessível, o saldo não é apresentado como tempo livre. Nenhum título inacessível é retornado.
- A disponibilidade é uma referência recorrente, sem calendário de férias/feriados ou capacidade diária. Alterá-la afeta todas as semanas.
- API `GET /api/capacity?week=YYYY-MM-DD&team=...&userId=...`; `PUT /api/capacity/:userId` com `weeklyMinutes` (nulo ou inteiro entre 0 e 10080) e `team`. Organização e permissão vêm da sessão. Relatório limitado a 500 membros e 10 mil tarefas; acima disso retorna erro explícito.
- Migração `0008_member_capacity.sql`, sem alteração das estimativas existentes. Leitura em snapshot consistente; configuração transacional com validação de vínculo ativo.

Validação: 269 testes backend com PostgreSQL, sem skips; testes frontend para desconhecido/zero e falha de gravação. Navegador com dados fictícios em desktop, 320 px e hebraico, sem erros JavaScript ou transbordamento horizontal. Isso não representa uma sessão autenticada de produção.

## Correção complementar da T19

Publicada no frontend `98f4d25`: `Button asChild` produzia múltiplos filhos para o Slot e derrubava a página do projeto ao renderizar o link de rentabilidade. `Slottable` preserva o elemento de navegação. Regressão reproduzida antes da correção, testes com/sem loading e teste de renderização de `ProjectView` aprovados. Bundle de produção confirmado em 21/09/2026. A mesma publicação incluiu a T20, com backend `9215268` confirmado no Railway.
