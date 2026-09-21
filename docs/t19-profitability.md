# T19 — Rentabilidade do projeto

Acesso: **Projetos → abrir projeto → Rentabilidade do projeto**, junto das despesas. Rota `/dashboard/project/view/:id/profitability`. Restrito a proprietários e administradores com acesso ao projeto; gestores, membros e clientes não recebem custos internos.

O relatório exige declarar a moeda usada nas despesas e nas tarifas das horas, pois esses registros legados não possuem moeda própria. Esta declaração não converte valores. Receitas já possuem moeda: apenas a selecionada entra no cálculo; outras moedas aparecem separadas e impedem exibir lucro completo. Receitas sem vínculo com o projeto não são distribuídas ou presumidas.

Fórmula: **receitas registradas − despesas registradas − custo estimado das horas concluídas**. O custo estimado por hora é informado separadamente da tarifa de venda e pode ficar ausente. Uma taxa por projeto aplica-se a todo o período; alterações recalculam períodos anteriores. É uma estimativa operacional, não contabilidade por competência nem histórico de custos efetivos por funcionário.

Valores são calculados em centavos inteiros, arredondando o custo de cada registro de tempo. Horas faturáveis sem vínculo em `invoice_time_items` aparecem como não faturadas, com valor conhecido e horas sem tarifa separados. Esse saldo nunca é somado à receita. Faturas anteriores ao vínculo de horas não podem ser conciliadas automaticamente; a tela informa esse limite.

Período explícito em UTC, até 367 dias inclusivos e 10 mil registros de tempo. Receita usa sua data; despesa usa sua data; tempo usa a data de início e duração integral registrada. Registros ativos, inválidos, sem acesso ou sem custo não viram zeros: deixam o resultado incompleto. A leitura usa snapshot transacional consistente.

API: `GET /api/projects/:projectId/profitability?from=YYYY-MM-DD&to=YYYY-MM-DD`; `PUT /api/projects/:projectId/financial-settings`. Migração aditiva `0006_project_profitability.sql`. Publicar backend antes do frontend. Recuperação: reverter código mantendo a tabela de configurações. A T11 não participa deste relatório e segue adiada.

Validação: cálculos exatos, datas inválidas, isolamento entre organizações, projetos privados, perfil sem permissão, moeda diferente, custo ausente, horas incompletas e restritas; interface exige confirmação da moeda e não inventa totais.
