# T29A/B — Contratos mensais e banco de horas

Implementação em validação final, branch `feat/t29a-retainer-hours` nos dois repositórios. Ainda não publicada.

## Onde usar

- Cliente → **Contratos e horas**: `/dashboard/client-management/:clientId/contracts`.
- Portal do cliente → **Consumo mensal**: `/clients/contracts`.
- Proprietário e administradores com acesso financeiro configuram contratos, vinculam tempo, registram ajustes e fecham períodos. Gestores podem consultar consumo, sem valores financeiros. O cliente consulta seus próprios contratos e aprova ou recusa excedentes.

## Contrato e períodos

O contrato registra moeda ISO, mensalidade, franquia de horas, primeiro/último mês, fuso, renovação, transferência de saldo e regra de excedentes. Renovação, saldo e cobrança não vêm pré-selecionados no formulário. Os períodos são meses completos no fuso escolhido, sem rateio proporcional. As condições comerciais ficam imutáveis; alterações usam um contrato substituto.

A renovação automática abre o período seguinte **ao fechar o anterior**. Não há job que feche períodos sem revisão. Renovação manual exige abrir o próximo mês em sequência. Pausa bloqueia novos consumos; cancelamento é definitivo. Ambos permitem concluir o período já existente, sem criar novos períodos automaticamente. Não há ajuste proporcional da mensalidade por pausa.

O saldo pode expirar ou ser transferido com limite de minutos e validade entre um e doze meses. O consumo usa primeiro os lotes de saldo mais antigos. Cada lote mantém sua origem e expiração; renovar não reinicia sua validade. O extrato concilia franquia, saldo transferido, consumo, disponível e excedente. Alertas internos aparecem a partir de 80% e ao exceder a franquia; notificações externas ficam para T30.

## Tempo, ajustes e histórico

- A seleção lista registros concluídos, faturáveis, disponíveis, do cliente e inteiramente dentro do mês. O fuso determina os limites reais em UTC, incluindo horário de verão. Registros que atravessam o limite precisam ser divididos previamente no controle de tempo.
- A vinculação é explícita e compara a versão exibida com os dados atuais. Um registro não pode consumir dois contratos, nem ser faturado pelo fluxo de tempo avulso enquanto alocado. Horas avulsas permanecem fora do contrato até serem selecionadas.
- Guardas no PostgreSQL protegem os fluxos antigos e concorrentes. Tempo alocado não pode ser editado ou excluído; em período aberto, remover o vínculo libera o registro para correção, outro contrato ou faturamento avulso.
- Fechamento exige confirmação e fim do período. Timer ativo anterior ao término bloqueia o fechamento. Registros não selecionados continuam fora do extrato: a equipe deve revisar a seleção antes de fechar.
- Períodos fechados são imutáveis. Ajustes positivos/negativos em um período aberto apontam para um lançamento de tempo de período anterior fechado do mesmo contrato, com motivo visível ao cliente. Consumo não pode ficar negativo, inclusive após remover outro lançamento. Créditos de cobrança de períodos anteriores precisam de revisão comercial separada.
- Listas são paginadas: dez contratos, doze períodos, 25 lançamentos e cem candidatos de tempo. Totais incluem todos os lançamentos, não apenas a página visível.

## Fechamento e cobrança

O fechamento guarda um extrato e **rascunho comercial**, com ID, moeda, mensalidade e valor excedente, sem emitir fatura ou acionar cobrança externa. Valores são calculados em centavos inteiros. Quando o contrato exige cobrança de excedentes, o cliente aprova ou recusa o extrato fechado; a equipe não aprova em seu lugar. Uma aprovação não emite nem envia fatura. Excedente recusado não deve ser cobrado.

É possível vincular uma recorrência mensal já existente do mesmo cliente e valor. A recorrência continua responsável pela mensalidade; o rascunho do contrato registra mensalidade zero para não gerá-la novamente. A moeda acordada é confirmada no contrato, pois o modelo legado de faturas não possui moeda própria. A recorrência vinculada não pode ser compartilhada com outro contrato nem ter cliente, valor ou frequência alterados.

Pausar/cancelar o contrato também pausa sua recorrência. Retomar o consumo **não reativa a cobrança**: a equipe revisa o calendário e reativa a recorrência em Faturas. O fechamento não muda o calendário existente. Sem recorrência, o rascunho inclui a mensalidade para revisão e emissão pelo processo da equipe. Nenhuma fatura, e-mail, pagamento ou chamada PayPal é feita pela T29.

## Integridade e acesso

- Organização e vínculo atual do cliente são conferidos no servidor. Consultas do portal não retornam custos internos, taxas dos timers ou títulos privados das tarefas.
- Mutação, extrato, saldo, alocação e auditoria fazem parte da mesma transação. Falha na auditoria reverte a operação. Chaves de idempotência evitam duplicação por retry; versões rejeitam revisão obsoleta.
- Janelas de confirmação preservam o conteúdo/revisão originalmente apresentados, mesmo quando a consulta recebe atualização em segundo plano.
- Auditoria T26B inclui contratos e movimentos para usuários com acesso financeiro. Preços e moeda são removidos no servidor das consultas de gestores sem esse acesso.
- Migração aditiva `0015_retainer_hours`, snapshot/journal e verificação de guards obrigatórios no startup. Contratos e extratos não têm endpoint de exclusão. Referências financeiras restringem exclusões em cascata; o cancelamento preserva o histórico.

## Validação

- Cenários PostgreSQL: fluxo completo, moeda e arredondamento, transferência/expiração, isolamento de organização/cliente, acesso financeiro, concorrência entre contratos e faturamento avulso, alteração de timer, mudança de contrato, limites de mês/DST, pausa/cancelamento, idempotência, fechamento, ajustes, recorrência, rollback e paginação.
- Interface: criação sem regras comerciais implícitas, seleção de tempo com versão, aprovação pelo cliente, erro de versão, pausa, ajuste com seleção de origem, confirmação preservada em atualização de segundo plano, falhas de consulta e acesso negado.
- Chrome com dados fictícios: desktop 1440 px, mobile 390/320 px, diálogos, teclado, HE/RTL/escuro, aprovação pelo portal, vazio/erro. Sem overflow nem erros JavaScript na rodada inicial; revisão visual concluída.
- Suítes finais e publicação em andamento. Registrar SHAs e evidências após aprovação dos checks e confirmação de produção.
