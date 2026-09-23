# T26B — Consulta e exportação da auditoria

Publicada em 23/09/2026: frontend `b2bf2dfdde537e27974861c3866d8c9a066bc20f`, backend `ae94506fc827b277125bc895614f13f904f6a1d1`. Branches `feat/t26b-audit-view` integradas em `main`.

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
- Lint e builds aprovados nos dois repositórios. Frontend: oito testes locais direcionados aprovados; suíte completa aprovada no CI da branch e da main. Backend: sete testes novos aprovados; suíte completa de 317 testes aprovada no CI da branch e da main.
- A primeira rodada local encontrou uma falha de inicialização, corrigida antes do commit, e uma falha intermitente no teste de automações. Os 16 testes de inicialização/jobs passaram na repetição; os checks completos remotos também passaram.
- Railway confirmou o backend às 16:37:49 UTC; saúde da API com banco conectado. Cloudflare confirmou o frontend às 16:49:07 UTC; commit completo encontrado no bundle de produção `index-6QPiqT7G.js`.
