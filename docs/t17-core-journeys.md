# T17 — CI e jornadas críticas

Branches: `test/t17-core-journeys`, nos dois repositórios.

## Onde conferir

GitHub → Actions → Quality. Os checks são `frontend-quality` e `backend-quality`. Esta etapa não adiciona uma tela à aplicação.

## Verificações

- Frontend: instalação pelo lockfile, lint sem avisos, todos os testes Vitest e build de produção. Base atual: 147 testes.
- Backend: instalação pelo lockfile, lint de erros estruturais, TypeScript, todas as suítes e build. Base local validada: 237 testes, zero ignorados.
- PostgreSQL 16 temporário: bancos separados para cotas de IA, numeração de faturas, faturamento de horas, cronômetros, migrações, jobs, paginação e observabilidade.
- Cobertura integrada: concorrência e rollback; organizações distintas; reenvio da mesma cobrança; disputa pelas mesmas horas; morte e recuperação de workers; atualização de schema existente; contratos e autenticação.
- PayPal Sandbox e conciliação T11 continuam fora do escopo publicado, conforme decisão do usuário. Os testes não equivalem a uma cobrança real no provedor.

As Actions usam permissões de leitura, credenciais de checkout não persistidas e versões fixadas por commit. Configuração baseada nas opções oficiais de [checkout](https://github.com/actions/checkout) e [setup-node](https://github.com/actions/setup-node). Eventos: push, pull request e execução manual; execuções antigas da mesma branch são canceladas.

## Reproduzir o backend

Disponibilizar PostgreSQL local nas portas 55442, 55439 e 55440, com usuário `postgres` e senha exclusivamente local `flowlio_local_test`. Executar `npm run test:ci`. O script cria apenas nomes fixos de bancos de teste; as suítes limpam seus próprios dados. Nunca apontar essas portas para túneis de produção.

O preload de CI ignora arquivos dotenv e define credenciais fictícias. Fixtures dos testes substituem integrações externas. `npm test` permanece disponível para a suíte rápida; `test:ci` ativa todas as suítes de PostgreSQL. O lint backend verifica erros estruturais de JavaScript/TypeScript e é complementado pelo typecheck; não é apresentado como uma revisão completa de estilo do código legado.

## Publicação e proteção

Executar os workflows na branch e conferir sucesso antes da integração. Exigir o check correspondente na proteção de `main`, com branch atualizada e aplicação também a administradores. Confirmar essa configuração no GitHub; a existência do arquivo YAML, sozinha, não bloqueia um merge.

Os deploys continuam nos provedores existentes após push de uma revisão aprovada na main. Checks de qualidade não substituem a confirmação de sucesso do Railway/Cloudflare. Não foi alterado schema nem comportamento do produto nesta etapa.
