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
| T04 | Sessão e organização ativa — `fix/t04-session-organization` | FE + BE | Unificar cliente auth; impedir fallback para vínculo inativo; revisar fluxo de cliente e revogação; cache privado isolado por identidade/organização; testar login, logout, OTP e 2FA. | T03 | Ativação de 2FA confirmada pelo usuário; revisão completa do fluxo adiada |
| T05 | Limitação de IA — `fix/t05-ai-rate-limits` | BE | Autenticação antes de limites por identidade; testes de 401/403/429, cotas e concorrência; não duplicar contabilização de uso. | T03 | Publicada, incluída na versão confirmada da T06 |
| T06 | Numeração de faturas — `fix/t06-invoice-sequences` | BE | Contador transacional por organização/série, migração e testes de concorrência/exclusão; emissão manual e recorrente usam a mesma regra. | T03 | Publicada; Railway confirmou sucesso |
| T07 | [Faturar horas atomicamente](./t07-time-invoicing.md) — `feat/t07-time-invoicing` | FE + BE | Endpoint único, seleção autorizada de horas da equipe, itens/vínculos persistidos, cálculo no servidor, respeito a billable e tarifa, proteção a repetição/concorrência e rollback; sem cobrança duplicada. | T03, T06 | Publicada; Railway confirmado pelo usuário e Cloudflare com sucesso |
| T08 | Confiabilidade do cronômetro — `fix/t08-time-tracking` | FE + BE | Definir política de timer simultâneo; impedir registros ativos duplicados; operações start/stop consistentes; testar reenvio e múltiplas abas. | T03 | Publicada; Railway e Cloudflare confirmaram sucesso |
| T09 | Migrações e release — `chore/t09-release-migrations` | BE | Separar geração/build/aplicação; migrar antes de liberar tráfego; retirar patches paralelos do startup; validar banco novo e atualização de schema existente. | T06, T07 | Concluída e publicada |
| T10 | Jobs persistentes — `feat/t10-durable-jobs` | BE | Separar workers de HTTP, reserva exclusiva de execução, retry e idempotência; testar reinício e duas instâncias em recorrência, notificações e webhooks. | T09 | Concluída e publicada |
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

Correção adicional T04 — branch `fix/t04-2fa-credential-account`, commit BE `6145134`: a verificação de senha e a desativação de 2FA selecionam o vínculo `credential` do usuário autenticado. Antes, uma conta vinculada ao Google podia ser selecionada primeiro, retornando “Unable to verify password for this account” mesmo com uma credencial de senha válida. Falha reproduzida nos dois controladores antes da correção; 12 testes novos aprovados com hash/verificador reais, incluindo senha incorreta, conta sem credencial e isolamento entre usuários. Suíte BE: 116 testes aprovados, 1 integração PostgreSQL de IA ignorada por não se aplicar à alteração; build `tsc` + `tsc-alias` aprovado. Merge e push de `main` concluídos; Railway iniciou o deploy, ainda sem confirmação de sucesso. Nenhuma migração ou alteração visual. Conferir em `/dashboard/settings` → 2FA: informar a senha atual, receber/validar o OTP, sair e entrar novamente para conferir o segundo fator; testar também desativação com senha correta e rejeição de senha incorreta.

1. `/auth/signin`: entrar com senha; para conta com 2FA ativado, conferir o código em `/auth/signin-otp`. Código incorreto não libera acesso; voltar ao login funciona.
2. Configurações → segurança/2FA (`/dashboard/settings` e telas equivalentes de cada papel): manter a ativação por e-mail e testar a entrada seguinte.
3. Gestão de usuários (`/dashboard/user-management`): desativar um vínculo de teste e verificar que a sessão já aberta não consegue fazer a próxima consulta protegida.
4. Gestão de clientes → abrir cliente (`/dashboard/client-management/:clientId`) → acesso ao portal: desabilitar para uma conta de teste; a sessão do portal deve perder acesso na próxima requisição. Notificações abertas são revogadas em até 15 segundos.
5. Sair e entrar com outra conta no mesmo navegador: conferir projetos, tarefas, clientes e faturas sem dados da conta anterior. O logout com falha no servidor não é apresentado como concluído.
6. Cadastro com pagamento pendente: continuar em `/checkout` ou `/pricing`, sem acesso antecipado ao dashboard.

## T05 — Limites e contabilização de IA

Branch: `fix/t05-ai-rate-limits` no backend; mesma branch no frontend somente para este registro.

- Geração exige sessão, papel permitido, organização e acesso do plano antes de consumir limites. Viewers têm cotas nas suas rotas próprias. Monitoramento e compra de tokens não passam pelos limites de geração; superadmin continua consultando organizações sem vínculo de equipe.
- Frequência compartilhada entre instâncias pelo PostgreSQL, usando a tabela `throttle` existente: 15 tentativas/minuto por usuário, 30/minuto e 60/hora por organização, e 5 imagens/hora por usuário. A última tentativa permitida funciona. Excesso retorna 429 com `Retry-After`; falha do armazenamento retorna 503. Superadmin preserva a exceção de frequência.
- Cada chamada ao provedor reserva cota de forma transacional e registra um único lançamento. A conclusão troca a reserva pelo consumo real, sem cobrança duplicada em conclusões repetidas. Cotas pessoais consideram reservas em andamento. Imagens mantêm os 1.000 créditos existentes por geração, identificados como créditos fixos.
- Sugestões, categorias, descrições, conversas, análise de arquivos, imagens, tarefas, propostas e resumos passam pela mesma contabilização. Resumos automáticos verificam acesso do plano e usam o proprietário ativo da organização como responsável pelo consumo.
- A reserva de texto usa uma estimativa conservadora do prompt e o teto de saída; uma solicitação pode ser recusada se o saldo não cobrir essa reserva. O saldo não utilizado é liberado ao receber o consumo real. Uma rejeição definitiva do provedor libera a reserva; timeout, conexão interrompida ou falha ao persistir o resultado mantêm o lançamento `pending`, sem repetição automática. Esses casos exigem conciliação operacional; reservas mensais deixam de comprometer o saldo na renovação. O lançamento guarda o identificador, a reserva e o período para investigação, sem gravar o prompt.
- Renovação mensal também ocorre ao reservar, sem depender da pontualidade do cron. Resposta de período anterior não devolve créditos ao mês seguinte. Criação concorrente de cota padrão não duplica registros. Falhas de verificação não liberam chamadas.
- Validação: 117 testes aprovados, incluindo 13 testes em PostgreSQL 16 local descartável para concorrência, isolamento entre organizações, rollback, criação de cotas, virada do período e conclusão idempotente. TypeScript e build (`tsc` + `tsc-alias`) aprovados. Chamadas ao provedor foram simuladas; nenhum consumo de IA, pagamento ou dado de produção foi usado. Nenhuma migração gerada ou aplicada.
- Para repetir os testes de integração: definir `AI_TEST_DATABASE_URL` para um PostgreSQL local com banco `flowlio_ai_test` e executar `npm test` no backend. O teste cria e remove um schema próprio; sem essa variável, somente a integração PostgreSQL é ignorada.
- Publicação: commit BE `50dcb86`, integrado por fast-forward e enviado para `origin/main`. Em 15/09/2026, o GitHub/Railway informou `pending` / `Railway is deploying the service` para esse commit. A consulta posterior de acompanhamento não foi autorizada; o sucesso da publicação ainda não foi confirmado. [Acompanhar o deploy no Railway](https://railway.com/project/3595bd46-8b28-44e2-9c21-37cc7c5d89c2/service/3daf0a4e-4463-4d68-8c56-3ab91d5aab34?id=92990a63-2d0b-4d18-a484-736a3aca5a4e&environmentId=40908654-b4e2-42f7-b8b6-99c23bf7a4d1). O frontend desta tarefa altera somente este documento.

### Onde conferir a T05 na aplicação

1. `/dashboard`: usar o assistente de IA e conferir o cartão **AI Token Usage** após concluir uma geração e atualizar a página. Análises de arquivos podem gerar mais de uma chamada real, cada qual com seu consumo.
2. `/viewer/ai-assistant`: conferir geração com saldo e bloqueio quando a cota da organização ou do usuário não comportar a chamada.
3. `/superadmin/ai-monitoring`: acompanhar consumo e registros; configurar uma cota baixa em uma organização de teste e conferir os bloqueios. Monitoramento e compra de tokens devem continuar disponíveis com a cota esgotada.
4. Em testes controlados, excesso de frequência retorna 429 e informa o tempo de espera. Não é necessário gerar tráfego pago em produção para validar esse cenário: ele está coberto pelos testes automatizados.

## T06 — Numeração transacional de faturas

Branch: `fix/t06-invoice-sequences` no backend; frontend somente para atualizar este plano. O usuário confirmou que conseguiu ativar o 2FA e autorizou seguir para T06, deixando a revisão completa do fluxo para depois.

- A contagem de faturas foi substituída por contadores persistentes por organização e série. Permanecem `S1-00001` para emissão manual e `REC-00001` para recorrência, com no mínimo cinco dígitos. Cada série avança independentemente; excluir a última fatura ou todas as faturas não reduz o contador.
- A migração aditiva `0034_invoice_number_sequences.sql` cria a tabela de contadores e um trigger PostgreSQL. O incremento e a inserção da fatura fazem parte da mesma transação: falha desfaz ambos. Os dois caminhos de criação usam o mesmo serviço. O trigger também trata os números calculados pela versão anterior durante deploy gradual ou rollback do código.
- Os contadores começam no maior número encontrado nas faturas e nos registros retidos de criação/exclusão em `recent_activities`. Nenhuma fatura existente é renumerada. Números de faturas antigas excluídas sem qualquer histórico preservado não podem ser reconstruídos. Séries personalizadas fora de `S1`/`REC` permanecem inalteradas.
- A recorrência bloqueia o template na transação, confere a ocorrência atual e avança sua data junto com a fatura. Duas execuções simultâneas da mesma ocorrência emitem apenas uma fatura. Falha na atualização do template também desfaz a emissão e seu número.
- A nova versão aguarda a preparação do schema e a migração obrigatória antes de abrir HTTP e iniciar os jobs. A aplicação da migração usa transação, bloqueio de escrita durante a inicialização dos contadores e trava compartilhada entre instâncias. Falha nessa preparação impede a inicialização da nova versão.
- O build passa a executar apenas `tsc` e `tsc-alias`; gerar migrações fica como comando explícito `dbgenerate`. Esse ajuste mínimo da T09 foi antecipado para impedir geração de SQL não revisado durante o deploy da T06. A consolidação do histórico/snapshots e dos patches legados continua na T09.
- Recuperação: se for necessário reverter o código, preservar a tabela de contadores e o trigger; eles aceitam as inserções da versão anterior. Não remover contadores nem restaurar contagem de linhas como estratégia de numeração. Reaplicar a migração não diminui os contadores.
- Validação: 129 testes aprovados, incluindo 13 testes com PostgreSQL 16 local descartável; a integração PostgreSQL de IA ficou ignorada, pois não foi alterada. Foram cobertos o controlador manual real com 30 criações simultâneas, exclusões, organizações/séries independentes, versão antiga junto com nova, histórico de exclusões, seis dígitos, rollback, ocorrência recorrente concorrente e ausência do trigger. Build aprovado, sem geração automática de migrações. Nenhuma emissão, pagamento ou exclusão de dados de produção foi usada nos testes.
- Para repetir: apontar `INVOICE_TEST_DATABASE_URL` exclusivamente para PostgreSQL local com banco dedicado `flowlio_invoice_test` e executar `npm test` no backend. O teste cria e remove suas tabelas nesse banco descartável.
- Publicação: commit BE `bfe902d`, integrado por fast-forward e enviado para `origin/main`. Em 16/09/2026, a consulta do status confirmou `success` / `Success - api.flowlioapp.com`, registrado pelo Railway em 15/09/2026 às 16:58:13 UTC. [Deploy confirmado no Railway](https://railway.com/project/3595bd46-8b28-44e2-9c21-37cc7c5d89c2/service/3daf0a4e-4463-4d68-8c56-3ab91d5aab34?id=513f2830-a239-44ea-92d3-4c34d02fa07f&environmentId=40908654-b4e2-42f7-b8b6-99c23bf7a4d1). Essa versão também contém a T05 e a correção de credenciais da T04. O frontend desta etapa altera apenas este plano; não há mudança de interface.

### Onde conferir a T06 na aplicação

1. `/dashboard/invoice`: criar uma fatura manual e conferir o número `S1-...` retornado na listagem.
2. Na mesma área, conferir as faturas originadas de recorrências: recebem a série `REC-...`. A ocorrência seguinte deve avançar apenas uma vez.
3. Em uma organização de teste, criar duas faturas, excluir a mais recente e criar outra: o número excluído não deve ser reutilizado. Os testes automatizados já cobrem esse cenário sem operações em produção.

## T08 — Cronômetro

- Branch `fix/t08-time-tracking` nos dois repositórios. Um cronômetro ativo por usuário; início e parada transacionais, com atividade gravada junto da operação. Quatro controladores duplicados passam a usar o mesmo serviço.
- Início recebe chave de repetição; parada exige o ID do registro. Reenvios retornam a sessão original, inclusive já encerrada, sem modificar uma sessão mais recente. As abas notificam mudanças entre si e atualizam as consultas.
- Migração aditiva `0036_time_tracking_guard.sql` bloqueia novas sobreposições, inclusive de escritores antigos. Duplicatas históricas não são apagadas nem encerradas automaticamente: podem ser paradas individualmente. Preservar o trigger em eventual reversão; não remover registros históricos. Abas antigas precisam atualizar a aplicação para enviar o ID na parada. Publicar backend antes do frontend.
- Validação: builds FE/BE e lint aprovados, 110 testes FE e 119 testes BE existentes aprovados. Após autorização do usuário, os dez testes específicos da T08 passaram em PostgreSQL 16 local: inícios/paradas concorrentes, reenvios atrasados, isolamento, rollback, proteção de escritores antigos e preservação das duplicatas históricas. As três integrações PostgreSQL de outras etapas não foram repetidas. Contêiner descartável removido ao final.
- Publicação confirmada em 17/09/2026: BE `4cf8ad0`, Railway com sucesso às 16:22:09 UTC; FE `bc9c68c`, Cloudflare Pages com sucesso às 16:26:02 UTC. Ambas as branches foram enviadas e integradas por fast-forward em `main`. [Deploy Railway](https://railway.com/project/3595bd46-8b28-44e2-9c21-37cc7c5d89c2/service/3daf0a4e-4463-4d68-8c56-3ab91d5aab34?id=33a41b7a-fff0-4703-ad32-45866ef3e701&environmentId=40908654-b4e2-42f7-b8b6-99c23bf7a4d1) · [Deploy Cloudflare](https://dash.cloudflare.com/?to=/3a6e0eb38c63bf937ab269786e305640/pages/view/flowlio-frontend/a7e37ad4-905a-423b-bb3a-304d1dd48a46). O registro posterior de encerramento altera somente esta documentação, sem mudança no código publicado.
- Onde conferir após publicação: `/dashboard/time-tracking`, modal de cronômetro e botões de início/parada em Minhas tarefas. Abrir duas abas, iniciar uma tarefa, conferir sincronização e tentar iniciar outra; parar deve encerrar somente o registro selecionado.

## T09 — Migrações e release

- Branch `chore/t09-release-migrations`. Backend `d8017be`, integrado em `main` e enviado ao GitHub. O frontend desta etapa altera apenas este plano.
- Migrações consolidadas em `drizzle/releases`, com baseline das 61 tabelas e preservação das proteções de faturas e cronômetros. O histórico antigo permanece para consulta; os patches paralelos foram retirados da inicialização.
- Geração, compilação e aplicação têm comandos separados. O servidor aguarda a mesma aplicação transacional usada por `npm run dbmigrate` antes de abrir HTTP e iniciar jobs. Falhas desfazem a transação e impedem a inicialização da nova versão. Histórico com hashes detecta alterações indevidas em arquivos já aplicados; trava compartilhada coordena instâncias concorrentes.
- Validação: build aprovado, 129 testes aprovados e quatro integrações de outras etapas não repetidas. Os oito testes PostgreSQL da T09 cobrem banco vazio, atualização de schema legado com dados, preservação de restrições do portal e contadores, concorrência, rollback, histórico adulterado, trigger desabilitado e código de saída do comando. O gerador real confirmou ausência de diferenças entre snapshot e schema. PostgreSQL descartável removido; nenhum dado de produção foi usado nos testes.
- Operação e recuperação documentadas em `Flowlio-Backend/docs/release-migrations.md`. A adoção preserva dados e definições existentes; incompatibilidades exigem correção explícita, sem apagar registros para forçar a atualização.
- Publicação: Railway confirmou sucesso de `d8017be` em 19/09/2026 às 17:45:20 UTC. [Deploy T09](https://railway.com/project/3595bd46-8b28-44e2-9c21-37cc7c5d89c2/service/3daf0a4e-4463-4d68-8c56-3ab91d5aab34?id=90ec7408-6af4-41a2-96dc-7e9785870f34&environmentId=40908654-b4e2-42f7-b8b6-99c23bf7a4d1). O registro de encerramento no frontend não altera o código da aplicação.
- Onde conferir: esta etapa melhora a inicialização e os próximos deploys, sem mudança visual. As áreas `/dashboard/invoice` e `/dashboard/time-tracking` continuam usando as proteções de banco das T06–T08. A evidência específica da T09 está no resultado do deploy e no histórico `flowlio_releases.migrations`.

## T10 — Jobs persistentes

- Branch `feat/t10-durable-jobs`; backend `50a0406`, integrado em `main` e enviado ao GitHub. Frontend somente para atualizar este plano.
- Agendamento e fila persistidos no PostgreSQL. Worker em processo separado de HTTP; `npm start` supervisiona os dois, preservando o comando de publicação existente. Também existem `start:http` e `start:worker` para serviços independentes. Migrações da T09 continuam obrigatórias antes de iniciar.
- Horários UTC e cursores sobrevivem a reinícios. Bloqueio por tipo de job coordena instâncias; jobs de banco gravam efeitos e conclusão juntos, com até cinco tentativas e espera progressiva. As automações são distribuídas por organização. Resumos semanais com mais de sete dias não são regenerados como se fossem atuais.
- Recorrência preserva a transação da fatura e seu contador; lembretes persistem notificação e marcador juntos; retry de webhook persiste lead e sucesso juntos. Retry manual não atravessa organizações nem reabre um log concluído. Pausa e intervalo da sincronização do calendário também são persistentes; sincronização manual retorna solicitação enfileirada.
- E-mails e pushes de automações são enfileirados na mesma transação das notificações e enviados depois. Contadores de e-mails enviados aumentam após confirmação de entrega. Operações externas interrompidas ou com resultado incerto ficam em `uncertain`, exigindo conciliação antes de reenviar. Isso também evita repetir automaticamente consumo de IA em resumos semanais. Conciliação de assinaturas continua na T11.
- Validação: build aprovado; suíte geral com 135 testes aprovados. Após o último ajuste na seleção de jobs, passaram os 15 testes PostgreSQL do worker, oito de migrações e dois de histórico/snapshot. Incluem encerramento real do processo durante fatura, lembrete e webhook, recuperação sem duplicação, duas instâncias, backoff, pausa persistente e isolamento entre organizações. Provedores externos simulados; nenhum pagamento, e-mail ou dado de produção foi usado nos testes. Os dois contêineres descartáveis foram removidos.
- Operação e recuperação documentadas em `Flowlio-Backend/docs/durable-jobs.md`. Não há nova tela de administração da fila nesta etapa.
- Publicação: Railway confirmou sucesso de `50a0406` em 20/09/2026 às 05:31:30 UTC. [Deploy T10](https://railway.com/project/3595bd46-8b28-44e2-9c21-37cc7c5d89c2/service/3daf0a4e-4463-4d68-8c56-3ab91d5aab34?id=b9987fb2-ad43-4d36-a1f9-dbb262e48af9&environmentId=40908654-b4e2-42f7-b8b6-99c23bf7a4d1). O registro de encerramento no frontend não altera o código da aplicação.
- Onde conferir: faturas recorrentes em `/dashboard/invoice`; lembretes em `/dashboard/inbox`; resultados dos retries em `/dashboard/leads/webhooks`, abrindo o webhook e seu histórico. Configuração das automações em `/dashboard/settings/automations`. A melhoria é de funcionamento e recuperação, sem redesenho dessas telas.

## Ajuste solicitado antes da T11 — Showcase

- Branch `redesign/showcase-page`, somente frontend. Página reorganizada em apresentação do produto, vídeo em destaque com navegação por capítulos, biblioteca filtrável e exemplos por tipo de equipe.
- Identidade visual com azul `#1797ba`, títulos em Outfit e tipografia de apoio já utilizada no Flowlio. Retirados efeitos flutuantes, gradientes decorativos, métricas fictícias e interfaces simuladas. Vídeos ainda sem gravação são identificados, sem abrir players inválidos; dados estruturados incluem apenas vídeos disponíveis.
- Modal com navegação por teclado, fechamento por Escape e retorno do foco. Capas em alta resolução com fallback; layout conferido em desktop, 320/390/768 px, RTL e preferência por movimento reduzido. APIs externas e iframe de reprodução foram simulados na revisão de navegador; carregamento real das capas mantido.
- Validação: 110 testes existentes aprovados; build de produção aprovado, com os avisos preexistentes de Gantt e tamanho do PDF. TypeScript e lint dos arquivos alterados conferidos após o ajuste final das capas. Sem alterações no backend.
- Onde conferir: `/showcase`, pelo link Showcase no menu público. T11 permanece pendente.
