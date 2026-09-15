# Plano de trabalho do Flowlio

## Acordo de execução

- Executar uma tarefa por vez, com branch nova a partir da principal atualizada em cada repositório afetado.
- Preservar alterações locais de terceiros e versionar somente arquivos da tarefa.
- Registrar escopo, validação, commit, merge e resultado do deploy nesta lista.
- Exigir lint, testes relevantes e build sem erros antes do merge. Conferir interface em desktop, mobile, tema escuro e RTL quando aplicável.
- Fazer merge e deploy após os critérios passarem, conforme autorização do usuário. Uma falha impede a publicação até sua resolução.
- Confirmar o resultado do deploy pelo provedor e/ou artefatos servidos; push isolado não comprova publicação.
- Alterações de banco precisam de migração revisada, compatibilidade entre versões e plano de recuperação. Nunca testar pagamentos reais ou operações destrutivas em dados de produção.
- FE: Flowlio-Frontend; BE: Flowlio-Backend. Não presumir que contratos locais equivalem ao ambiente publicado.

## Sequência e critérios de aceite

| ID | Tarefa / branch sugerida | Repositório | Critério de conclusão | Dependências | Estado |
| --- | --- | --- | --- | --- | --- |
| T01 | Base de qualidade e plano — `chore/t01-quality-baseline` | FE | Remover erros e avisos atuais de lint; manter verificações para variáveis não utilizadas, permitindo argumentos intencionalmente prefixados por `_`; testes e build aprovados; registrar processo de publicação. | — | Publicada |
| T02 | Redesenhar ficha do cliente — `feat/t02-client-detail-redesign` | FE | Nova composição integral de `/dashboard/client-management/:clientId`, overview integrado, abas e ações preservadas, propostas acessíveis, estados de erro/vazio/loading, mobile, dark e RTL; métricas sem dados inventados. | T01 | Implementada e validada |
| T03 | Políticas de autorização — `fix/t03-resource-authorization` | FE + BE | Matriz por papel/ação/recurso; proteger financeiro, exclusões e recursos privados no servidor; testes negativos entre clientes, membros e organizações. | T01 | Publicada (confirmada pelo usuário) |
| T04 | Sessão e organização ativa — `fix/t04-session-organization` | FE + BE | Unificar cliente auth; impedir fallback para vínculo inativo; revisar fluxo de cliente e revogação; cache privado isolado por identidade/organização; testar login, logout, OTP e 2FA. | T03 | Implementada; publicação em validação |
| T05 | Limitação de IA — `fix/t05-ai-rate-limits` | BE | Autenticação antes de limites por identidade; testes de 401/403/429, cotas e concorrência; não duplicar contabilização de uso. | T03 | Pendente |
| T06 | Numeração de faturas — `fix/t06-invoice-sequences` | BE | Contador transacional por organização/série, migração e testes de concorrência/exclusão; emissão manual e recorrente usam a mesma regra. | T03 | Pendente |
| T07 | Faturar horas atomicamente — `feat/t07-time-invoicing` | FE + BE | Endpoint único, seleção autorizada de horas da equipe, itens/vínculos persistidos, cálculo no servidor, respeito a billable e tarifa, proteção a repetição/concorrência e rollback; sem cobrança duplicada. | T03, T06 | Pendente |
| T08 | Confiabilidade do cronômetro — `fix/t08-time-tracking` | FE + BE | Definir política de timer simultâneo; impedir registros ativos duplicados; operações start/stop consistentes; testar reenvio e múltiplas abas. | T03 | Pendente |
| T09 | Migrações e release — `chore/t09-release-migrations` | BE | Separar geração/build/aplicação; migrar antes de liberar tráfego; retirar patches paralelos do startup; validar banco novo e atualização de schema existente. | T06, T07 | Pendente |
| T10 | Jobs persistentes — `feat/t10-durable-jobs` | BE | Separar workers de HTTP, reserva exclusiva de execução, retry e idempotência; testar reinício e duas instâncias em recorrência, notificações e webhooks. | T09 | Pendente |
| T11 | Conciliação de assinaturas — `fix/t11-subscription-reconciliation` | BE | Eventos persistidos/deduplicados, identificação indexada do provedor, transições consistentes, falha recuperável e testes de sandbox; revisar renovação e calendário. | T09, T10 | Pendente |
| T12 | Contratos e estados de domínio — `refactor/t12-api-contracts` | FE + BE | Contratos verificáveis, erros tipados, datas serializadas como strings, status canônicos de cliente/proposta/projeto e teste que detecte endpoint ausente. | T07 | Pendente |
| T13 | Modularização incremental — `refactor/t13-domain-modules` | FE + BE | Extrair casos de uso de login, projetos, pagamentos e automações; componentes e serviços pequenos por responsabilidade; nenhuma alteração funcional inadvertida. | T12 | Pendente |
| T14 | Cache, paginação e consultas — `perf/t14-data-access` | FE + BE | Paginar projetos/tarefas/horas; filtros reais no servidor; chaves de cache por escopo, invalidação direcionada, revisão do timestamp em GET e polling; medir consultas/latência antes e depois. | T04, T12 | Pendente |
| T15 | Observabilidade — `feat/t15-observability` | FE + BE | Captura persistente de falhas UI/API/jobs, correlation ID e versão; métricas de erro/latência; redigir dados sensíveis; alertas acionáveis e teste do fluxo. | T10 | Pendente |
| T16 | Localização e acessibilidade — `feat/t16-localization-accessibility` | FE + BE | Moeda e fuso explícitos, formatação consistente, traduções completas nos fluxos core, teclado/foco, contraste, RTL e limites de data testados. | T12 | Pendente |
| T17 | CI e testes dos fluxos críticos — `test/t17-core-journeys` | FE + BE | Pipeline obrigatório de lint/test/build, banco de teste e contratos; jornadas de autenticação, autorização, execução e cobrança; nunca usar dados reais. | T03–T12 | Pendente |
| T18 | Proposta para projeto — `feat/t18-proposal-to-project` | FE + BE | Aprovação prepara projeto por template com tarefas/marcos/orçamento; revisão, rastreabilidade e proteção contra criação duplicada. | T03, T10, T12 | Pendente |
| T19 | Rentabilidade — `feat/t19-profitability` | FE + BE | Relacionar receitas, despesas, custo das horas e saldo não faturado; distinguir custo de tarifa de venda; moeda/competência consistentes e fórmulas testadas. | T07, T11, T16 | Pendente |
| T20 | Aprovação de entregas — `feat/t20-delivery-approval` | FE + BE | Cliente aprova/rejeita versão ou marco específico, histórico e pedido de ajuste; política de acesso e prevenção de aprovação de versão desatualizada. | T03, T12 | Pendente |
| T21 | Capacidade da equipe — `feat/t21-team-capacity` | FE + BE | Disponibilidade semanal, estimativas, dependências, sobrecarga e filtros por equipe; estados sem estimativa explícitos. | T08, T14, T16 | Pendente |
| T22 | Automações entre módulos — `feat/t22-workflow-automations` | FE + BE | Gatilhos/condições/ações sobre eventos persistidos, simulação, histórico, limites de encadeamento e idempotência. | T10, T18, T20 | Pendente |
| T23 | Onboarding e ativação — `feat/t23-core-onboarding` | FE + BE | Checklist por papel levando ao primeiro cliente/projeto/entrega; persistência e métricas de ativação, sem completar etapas ficticiamente. | T18 | Pendente |
| T24 | Documentação operacional — `docs/t24-domain-runbooks` | FE + BE | README real, instalação, papéis, contratos, faturamento, jobs, releases e recuperação documentados e conferidos. | Atualizada ao longo das tarefas | Pendente |

T02 foi antecipada por pedido explícito do usuário. T03 inicia a consolidação das regras do core imediatamente depois. Cada tarefa grande pode ser subdividida em entregas menores com branches próprias, preservando seus critérios de aceite.

## Direção do redesenho T02

- Público: proprietário/gestor acompanhando o relacionamento e a entrega de um cliente.
- Objetivo: entender o que está acontecendo, o que exige ação e acessar cada módulo com o contexto do cliente.
- Identidade: ficha lateral de contato; área principal ampla; navegação por abas; prioridades e entregas como foco.
- Overview: projetos ativos, andamento das tarefas, prazos, propostas, arquivos, atividade e resumo das faturas disponíveis. Resumos financeiros devem respeitar moedas e estados reais; dados indisponíveis não equivalem a zero.
- Preservar edição, status, portal, exclusão, criação/abertura de projeto, marcos, timeline e arquivos. Evitar links que percam o contexto ou ações que ainda não tenham suporte na API.
- Design: cores semânticas globais (background, foreground, primary, secondary, border), fonte padrão do sistema, escala tipográfica em rem, números tabulares e espaçamento consistente. Layout lateral é a assinatura; evitar repetir grades de cartões equivalentes.

## Registro das entregas

- Base analisada: frontend `e97dc6c`; 59 testes em 11 arquivos; typecheck FE/BE aprovado; lint com 14 erros e 3 avisos antes de T01.
- Deploy documentado do frontend: Cloudflare Pages via GitHub. A conexão e o resultado efetivo serão verificados a cada publicação.
- T01: commit `b524b7b`, integrado em `main`. Lint sem erros/avisos, 59 testes aprovados e build de produção aprovado. Cloudflare Pages: check `success`, deployment `e3281ee2-735c-456a-8200-c07deb489315`. Avisos existentes do build: anotações de biblioteca Gantt e chunk de PDF acima de 1 MB.
- T02: componentes separados para perfil, overview, listas, carregamento/erro e transformação dos dados. Sete abas (incluindo propostas), seleção via query string, contato/portal/status preservados, marcos operáveis por teclado, traduções EN/PT/ES/HE. Faturas em aberto excluem rascunhos/canceladas/pagas; números não recebem moeda inventada porque o contrato atual não informa moeda. Fluxo completo de faturamento continua em T07/T16.
- T02: validação local em navegador com API inteiramente simulada: sete abas, atualização de status e marco, link direto de aba, criação de projeto com clientId, desktop, mobile 390px sem overflow, dark/RTL com números na ordem correta, erro parcial e lista vazia; zero erros JavaScript. Validação final: lint sem erros/avisos, 65 testes em 12 arquivos aprovados e build de produção aprovado. Publicação será confirmada pelo check do Cloudflare Pages após merge. Permanecem os avisos preexistentes da biblioteca Gantt e do chunk de PDF.

- Refinamento T02 — branch `fix/t02-client-design-system`: removida a paleta exclusiva e a fonte Outfit dos títulos; cores e raios usam tokens globais; textos usam escala 12/14 px, seções 18 px, títulos 24 px; botão principal usa o componente padrão. Revisão local com API simulada aprovada em desktop/mobile/dark/RTL, sete abas e ações existentes.

- Ajuste de marca T02 — branch `fix/t02-client-brand-accent`: azul `#1797ba` em ícones, progresso, aba ativa e ação principal; fundos suaves derivados da marca e variações de texto para contraste. Mantidas tipografia e superfícies aprovadas. Revisão em navegador com dados simulados aprovada, incluindo mobile e dark/RTL.

## T03 — Matriz de autorização e implementação

Branches: `fix/t03-resource-authorization` em FE e BE.

| Papel | Projetos/tarefas | Exclusões | Financeiro | Colaboração |
| --- | --- | --- | --- | --- |
| Proprietário e administradores | Criar/editar; leitura respeita organização e visibilidade | Recursos acessíveis | Faturas/propostas e custos internos | Recursos acessíveis |
| Gestor da organização | Criar/editar recursos acessíveis | Recursos acessíveis | Faturas/propostas; sem custos internos de projetos | Recursos acessíveis |
| Membro | Criar/editar recursos acessíveis | Recursos acessíveis, conforme permissões existentes | Sem faturas/propostas administrativas ou custos internos | Recursos acessíveis |
| Operador | Ler/editar recursos acessíveis | Sem exclusão de projetos/tarefas | Sem custos internos | Recursos acessíveis |
| Viewer | Ler; registrar tempo nas próprias tarefas acessíveis | Sem exclusão de projetos/tarefas | Sem custos internos | Comentários/arquivos acessíveis; exclusão somente do próprio arquivo |
| Cliente | Projetos do próprio cliente; tarefas públicas desses projetos | Sem exclusão de projetos/tarefas | Próprias faturas/propostas pelo portal | Próprios recursos; comentários e uploads; exclusão somente do próprio arquivo |
| Papel desconhecido / sem organização | Negado | Negado | Negado | Negado |

- Organização vem da sessão. O campo `organizationId` enviado no corpo não autoriza acesso.
- Para equipe, projeto privado exige autoria ou atribuição; tarefa exige também acesso ao projeto e sua própria visibilidade/autoria/atribuição. O portal resolve o vínculo do usuário com o cliente no servidor; um projeto público de outro cliente continua inacessível.
- As verificações são executadas antes dos controllers de alterações, despesas, marcos, comentários, versões e arquivos. Listagens usam filtros SQL equivalentes; referências de projeto, cliente, responsável e dependências são verificadas.
- Orçamento não autorizado retorna `null` nos contratos de projeto e não pode ser enviado ou apagado por usuários sem acesso financeiro. Custos, alertas financeiros e relatórios detalhados exigem a mesma política do frontend.
- Arquivos estruturados e anexos legados herdam o acesso ao projeto/tarefa/cliente. Um upload não pode vincular o arquivo ao projeto de outro cliente.
- Interface: campo de orçamento, ações de criação/edição/exclusão, aba financeira de relatórios e consulta de alertas respeitam as permissões. Tipografia e cores da T02 preservadas.
- Testes HTTP carregam as rotas reais e substituem sessão, repositório e controllers terminais por fixtures; requisições negadas não executam controllers. Testes de consulta usam Drizzle real com driver simulado e incluem o controller de tarefas por cliente com organização adulterada.
- Não foram realizadas operações de teste em dados reais. A validação não substitui teste integrado com PostgreSQL e identidades de homologação. Autenticação, revogação e seleção de organização ativa permanecem na T04.
- Nenhuma alteração de schema. Compilação BE usa `tsc` + `tsc-alias`; a geração automática de migrações do script legado `build` não foi executada nesta tarefa. A separação definitiva do processo permanece na T09.
- Backend: usuário confirmou deploy automático após push em `main`; conferir resultado do provedor. Frontend: Cloudflare Pages. Status de publicação será confirmado após os checks finais.
- Validação final T03: backend com 64 testes aprovados e compilação de produção (`tsc` + `tsc-alias`) aprovada; frontend com 75 testes aprovados, lint limpo e build aprovado. Nenhuma migração foi gerada ou aplicada.


## T04 — Sessão, organização ativa e autenticação

Branches: `fix/t04-session-organization` em FE e BE. T03 publicada conforme confirmação do usuário.

- Um único cliente Better Auth no frontend atende senha, OTP, 2FA, sessão e logout. O export anterior do provider permanece compatível.
- Perfil identificado por usuário e sessão, resposta conferida antes de compor o contexto. Cadastro pendente conserva plano/dados de pagamento e segue para checkout/pricing, sem permissões da organização.
- Trocar conta, sessão, organização ou permissões cancela consultas, remove dados privados e remonta seus consumidores. Respostas atrasadas de alterações são descartadas; erros explícitos de revogação atualizam o contexto. Um 403 de recurso isolado não encerra a sessão.
- Backend consulta sessão e permissões atuais, sem cache de autorização. Somente vínculo ativo é selecionado, com ordem determinística. Vínculo removido/inativo e falha de consulta não permitem continuar sem organização. Superadmin continua podendo administrar sem vínculo de organização; cadastro pendente continua acessível para pagamento.
- Portal exige vínculo real e acesso habilitado em cada requisição, inclusive quando o usuário também possui vínculo de equipe. Suspensão, período de teste e assinatura são verificados também para clientes.
- Conexões de notificações verificam o identificador real da sessão e o acesso no handshake; conexões abertas são revalidadas a cada 15 segundos e desconectadas após revogação.
- Login trata o desafio de 2FA do Better Auth antes de consultar o perfil. O código de segundo fator é vinculado ao desafio após senha; não é reutilizado como senha nem como verificação simples de e-mail. Login só indica sucesso depois de confirmar a sessão da mesma conta. Verificação de e-mail não cria uma sessão automaticamente; OTP de login não contorna uma conta com 2FA habilitado.
- Contas legadas com o sinalizador de 2FA recebem o registro necessário do plugin após validação das credenciais, usando a tabela existente. Nenhuma alteração de schema ou migração. E-mail de segundo fator usa o remetente Brevo já configurado.
- Testes exercitam a configuração real de autenticação com adaptador em memória e envio de e-mail simulado, além dos guards reais com banco substituído por fixtures. Não foram utilizados dados reais nem envio de e-mail de produção. A compilação BE usa `tsc` + `tsc-alias`, sem executar o gerador legado de migrações.
- Publicação: push de `main` aciona Cloudflare Pages no frontend e o deploy automático do backend informado pelo usuário. Confirmar resultado antes de declarar a versão publicada.

### Onde conferir na aplicação

Validação final: FE com lint sem erros/avisos, 98 testes em 18 arquivos e build aprovado; BE com 84 testes e compilação `tsc` + `tsc-alias` aprovada. Permanecem somente os avisos preexistentes do build FE sobre Gantt e tamanho do chunk de PDF. Commit BE: `911266c`. Nenhuma migração gerada ou aplicada.

Correção de regressões T04 — branch `fix/t04-auth-regressions`: BrowserRouter permanece montado durante a troca de sessão, preservando a navegação do login; formulários de senha/OTP do modal não propagam submit ao formulário de perfil; erros de envio de OTP não são rotulados como senha incorreta; estado de sucesso do modal e descrição traduzida corrigidos. Lint limpo, 102 testes em 20 arquivos e build aprovados. Verificação em navegador com aplicação real e API simulada: login por senha → dashboard, senha incorreta seguida de nova tentativa e ativação por OTP sem atualização indevida de perfil, descrição traduzida e login com 2FA → dashboard. Conferir em `/auth/signin` e `/dashboard/settings`. A publicação original T04 (`3446c7a` FE / `911266c` BE) foi confirmada por Cloudflare e Railway; a correção altera somente o frontend.

1. `/auth/signin`: entrar com senha; para conta com 2FA ativado, conferir o código em `/auth/signin-otp`. Código incorreto não libera acesso; voltar ao login funciona.
2. Configurações → segurança/2FA (`/dashboard/settings` e telas equivalentes de cada papel): manter a ativação por e-mail e testar a entrada seguinte.
3. Gestão de usuários (`/dashboard/user-management`): desativar um vínculo de teste e verificar que a sessão já aberta não consegue fazer a próxima consulta protegida.
4. Gestão de clientes → abrir cliente (`/dashboard/client-management/:clientId`) → acesso ao portal: desabilitar para uma conta de teste; a sessão do portal deve perder acesso na próxima requisição. Notificações abertas são revogadas em até 15 segundos.
5. Sair e entrar com outra conta no mesmo navegador: conferir projetos, tarefas, clientes e faturas sem dados da conta anterior. O logout com falha no servidor não é apresentado como concluído.
6. Cadastro com pagamento pendente: continuar em `/checkout` ou `/pricing`, sem acesso antecipado ao dashboard.
