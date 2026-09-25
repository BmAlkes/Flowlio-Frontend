# Plano de evolução do Flowlio

Data: 21/09/2026. Complementa o [plano T01–T24](plano-de-trabalho.md), sem substituir seu histórico.

## Objetivo e escopo autorizado

Conectar melhor vendas, execução, colaboração com o cliente e rentabilidade. Este documento planeja as oito funcionalidades propostas e o refinamento imediato de `/dashboard/project/view/:id`.

Em 23/09/2026, o usuário autorizou continuar todos os processos faltantes, executando e validando as etapas pela sequência de dependências. T25, T26A/B, T27A/B, T28A/B e os refinamentos de clientes/leads estão publicados. A próxima entrega é T29A/B; as etapas seguintes permanecem no escopo autorizado. A T11 continua separada, dependente de validação PayPal Sandbox.

## Base existente

Reaproveitar propostas convertidas em projetos, templates, campos personalizados, faturamento de horas, faturas recorrentes, rentabilidade, aprovação de entregas, capacidade semanal, jobs persistentes, portal e notificações. Confirmar contratos atuais do backend antes de iniciar cada etapa.

- T22: regras por eventos com notificações internas; ampliar esse mecanismo para ações entre módulos.
- T15: histórico de falhas técnicas; auditoria de alterações de negócio será uma capacidade adicional.
- Fatura recorrente: geração de cobrança periódica; banco de horas exige contrato, períodos, consumo e regras próprios.
- Capacidade: visão semanal existente; simulação precisa preservar o planejamento oficial até a confirmação.
- Aprovação de entrega: decisão sobre versão/marco; mudança de escopo exige aprovação do impacto comercial e do prazo.

## Sequência proposta

As etapas de infraestrutura de auditoria vêm cedo para que os novos fluxos já tenham rastreabilidade. A interface completa da auditoria pode ser entregue depois da primeira versão da central.

| Ordem | Entrega | Repositórios | Dependências | Porte relativo | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 | T25 — Refinamento da página do projeto | FE | Componentes e permissões atuais | Médio | Publicada — `d5b7e84` |
| 2 | T26A — Fundação de auditoria de negócio | BE | T03, T09, T12 | Médio | Publicada — `2fc444e` |
| 3 | T27A/B — Central de atenção e gestão de pendências | FE + BE | T19, T20, T21, T26A | Grande | Publicada — FE `b937560`, BE `11f23db` |
| 4 | T26B — Consulta e exportação da auditoria | FE + BE | T26A | Médio | Publicada — FE `b2bf2df`, BE `ae94506` |
| 5 | T28A/B — Solicitações extras e mudanças de escopo | FE + BE | T18, T20, T26A | Grande | Publicada: FE `7c360d9`, BE `2c9db7f` |
| 6 | T29A/B — Contratos mensais e banco de horas | FE + BE | T07, T08, T10, T26A | Grande | Implementada; validação final e publicação pendentes |
| 7 | T30A/B — Ações entre módulos nas automações | FE + BE | T10, T22, T26A; T28/T29 para eventos desses módulos | Grande | Planejada |
| 8 | T31A/B — Fila de pendências do cliente | FE + BE | T20, T28; T30 para lembretes configuráveis | Grande | Planejada |
| 9 | T32A/B — Planejamento com simulação de capacidade | FE + BE | T21, T26A | Grande | Planejada |
| 10 | T33A/B — IA contextual e revisável | FE + BE | T05, T19, T26A; T28 para comparação de escopo | Grande | Planejada |
| Separada | T11 — Conciliação de assinaturas PayPal | FE + BE | Backend de teste, app e contas Sandbox | A reavaliar | Pendente de ambiente e validação |

Porte expressa complexidade relativa, não prazo. A sequência considera valor de produto e dependências. A autorização de 23/09/2026 abrange as etapas restantes; preservar branches, validação e publicação por entrega.

## T25 — Página de projeto mais profissional

**Resultado:** facilitar a leitura de situação, responsáveis, entregas e ações preservando a paleta e as fontes existentes.

- Cabeçalho com número, nome, status, cliente, visibilidade e ações principais.
- Progresso publicado em faixa própria; campos de edição agrupados em acompanhamento.
- Informações e entregas na coluna principal; cliente, ferramentas e PDF na lateral.
- Aprovações antes da prévia longa do contrato; toolbar de documentos que se adapta à largura.
- Azul Flowlio `#1797ba`, azul, verde, roxo e laranja existentes em acentos e superfícies suaves. Bordas, textos e fundos seguem o tema.
- Menos caixas aninhadas, sombras menores e títulos alinhados. Nenhuma métrica fictícia.

**Aceite:** edição, comentários, download, versão de arquivo, modelo, aprovação e acesso à rentabilidade continuam disponíveis conforme permissões; leitura sem overflow a 320/390 px; desktop e RTL/escuro revisados; foco por teclado; lint, testes relevantes e build aprovados. Não alterar cálculos, APIs ou migrações nesta entrega.

**Onde conferir:** Dashboard → Projetos → abrir um projeto. Branch sugerida: `redesign/project-detail-refinement`.

## T26 — Auditoria das ações de negócio

**T26A — Registro:** persistir organização, ator humano/sistema, ação, recurso, horário UTC, referência da operação e diferenças relevantes. Começar por orçamento, prazo, status, permissões, decisões de entrega e novos fluxos T28/T29. Registrar a alteração e o evento de auditoria na mesma transação quando aplicável. Definir explicitamente retenção e campos excluídos.

**T26B — Consulta:** filtros por pessoa, ação, recurso e período; acesso pelo projeto e pelas configurações; comparação antes/depois e exportação autorizada. Histórico paginado. Impedir edição/exclusão pela API comum.

**Aceite:** mudanças reais produzem um evento; operações revertidas não aparecem como concluídas; retries não duplicam eventos; custos e dados restritos permanecem protegidos; testes entre organizações e papéis. Nunca registrar senhas, tokens ou conteúdo privado completo sem necessidade. Não prometer trilha retroativa de ações anteriores à implantação.

**Onde conferir:** Configurações → Auditoria; projeto → histórico. Indicador: cobertura dos eventos definidos no catálogo da etapa. Branches: `feat/t26a-business-audit`, `feat/t26b-audit-view`.

## T27 — Central de atenção do gestor

**T27A — Primeira versão:** consultar pendências de aprovação, horas não faturadas, sobrecarga conhecida, propostas sem avanço e consumo de orçamento. Cada item deve explicar a regra, mostrar o registro de origem e permitir navegar à ação. Limiares configuráveis por organização; falta de estimativa/custo não vira zero nem alerta falso.

**T27B — Gestão da fila:** responsável pela resolução, adiamento com prazo, filtros, agrupamento e preferências. Reavaliar o estado quando a origem mudar. Evitar criar tarefas ou enviar mensagens automaticamente nesta etapa.

**Aceite:** cálculos e recortes de datas/moedas consistentes com as telas de origem; apenas dados autorizados; sem duplicações por atualização; vazio, erro e dados incompletos explícitos; consultas paginadas/agregadas, sem carregar toda a organização no navegador. Alertas de orçamento medem valores conhecidos, sem apresentar previsão como fato.

**Onde conferir:** Dashboard → Atenção. Medir abertura do registro de origem, resolução e tempo de pendência. Branches: `feat/t27a-attention-center`, `feat/t27b-attention-triage`.

## T28 — Solicitações extras e mudanças de escopo

**T28A — Solicitação e avaliação:** cliente ou equipe registra pedido vinculado ao projeto, descrição e anexos. A equipe classifica como incluído no escopo ou adicional, estima horas, preço, moeda e alteração de prazo. Guardar referência à proposta/escopo original.

**T28B — Aprovação e aplicação:** apresentar uma versão da estimativa ao cliente; registrar aceite, recusa ou revisão. Depois da aprovação, oferecer aplicação controlada ao projeto e rascunho de cobrança adicional. Preservar orçamento original e os aditivos separadamente.

**Fluxo:** solicitado → em análise → aguardando aprovação → aprovado/recusado → aplicado. Cancelamento explícito; revisão comercial gera nova versão.

**Aceite:** não aprovar versão antiga; não executar/aplicar duas vezes; somente o cliente e os responsáveis autorizados decidem; alteração aprovada registra valor, moeda e impacto de prazo; nenhuma cobrança real automática. Cobrir concorrência entre revisão e aprovação, cancelamento, isolamento entre clientes e vínculo com as tarefas criadas.

**Onde conferir:** projeto e portal → Solicitações/Alterações de escopo. Medir horas extras aprovadas, valor de aditivos e tempo de decisão. Branches: `feat/t28a-change-requests`, `feat/t28b-change-approval`.

## T29 — Contratos mensais e banco de horas

**T29A — Contrato e consumo:** definir cliente, moeda, valor mensal, horas incluídas, vigência, fuso e regra de renovação. Associar registros de tempo ao contrato/período; mostrar consumo, saldo, excedente e origem de cada lançamento. Escolher comportamento explícito para saldo não utilizado e excedentes, sem defaults comerciais silenciosos.

**T29B — Fechamento e faturamento:** encerrar períodos, transferir saldo conforme limite/validade configurados e preparar cobrança de excedentes. Integrar com faturas recorrentes existentes sem gerar a mensalidade duas vezes. Correções de períodos fechados usam ajustes rastreáveis. Alertas de consumo inicialmente internos; envio por regra na T30.

**Aceite:** hora não pode consumir dois contratos nem ser faturada duas vezes; testes de fronteira de mês/fuso, alteração do timer, pausa/cancelamento, mudança de contrato, concorrência e retry; separar horas incluídas de horas vendidas avulsas. Cliente visualiza apenas seus contratos, sem custos internos. Totalizadores conciliam com os lançamentos.

**Onde conferir:** cliente → Contratos e horas; portal → Consumo mensal. Medir consumo, excedente aprovado e tempo gasto no fechamento. Branches: `feat/t29a-retainer-hours`, `feat/t29b-retainer-close`.

T29 trata os contratos entre a organização e seus clientes. T11 trata a assinatura do próprio Flowlio no PayPal: não é pré-requisito para um banco de horas sem cobrança externa automática.

## T30 — Automações com ações entre módulos

**T30A — Catálogo limitado:** adicionar ações de criar tarefa, atribuir responsável e preparar rascunho de fatura. Gatilhos: entrega aprovada/ajuste solicitado, marco concluído e eventos disponíveis de consumo/escopo. Condições usam dados estruturados. Configurar destinatário/responsável explicitamente.

**T30B — Execução e operação:** reutilizar jobs persistentes, simulação, histórico, deduplicação, limites e pausa. Acrescentar canais externos já suportados após verificar preferências e configuração. Registrar resultado e vínculo com cada recurso criado. Disponibilizar retry somente quando seguro.

**Aceite:** simulação não grava ações; repetição do evento não cria outra tarefa/fatura; evitar ciclos; revalidar permissões na execução; falha de uma integração não anuncia sucesso; resultado externo incerto não é reenviado cegamente. Rascunhos financeiros exigem revisão antes de emissão/envio/cobrança.

**Onde conferir:** Configurações → Workflows. Medir execuções bem-sucedidas, falhas, recursos preparados e intervenções manuais. Branches: `feat/t30a-workflow-actions`, `feat/t30b-workflow-execution`.

## T31 — Fila de pendências do cliente

**T31A — Fila unificada:** reunir aprovações de entrega, solicitações de arquivo, briefings, dúvidas e alterações de escopo. Cada pendência tem tipo, responsável, prazo, projeto, estado e ação. Reutilizar decisões do módulo de origem em vez de duplicar seus estados.

**T31B — Solicitações estruturadas:** formulários de briefing, anexos, respostas, lembretes configuráveis e visão da equipe sobre bloqueios. Cancelar ou reabrir com motivo; indicar dependências que o cliente ainda precisa resolver.

**Aceite:** cliente só vê suas pendências; conclusão ocorre por ação real, não por mero acesso; aprovação respeita a versão de origem; resolução cancela lembretes futuros; datas usam fuso explícito; upload segue limites e autorização existentes. Não disponibilizar custos/notas internas no portal.

**Onde conferir:** portal → Minhas pendências; projeto → Aguardando cliente. Medir tempo de resposta e pendências vencidas. Branches: `feat/t31a-client-pending`, `feat/t31b-client-intake`.

## T32 — Planejamento com simulação de capacidade

**T32A — Cenários:** cadastrar indisponibilidades e períodos de férias; criar cenário a partir da capacidade atual; simular novo projeto, datas e alocação. Mostrar estimativas ausentes, tarefas sem responsável e limitações da projeção.

**T32B — Comparar e aplicar:** comparar cenário com base por semana e pessoa; apresentar mudanças de prazo/carga; salvar rascunho; aplicar mudanças selecionadas após revisão. Detectar se o planejamento oficial mudou desde a criação do cenário.

**Aceite:** simular não modifica tarefas reais; disponibilidade desconhecida permanece desconhecida; ausências e tarefas divididas não são contadas duas vezes; conflito de versão exige revisão; aplicação é atômica ou informa claramente o que foi aplicado. Permissões e auditoria por organização. Sem promessa de prazo garantido quando faltam estimativas.

**Onde conferir:** Capacidade → Cenários. Medir adoção dos cenários e desvio entre carga planejada e realizada. Branches: `feat/t32a-capacity-scenarios`, `feat/t32b-scenario-apply`.

## T33 — IA contextual no projeto

**T33A — Resumos fundamentados:** relatório de andamento com entregas, tarefas, pendências e fontes clicáveis. A busca de contexto respeita permissões antes do envio ao modelo. Definir orçamento de tokens, limites de tamanho, cancelamento e tratamento de indisponibilidade.

**T33B — Rascunhos úteis:** sugerir tarefas de um briefing, comparar escopo aprovado com solicitações e explicar os componentes da margem usando cálculos determinísticos do sistema. Revisão e seleção humana antes de criar tarefas ou compartilhar o relatório.

**Aceite:** nenhuma informação entre organizações/clientes; citações apontam a registros reais autorizados; ausência de dados é explícita; conteúdo de documentos é dado, não instrução para executar ações; consumo respeita T05; retry não duplica cobrança de uso; revisão obrigatória para mutações. Avaliar com exemplos fictícios conhecidos, incluindo contradições, instruções maliciosas em anexos e projetos sem informação suficiente.

**Onde conferir:** projeto → Assistente/Resumo. Medir aceitação/edição dos rascunhos, erros factuais encontrados e custo por geração. Branches: `feat/t33a-project-ai-summary`, `feat/t33b-project-ai-drafts`.

## T11 — Confiabilidade das assinaturas

Retomar em branch nova baseada na versão atual. Revisar e portar a implementação antiga, sem integrar diretamente a migração conflitante `0004`. Confirmar a última migração real antes de numerar a nova.

**Pré-requisitos:** backend isolado de teste, aplicação PayPal Sandbox, contas de vendedor/comprador, URLs e eventos configurados. Imagem de uma conta Business não completa esse ambiente.

**Aceite:** ativação, renovação, cancelamento recuperável, falha de pagamento, reenvio e eventos fora de ordem conciliados com o provedor; eventos persistidos/deduplicados; retomada após interrupção; testes reais no Sandbox documentados. Nunca usar cobrança real para validar. Publicar apenas depois desse aceite, mantendo rastreabilidade de frontend/backend/deploy.

## Processo de execução e conclusão

1. Iniciar uma etapa por vez e criar branch da principal atualizada. Preservar alterações locais alheias à tarefa.
2. Confirmar modelo de dados, contratos, papéis, telas e critérios; produzir migração compatível quando necessária.
3. Implementar o menor fluxo completo da etapa: armazenamento, API, UI, estados vazio/erro/carregamento e traduções EN/PT/ES/HE.
4. Validar riscos do domínio: isolamento, concorrência, idempotência, dinheiro, datas e permissões. Usar dados fictícios e ambientes isolados.
5. Conferir visual desktop/mobile, tema escuro, teclado e RTL; executar lint, testes relevantes, build e CI obrigatório.
6. Registrar resultado e limitações. Integrar/publicar conforme autorização; backend compatível antes do frontend. Confirmar versão no provedor e no artefato servido.
7. Atualizar este plano com commits, deploys, evidências e onde visualizar. Não marcar planejado, simulado ou validado localmente como publicado.

## Registro desta tarefa

- T25: publicada no frontend `d5b7e84`, com CI, Cloudflare e versão servida confirmados. Evidências em [refinamento do projeto](project-detail-design.md).
- Refinamentos adicionais publicados: cliente `9ed7734`; Leads e detalhes `788ee24`.
- T26A: publicada em 22/09/2026, backend `2fc444e`; CI da branch/main e Railway aprovados. Catálogo, limites e evidências em [T26A — Auditoria](t26a-business-audit.md).
- T27A/B: publicada em 23/09/2026, FE `b937560`, BE `11f23db`; versão de produção confirmada também na publicação posterior do Showcase `db1ec75`. Implementação e validação em [Central de atenção](t27-attention-center.md).
- T26B: publicada em 23/09/2026, FE `b2bf2df`, BE `ae94506`; CI branch/main, Railway, saúde da API, Cloudflare e versão servida confirmados. Detalhes em [Auditoria — Consulta](t26b-audit-consultation.md).
- T28A/B: publicada em 24/09/2026, FE `7c360d9`, BE `2c9db7f`; CI branch/main, Railway, saúde da API, Cloudflare e versão servida confirmados. Implementação e validação em [Mudanças de escopo](t28-scope-changes.md). Rascunho comercial preserva moeda no pedido; emissão de fatura segue o processo da equipe, sem cobrança automática.
- T29A/B: implementação em validação final; detalhes, regras comerciais e limites em [Contratos mensais e banco de horas](t29-retainer-hours.md). Ainda não publicada.
- T30–T33: execução autorizada, ainda não implementadas.
- T11: continua pendente e separada.
