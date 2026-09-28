# Moeda financeira por organização

O proprietário escolhe a moeda em **Configurações → Moeda da organização**. A alteração exige confirmação e usa o valor anterior para detectar uma edição concorrente. Idioma e moeda são independentes. Funcionários podem consultar a configuração; o portal não permite alterá-la.

## Fluxo

- Novos projetos recebem a moeda da organização. Projetos derivados de propostas preservam a moeda explícita da proposta.
- Novos leads registram a moeda separadamente do valor. Listagens e pipeline deixam de presumir dólar.
- Propostas geradas por IA recebem a moeda da organização; a geração é bloqueada antes de chamar o provedor se ela não estiver configurada.
- Faturas manuais e contratos mensais apresentam a moeda da organização no formulário. A recorrência salva a moeda no modelo, preservando-a nas próximas faturas mesmo após a organização mudar de moeda.
- Despesas, rentabilidade, tempo faturável e links de cobrança usam a moeda registrada no projeto/documento. A emissão a partir de horas continua exigindo projetos com uma única moeda conhecida.
- O resumo de receitas usa a moeda da organização, informa quantos registros ficaram fora do resumo e mantém todos os lançamentos visíveis com sua moeda original. Não há conversão de câmbio.
- Portal, lembretes de cobrança e contexto financeiro do agente recebem a moeda do documento.
- A assinatura paga ao Flowlio mantém a moeda do plano. A criação de uma organização após o pagamento não configura mais USD automaticamente para suas operações.

## Histórico e limites

Mudar a configuração não converte valores nem troca moedas históricas. A migração não atribui uma moeda presumida a leads, modelos recorrentes ou links antigos. Registros sem moeda mostram a pendência; recorrências sem moeda não geram faturas e links sem moeda não oferecem pagamento. Esses registros precisam de revisão explícita antes de voltar a ser usados financeiramente. Projetos sem moeda podem ser revisados nas configurações de rentabilidade já existentes.

Em **Configurações → Revisar moedas históricas**, o proprietário seleciona a moeda real dos valores existentes, revisa os registros e confirma até 50 por vez. A operação preenche apenas moedas ausentes, não altera os valores e registra auditoria. Se algum valor ou versão mudou, um registro pertence a outra organização ou existe conflito com receita/contrato vinculado, todo o lote é rejeitado. Registros que já possuem moeda não podem ser reclassificados por essa ação.

O faturamento atual armazena valores com duas casas decimais. A configuração oferece apenas moedas compatíveis, incluindo ILS, USD, EUR e BRL. Moedas com zero ou três casas exigem uma evolução da representação monetária; não são arredondadas automaticamente para tentar simular suporte.

## Entrega

Publicar primeiro o backend com a migração `0021_organization_currency`, depois o frontend. A migração adiciona moeda a clientes/leads, recorrências e links, remove o default de receitas e instala proteções contra alteração da moeda já registrada. O startup verifica as proteções necessárias. Alterações da configuração geram atividade com ator, moeda anterior e nova moeda na mesma transação.

Regressões: configuração ILS/EUR/BRL; formatação ILS/USD/EUR/BRL nos quatro idiomas; ausência de moeda; alteração concorrente; permissões e isolamento de organizações; histórico imutável; resumo de receitas com moedas diferentes; emissão recorrente concorrente e rollback.
