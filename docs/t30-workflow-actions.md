# T30 — Ações entre módulos

Status: publicada em 25/09/2026. A branch `feat/t30a-workflow-actions` reuniu T30A/B e foi integrada à `main` nos dois repositórios. Frontend `712c4a88cd701ec1620eee4b8bd802ac3c69030c`; backend `7f32e5415e64d0e52565e8addea5356079b89680`.

## Onde conferir

Configurações → Workflows. Salvar uma regra pausada, simular, conferir destinatário/ação e ativar para novos eventos. O histórico mostra as últimas 50 avaliações, motivo de bloqueio e acesso ao projeto ou cliente de origem.

## Catálogo

- Notificar uma pessoa no Flowlio, por e-mail ou por notificação do navegador.
- Criar tarefa privada no projeto, com responsável escolhido explicitamente.
- Substituir o responsável pelo projeto; a tela informa que isso concede acesso à pessoa escolhida.
- Preparar rascunho comercial de escopo adicional aprovado ou excedente mensal aprovado. Valor e moeda vêm da aprovação; nenhum campo permite inventar valor para um evento operacional.

Gatilhos: conversão de proposta em projeto, entrega aprovada, ajustes solicitados, marco concluído, escopo aprovado, consumo mensal de 80%/100%, período fechado e excedente aprovado. O consumo considera horas incluídas e saldo transferido. Cada limite dispara no máximo uma vez por período, mesmo após remoção e realocação de horas.

Eventos de contrato podem criar tarefas ou atribuir um projeto escolhido. A execução exige que o projeto pertença ao cliente do evento. Notificações de contratos sem projeto só são enviadas a proprietários/gestores ativos. Tarefas e notificações de projeto exigem acesso atual do destinatário; a atribuição ao projeto é a ação explícita que concede esse acesso.

## Execução

- Migração aditiva `0016_workflow_actions`; regras antigas continuam como notificações internas para o próprio autor.
- Eventos novos de marcos e auditoria são registrados na transação de origem; sem reconstrução do histórico anterior à migração.
- Até 100 avaliações por execução da organização; continuam os limites de 20 regras por pessoa/100 por organização e a verificação da cota de tarefas.
- Revalida autor, vínculo, organização/assinatura, projeto/cliente, aprovação e versão. O worker pausa regras cujo autor perde permissão.
- Simulação usa até 100 eventos históricos acessíveis e não grava ações, mensagens, jobs ou recibos. Condições refletem o estado atual.
- Efeito interno e registro de execução são atômicos. Falha reverte a ação, permanece visível e permite nova tentativa explícita quando segura, até cinco tentativas. Concorrência usa o mesmo registro por regra/evento.
- A pausa não recupera eventos anteriores à reativação. Ações não emitem novos gatilhos elegíveis, evitando ciclos.
- Mudanças de responsável entram na auditoria como sistema, identificando a regra e a execução.

## Financeiro e envio externo

Rascunhos comerciais preservam a moeda, como T28/T29. O escopo usa uma identidade única por versão aprovada, compartilhada entre regras e aplicação manual. Uma revisão posterior invalida a elegibilidade do rascunho antigo. O excedente reutiliza o rascunho do fechamento; a mensalidade continua sob responsabilidade do contrato/recorrência.

Isso **não emite uma fatura nem envia ou cobra o cliente**. A equipe deve revisar o valor e emitir a fatura pelo processo financeiro existente. Valores ficam restritos ao proprietário; gestores não podem configurar a ação financeira.

Envios externos usam o outbox persistente. Antes do envio, a regra, o acesso do autor/destinatário, as preferências e a disponibilidade do canal são verificados novamente. O histórico distingue fila, aceitação pelo provedor, cancelamento e resultado incerto. Aceitação pelo provedor não significa leitura ou entrega na caixa de entrada. Interrupção, resposta inconclusiva ou falha externa não autorizam reenvio automático; a equipe deve conferir com o provedor.

## Validação

- PostgreSQL isolado: 22 testes de workflows aprovados, incluindo fila real com provedor simulado e invalidação da versão de entrega; 17 de escopo e 17 de contratos aprovados.
- Frontend: 7 testes aprovados, incluindo responsável explícito, simulação, histórico financeiro e ausência de retry para envio incerto.
- Builds de frontend/backend e lint aprovados. Revisão com Chrome: desktop 1440 px, mobile 390/320 px, tema escuro/RTL, teclado, histórico, vazio e erro; sem erros de página ou rolagem horizontal.
- 10 testes da migração aprovados: banco vazio/legado, inicializações concorrentes, snapshot e proteções obrigatórias.
- CI completo aprovado na branch e na main de ambos os repositórios. Railway confirmou `7f32e54` às 17:08:02 UTC; `/api/health` confirmou `healthy` e banco conectado às 17:09:19 UTC, com o processo novo em execução.
- Cloudflare Pages aprovado às 17:12:47 UTC; o JavaScript de produção `/assets/js/index-CoSPJPY9.js` contém o SHA completo `712c4a88cd701ec1620eee4b8bd802ac3c69030c`. CI da main do frontend concluído às 17:12:57 UTC.

Nenhum teste envia mensagens reais nem chama um provedor pago.
