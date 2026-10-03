# Flowlio — revisão de simplicidade dos fluxos

Data: 03/10/2026. Este documento registra o diagnóstico inicial e a proposta completa. Parte dos fluxos já foi implementada; veja o estado real, os testes e os limites em [Simplificação implementada](./simplificacao-implementada.md). As tabelas de evidência abaixo descrevem o estado anterior à implementação.

## Conclusão

O produto oferece capacidades úteis, mas exige que a organização conecte manualmente partes do trabalho. Registrar tempo, alocar consumo, fechar mês, localizar a aprovação e reconstruir uma cobrança são operações separadas. Um layout melhor ou uma explicação maior não elimina esse trabalho.

A direção proposta é organizar a experiência por resultados: iniciar trabalho, executar, pedir algo ao cliente, entregar e receber. O usuário informa uma decisão uma vez; o sistema preserva seus vínculos e executa as consequências previsíveis. Exceções continuam visíveis e solucionáveis.

## Alcance e evidência

Revisão do inventário T01–T33, guia funcional, documentação das entregas e caminhos relevantes de frontend/backend: contratos, escopo, pendências, entregas, automações, navegação, IA, onboarding e financeiro. Não é teste autenticado de produção, auditoria linha a linha de todo o produto nem estudo de adoção. Os relatos do usuário são evidência de dificuldade; não temos métricas de abandono ou tempo de execução.

O código atual prevalece sobre os documentos antigos. Por exemplo, a justificativa antiga para não integrar rascunhos financeiros dizia que faturas não tinham moeda. O código atual já trabalha com `currencyCode`; a integração continua faltando nos caminhos examinados.

| Evidência atual | Local principal | Consequência para quem usa |
| --- | --- | --- |
| Consumo exige comando explícito `allocate`; próximo mês exige anterior fechado; renovação ocorre no fechamento | BE `src/modules/retainers/service.ts`; FE `src/pages/retainers.page.tsx` | A organização repete seleção de horas e precisa operar a passagem dos meses |
| Rascunho comercial de escopo fica em `workflow_billing_drafts`; o mensal fica no demonstrativo | BE `src/modules/workflows/service.ts`, `src/modules/scope/service.ts`, `src/modules/retainers/service.ts` | A aprovação não chega a uma fila comum de faturas para emitir |
| Fila do cliente inclui entrega, escopo e solicitações; não inclui excedentes de contratos | BE `src/modules/client-pending/service.ts`, enum e consulta de tipos | Cliente precisa descobrir outra página para tomar uma decisão |
| Resposta de pergunta/arquivo/briefing sempre vira `answered`, exigindo conclusão pela equipe | BE `src/modules/client-pending/service.ts` | Até uma resposta simples demanda uma segunda intervenção |
| Aprovar entrega atualiza a revisão; não conclui o marco | BE `src/modules/delivery/service.ts` | Estado comercial e execução podem parecer contraditórios |
| Cadastro direto exige nome, e-mail e senha; cria identidade junto do cliente | BE `src/controllers/organization/client management/createclient.controller.ts` | Cadastrar relacionamento também exige preparar acesso ao portal |
| Pagamento manual de fatura grava receita com cliente/fatura, sem `projectId`; rentabilidade filtra receita por projeto | BE `src/controllers/organization/invoices/updateinvoicestatus.controller.ts`, `src/modules/profitability/service.ts` | Uma receita registrada por esse caminho pode não alimentar o resultado do projeto |
| Workflows e automações prontas têm entradas e interfaces distintas | FE `src/utils/role-based-navigation.ts`, `src/pages/workflows.page.tsx`, `src/hooks/useAutomations.ts` | Usuário precisa entender qual mecanismo resolve o seu objetivo |
| Cenários exigem base, alterações, seleção e aplicação; atualizar a base descarta propostas | FE `src/pages/capacity-scenarios.page.tsx`; `docs/t32-capacity-scenarios.md` | Poderoso para simulação; excessivo como caminho normal de distribuir trabalho |
| IA possui entrada única, mas ferramentas e execuções têm experiências/históricos diferentes | FE `src/components/ai assist/GlobalAgent.tsx`; `docs/t33-internal-ai-agent.md` | Unificação visual ainda não equivale a uma experiência única de executar trabalho |
| Moeda já está no onboarding | FE `src/components/onboarding/OnboardingCurrencySetup.tsx` | Preservar a melhoria e reutilizar o padrão nas criações seguintes |

## Decisão por área

| Área | Direção proposta | Experiência esperada |
| --- | --- | --- |
| Leads e clientes — T02 | Simplificar cadastro e transição comercial | Reutilizar contato/dados na conversão; cadastrar cliente sem exigir convite imediato. Convidar para portal em ação própria, com definição de senha pelo cliente |
| Proposta → projeto — T18 | Preservar e tornar o caminho principal de trabalho aprovado | Uma revisão com cliente, moeda, modelo de cobrança e estrutura; criar projeto mantendo os vínculos, sem redigitação |
| Projetos, tarefas e modelos — T25/base | Manter como centro operacional | Próxima ação contextual; modelo opcional; visibilidade explicada como “Equipe” e “Cliente e equipe”, sem tornar conteúdo privado público automaticamente |
| Horas e contratos — T08/T29 | Automatizar ligação de consumo | Escolher o destino comercial no projeto ou registro; tempo concluído elegível entra no contrato correspondente sem visita a outra tela |
| Financeiro — T06/T07/T10/T19 | Completar a integração | Horas avulsas, mensalidades e extras aprovados chegam à mesma lista de cobranças a preparar; fonte e moeda preservadas |
| Entregas — T20 | Um comando de envio no contexto do trabalho | “Enviar entrega para aprovação”, escolhendo ou criando a entrega no mesmo fluxo; opções de conclusão configuradas no modelo |
| Pendências — T31 | Uma fila de ações do cliente | Responder, enviar arquivo, revisar entrega e decidir excedente no mesmo lugar; projeto mostra estado sem exigir navegação paralela |
| Escopo — T28 | Simplificar apresentação e aplicação | “Pedido adicional”: pedido → avaliação → decisão → execução. Configurar consequências na avaliação, sem nova preparação após o aceite |
| Central de atenção — T27 | Integrar ao dashboard e manter a visão completa | Mostrar o que fazer hoje; ação direta para resolver ou abrir o formulário certo, sem criar outra obrigação de triagem |
| Capacidade — T21 | Manter visão semanal simples | Carga e disponibilidade com atribuição/reagendamento direto quando permitido |
| Cenários — T32 | Tornar recurso avançado opcional | “Simular mudança” dentro de Capacidade; não exigir cenário para editar uma tarefa normal |
| Automações — T22/T30 e rotinas existentes | Unificar o acesso, preservar motores | Biblioteca de receitas com linguagem de resultado; editor completo em “Personalizar” |
| IA — T33 | Contextualizar e executar ações úteis | Atalhos de intenção no registro, prévia curta e um resultado verificável; evitar obrigar usuário a escolher área/projeto já conhecidos |
| Auditoria — T26 | Manter automática e contextual | Histórico no registro; busca/exportação geral em configurações avançadas |
| Histórico operacional — T15 | Retirar do trabalho diário | Suporte/administradores; erro comum oferece causa e ação, sem pedir leitura de logs |
| Onboarding — T23 | Reduzir configuração inicial | Moeda, fuso e primeiro trabalho; equipe, integrações, modelos e automações podem ser configurados quando necessários |
| Infraestrutura — T01/T03–T05/T09/T12–T17 | Preservar | Permissões, isolamento, controle de tokens, jobs, migrações, acessibilidade e validações trabalham em segundo plano |
| Assinatura Flowlio — T11 | Manter separada | Moeda do plano continua independente da moeda comercial da organização; pendência de Sandbox não se resolve com redesign |
| Arquivos, calendário, mensagens, suporte e campos personalizados | Manter contextual e opcional | Arquivo reutilizado no projeto/entrega/pedido; opções avançadas não devem bloquear o primeiro trabalho. Não houve revisão exaustiva desses módulos nesta análise |

## Fluxos desejados

### 1. Começar um trabalho

Cliente existente ou novo → proposta/projeto → confirmar condições → trabalhar.

- Cliente, moeda e informações já registradas vêm preenchidos.
- Na configuração comercial, escolher preço fixo, horas avulsas ou contrato mensal. Essa escolha organiza as próximas telas; não transforma automaticamente o orçamento em receita.
- Na conversão, sugerir o modelo a partir das condições estruturadas disponíveis. Texto livre pode ser interpretado pela IA como sugestão, nunca como fato comercial confirmado.
- Convite ao portal é independente do cadastro. Não exigir compartilhamento de senha pela equipe.
- Um projeto pode existir sem portal ou proposta. O fluxo guiado não deve virar uma obrigação adicional.

### 2. Trabalhar em contrato mensal

Configurar contrato uma vez → vincular projeto → registrar tempo → cliente acompanha consumo → organização revisa exceções e faturamento.

- Autoalocação somente para projetos/tempos explicitamente configurados para consumir aquele contrato. Não assumir que todo trabalho de um cliente pertence ao único contrato ativo.
- Com múltiplos contratos, escolher o vínculo uma vez no projeto; exceções podem mudar o destino de um registro ainda elegível.
- Enquanto o período está aberto, alterações permitidas de tempo precisam atualizar o consumo de forma transacional. Sem alocação duplicada nem disputa com faturamento avulso.
- Automação usa regra determinística, sem IA ou tokens para somar e classificar vínculos conhecidos.
- Criar o mês corrente sem exigir uma operação manual para liberar o trabalho. Se o anterior estiver em revisão, saldo transferido fica pendente/provisório, identificado e reconciliado no fechamento.
- Preparar fechamento após fim do mês e prazo de tolerância configurado. Timers ativos, registros em conflito e dados faltantes viram exceções com ação direta.
- Fechamento automático apenas para contratos com política explicitamente configurada; cobrança externa continua sujeita à configuração comercial correspondente.
- “Period entries” vira “Horas registradas”. O cliente vê consumo, saldo, detalhamento e eventual ação pendente. Estado vazio explica a situação; ações de lançamento pertencem à equipe.

### 3. Pedir algo ao cliente e entregar

Projeto → “Pedir ao cliente” → escolher pergunta, arquivo, briefing ou aprovação → cliente responde no portal.

- Um ponto de entrada pode reutilizar os serviços existentes sem transformar todos os tipos no mesmo modelo de dados.
- Cliente/destinatário e responsável sugeridos pelo projeto; fuso vem da organização; dependências e lembretes detalhados em opções avançadas.
- Pergunta simples pode terminar como respondida. Verificação da equipe é uma opção explícita para documentos e briefings que dependem de análise humana; não confundir resposta recebida com qualidade validada.
- Aprovação de entrega pode concluir o marco quando essa consequência estiver definida antes do envio. Pedidos de ajuste retornam ao responsável. Aprovar um marco não conclui automaticamente todas as tarefas/projeto.
- Aceites financeiros e de entrega permanecem vinculados à versão e ao cliente correto.
- Excedentes mensais entram na fila de pendências. O cliente não precisa localizar o mês anterior para descobrir uma aprovação.

### 4. Pedido adicional e cobrança

Pedido → equipe confirma se está incluído ou apresenta preço/prazo → cliente decide quando necessário → trabalho e cobrança preparada aparecem nos locais corretos.

- Trabalho incluído não precisa de aprovação de preço zero. Mudança material de prazo ou condições ainda pode exigir decisão.
- Ao enviar a estimativa, configurar se o aceite deve criar tarefa, aplicar o prazo aprovado e preparar cobrança. Revalidar conflitos quando executar.
- Extra aprovado aparece em Faturas como rascunho acionável, com referência ao pedido. Não apresentar somente um identificador técnico de rascunho comercial.
- Faturas de várias origens devem preservar linhas/vínculos; uma origem já faturada não pode ser reutilizada. Recorrência e contrato não podem cobrar a mesma mensalidade duas vezes.
- Pagamento alimenta receita e projeto quando a origem permite atribuição. Se uma fatura abrange vários projetos, distribuir pelas linhas/origens ou exigir rateio, sem imputar todo o valor a cada projeto.
- Dados legados sem vínculo ficam em uma fila de correção assistida; não criar uma segunda receita para corrigir a falta de projeto.

## O que retirar do caminho principal

- Selecionar pela segunda vez horas cujo contrato já foi definido.
- Reconstruir manualmente uma cobrança com dados de um aceite registrado.
- Confirmar operações internas simples com checkbox + modal + botão sem consequência adicional.
- Exibir IDs, revisões e termos como “aplicar versão” como parte obrigatória do trabalho. Mantê-los disponíveis nos detalhes técnicos/histórico.
- Exigir a escolha de contexto da IA quando o registro já está aberto.
- Mostrar cenários, auditoria e logs como etapas normais para iniciar um projeto.
- Manter duas portas de entrada para configurar automações com objetivos semelhantes.
- Mostrar consumo mensal como destino vazio destacado para cliente sem contrato. Ocultar somente após confirmar ausência de contratos, preservando históricos e links de usuários com dados.

Nenhuma proposta implica apagar contratos, históricos, permissões ou recursos usados. Remover definitivamente uma funcionalidade exige verificar se resolve um caso distinto, se há registros em uso e se o caminho substituto cobre esse caso. Falta de dados de adoção não prova falta de valor.

## Papel da IA

Manter uma entrada e adicionar sugestões no contexto: preparar projeto de uma proposta, transformar briefing em tarefas, resumir respostas, preparar entrega e apontar pendências. Mostrar o que será criado/alterado e links do resultado.

Somas, herança de moeda, vínculo de contrato, passagem de período e prevenção de duplicidade são responsabilidades do sistema. Não devem depender do modelo nem consumir tokens.

Autonomia deve economizar revisão de trabalho interno previsível, respeitando permissões e regras configuradas. Ampliações além das ações atuais precisam de implementação própria, recibos e tratamento de conflito. Cliente continua sem agente e sem geração de tokens; recebe somente os materiais publicados pela equipe.

## Plano de execução priorizado

Os itens abaixo são propostas de implementação, não entregas concluídas. Cada etapa termina em um fluxo utilizável; não publicar botões que dependam de integração futura.

| Etapa | Entrega concreta | Dependências e aceite |
| --- | --- | --- |
| S01 — Consumo conectado | Vínculo projeto/tempo→contrato, autoalocação, extrato compreensível e motivos de exclusão | FE+BE; registrar tempo uma vez reflete no portal. Testar múltiplos contratos, edição/remoção, moeda, escopo de acesso e concorrência com faturamento |
| S02 — Cobrança conectada | Fila real de rascunhos em Faturas para extras/mensalidades/horas; vínculo de receita ao projeto | FE+BE; aprovação permite revisar/emitir sem copiar valores. Testar duplicidade, recorrência, cancelamento, múltiplos projetos e moeda |
| S03 — Ciclo mensal | Abertura do mês independente da revisão anterior, fechamento preparado e exceções | Depende de S01/S02; mudança de estados e migração necessárias. Testar virada de mês/fuso, pausa, cancelamento, timers, saldo pendente e correções |
| S04 — Colaboração simples | Entrada “Pedir ao cliente”, fila incluindo excedentes, conferência opcional por tipo e entrega com consequência explícita | FE+BE; cada pendência tem dono, ação e resultado claro. Testar cliente trocado, versão antiga, reabertura e conteúdo privado |
| S05 — Começar sem burocracia | Cadastro sem senha imposta pela equipe, convite separado, conversão guiada e configuração comercial reutilizável | FE+BE/auth; preservar identidades existentes e isolamento entre organizações. Fluxo sem portal continua válido |
| S06 — Organizar o produto | Dashboard com próximas ações, automações prontas e personalizadas juntas, cenários/logs em áreas avançadas | Preservar rotas e regras existentes; distinguir alerta de ação executada; um evento não dispara lembretes duplicados |
| S07 — IA no trabalho | Intenções contextuais, menos seleção repetida, prévias e recibos consistentes | Reutilizar fluxos S01–S06; não usar IA para remendar integração faltante; respeitar limites e bloqueio de clientes |

Melhorias pequenas de texto, estado vazio e navegação podem acompanhar cada etapa; não substituem as mudanças de serviço necessárias. Preservar alterações locais de outras tarefas e contratos existentes durante a implementação.

## Como saber se ficou mais simples

Medir o caminho atual antes de cada etapa e comparar com o novo, com organização nova e existente. Registrar ações deliberadas, telas visitadas, campos redigitados, erros, pedidos de ajuda e tempo até o resultado. Não há percentual de economia medido nesta análise.

Critérios de produto propostos:

1. Horas de projeto configurado entram no contrato sem seleção repetida.
2. Extra aprovado chega à preparação da fatura sem copiar cliente, valor ou moeda.
3. Toda decisão pendente do cliente aparece em uma fila com ação direta.
4. O mês novo não exige que alguém lembre de abrir um período.
5. Cadastro de cliente não exige administrar a senha dele.
6. Uma tela vazia explica o estado e oferece a próxima ação permitida; cliente não recebe instrução de realizar operação exclusiva da equipe.
7. Erro explica a correção concreta; conflito mantém o trabalho preenchido sempre que possível.
8. Uma pessoa consegue executar os cenários principais sem ler a documentação técnica. Validar em teste de uso observado, não presumir apenas porque o código passou nos testes.
9. EN/PT/ES/HE, RTL, mobile e teclado continuam utilizáveis; moeda não depende do idioma.
10. Simplificação mantém isolamento, visibilidade, histórico de aceites e prevenção de cobrança duplicada.

## Limites desta entrega

Foi criado somente este diagnóstico. Não foram modificados fluxos, dados, permissões, produção ou regras de cobrança; não houve teste de runtime nesta revisão. As propostas precisam de implementação e validação. O inventário histórico permanece preservado; este documento muda a prioridade de evolução para concluir integrações e reduzir trabalho manual.
