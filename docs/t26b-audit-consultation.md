# T26B — Consulta e exportação da auditoria

Implementação de 23/09/2026, nas branches `feat/t26b-audit-view` de frontend e backend. Publicação em validação.

## Uso

- Configurações → Auditoria de negócio (`/dashboard/settings/audit`).
- Projeto → Ferramentas → Auditoria de negócio abre o mesmo histórico com o projeto fixado no filtro.
- Período UTC, pessoa por nome atual/ID, ação, tipo e ID do recurso. Filtros só são aplicados ao confirmar.
- Alterações antes/depois, autor humano/sistema/desconhecido, horário UTC e referências da operação. Datas e valores originais são preservados; orçamento não recebe moeda presumida.
- Paginação de 50 eventos. CSV contém todos os eventos autorizados dos filtros aplicados, até 5.000. Acima disso é necessário refinar os filtros.

## API e proteção de dados

`GET /api/audit` e `GET /api/audit/export`, autenticados, para proprietários, gestores e papéis administrativos com organização ativa. Nenhuma migração nova: consulta o registro imutável da T26A.

- A organização e a visibilidade atual do projeto são verificadas no servidor, também na exportação. Proprietário não ganha acesso a projetos privados de terceiros.
- Gestores não recebem orçamento nem eventos de alteração de membros/permissões. Eventos sem campos visíveis são removidos antes da paginação.
- Apenas campos do catálogo T26A são retornados. Nome do autor só é resolvido para vínculo ativo na mesma organização. Os valores das alterações permanecem os registrados na operação.
- Projetos excluídos/inacessíveis não aparecem; seus eventos continuam armazenados. Não há reconstrução retroativa de permissões nem histórico anterior à ativação da T26A.
- Consulta usa transação de leitura, UTC explícito e timeout de 15 segundos. Cursor preserva microssegundos e desempata pelo ID.
- CSV com BOM, escape de aspas e neutralização de fórmulas de planilha. Respostas HTTP sem cache. Exportação cancelada quando a tela é desmontada ou muda de sessão/organização/permissões.
- Retenção sem prazo de expiração; nenhuma API comum de alteração ou exclusão dos eventos.

## Validação

- Sete testes PostgreSQL novos: organização/papel/visibilidade, campos financeiros, filtros e datas UTC, paginação com microssegundos, resolução do autor, validação/imutabilidade, CSV e limite de exportação.
- Sete testes da tela: comparação, filtros explícitos com escopo do projeto, paginação, erro, limite do CSV, cancelamento e acesso negado.
- Revisão em Chrome com dados fictícios: desktop 1440 px, mobile 390/320 px, hebraico RTL/escuro, vazio/erro e teclado; sem overflow nem erros JavaScript.
- Lint, build, testes completos e publicação: resultados finais registrados após conclusão.
