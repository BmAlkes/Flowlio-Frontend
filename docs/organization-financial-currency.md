# Moeda financeira por organização

O proprietário escolhe a moeda na primeira etapa do **onboarding** ou em **Configurações → Moeda da organização**. A alteração exige confirmação e usa o valor anterior para detectar uma edição concorrente. Idioma e moeda são independentes. Funcionários podem consultar a configuração; o portal não permite alterá-la.

O onboarding usa o mesmo formulário e só conclui **Escolher moeda da organização** após verificar a configuração salva. A seleção começa vazia quando não há moeda, sem inferi-la do idioma ou usar USD como padrão. A checklist permite reabrir a escolha; a revisão de registros históricos permanece em Configurações. Gestores e membros mantêm suas etapas anteriores, e progressos e dispensas de onboarding já registrados são preservados.

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

Em **Configurações → Moeda da organização**, após perfil/idioma e antes de segurança, o proprietário encontra **Revisar moedas históricas**. Ele seleciona a moeda real dos valores existentes, revisa os registros e confirma até 50 por vez. A operação preenche moedas ausentes, preserva os valores e registra auditoria. Se algum valor ou versão mudou, um registro pertence a outra organização ou existe conflito com um documento vinculado, todo o lote é rejeitado e a tela identifica o registro que precisa de revisão. É possível desmarcá-lo para continuar com os demais.

Faturas antigas pagas podem ter gerado receitas com USD fixo mesmo sem moeda na fatura. Quando a receita foi gerada pela própria fatura, corresponde ao mesmo cliente e valor e não possui projeto associado, a tela mostra sua moeda atual e a moeda proposta. Uma confirmação adicional autoriza corrigir apenas essa identificação, junto com a moeda ausente da fatura. O servidor verifica novamente as versões e grava a moeda anterior e a nova na auditoria. Não há conversão, nova cobrança ou alteração de datas, status ou valores. Receitas manuais, contratos, horas faturadas com outra moeda e faturas que já possuem moeda não são reclassificados por essa ação.

O faturamento atual armazena valores com duas casas decimais. A configuração oferece apenas moedas compatíveis, incluindo ILS, USD, EUR e BRL. Moedas com zero ou três casas exigem uma evolução da representação monetária; não são arredondadas automaticamente para tentar simular suporte.

## Entrega

Publicar primeiro o backend com a migração `0021_organization_currency`, depois o frontend. A migração adiciona moeda a clientes/leads, recorrências e links, remove o default de receitas e instala proteções contra alteração da moeda já registrada. O startup verifica as proteções necessárias. Alterações da configuração geram atividade com ator, moeda anterior e nova moeda na mesma transação.

Regressões: configuração ILS/EUR/BRL; formatação ILS/USD/EUR/BRL nos quatro idiomas; ausência de moeda; alteração concorrente; permissões e isolamento de organizações; histórico imutável; resumo de receitas com moedas diferentes; emissão recorrente concorrente e rollback.
