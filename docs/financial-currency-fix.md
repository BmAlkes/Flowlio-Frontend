# Moeda explícita e orçamento zero

Correção dos fluxos de proposta, projeto e faturamento por horas (27/09/2026).

## Comportamento

- O projeto registra `currencyCode`. A conversão usa a moeda registrada na proposta e, na ausência dela, `organizations.settings.currency`. Código ISO no orçamento textual, `₪` e `€` são reconhecidos quando não há ambiguidade; `$` sozinho não identifica USD.
- A moeda fica registrada no projeto: alterações posteriores na organização não renomeiam valores existentes. Projetos sem moeda podem defini-la na página de rentabilidade, com confirmação das premissas. Uma moeda já registrada não pode ser trocada sem reconciliação.
- A edição envia orçamento `0` e o backend persiste esse valor. Zero é diferente de ausência de configuração monetária.
- Listas, detalhes, despesas e PDFs usam a moeda do registro. A localidade controla a apresentação, não a denominação.
- “From Time Tracking” exige que todas as horas selecionadas tenham a mesma moeda de projeto. A fatura e cada item de horas guardam essa moeda. Moeda ausente ou diferente bloqueia a operação antes de consumir as horas.
- A fatura manual permite informar explicitamente o código ISO. O backend aceita moeda explícita ou configuração da organização e rejeita ausência de ambas.
- Ao registrar pagamento da fatura, a receita usa a moeda da fatura. Faturas antigas sem moeda não podem ser marcadas como enviadas ou pagas.
- Totais de faturas não agregam valores de moedas diferentes. O relatório financeiro consolidado exige moeda organizacional válida e bloqueia receitas/despesas de moedas incompatíveis ou desconhecidas. Não há conversão cambial automática.

## Migração e limites

O backend precisa da migração `0020_explicit_financial_currency`, incluída no histórico de releases, antes deste frontend. Ela recupera a moeda dos projetos a partir das configurações financeiras existentes, da proposta vinculada ou da organização. Faturas históricas sem moeda permanecem desconhecidas; não é seguro atribuir a moeda atual a cobranças antigas.

O faturamento existente opera em centavos. Moedas com outro número de casas decimais são rejeitadas nesse fluxo. Faturamento recorrente exige moeda configurada na organização; esta alteração não acrescenta uma tela de configuração organizacional nem um processo de reconciliação de documentos antigos.

## Regressão

- ILS, USD e EUR: proposta de 4.000, conversão, edição pelo controlador real para zero, releitura da lista e rentabilidade com a mesma moeda.
- Um minuto a 120/h resulta em 2,00 na fatura e no item persistido, em cada uma das três moedas.
- Moeda ausente/mista: nenhuma fatura criada e nenhuma hora consumida.
- Fatura manual: sem configuração, bloqueia; com código explícito, persiste a denominação.
- Relatório consolidado: bloqueia ausência de moeda organizacional e registros incompatíveis.
- Migração em banco vazio e legado, reexecução, concorrência, idempotência de faturamento e rollback continuam cobertos pelas suítes PostgreSQL.
