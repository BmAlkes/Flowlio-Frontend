# T32 — Cenários de capacidade

Status: publicada em 26/09/2026. A branch `feat/t32a-capacity-scenarios` reuniu T32A/B e foi integrada à `main` nos dois repositórios. Frontend `6bbb5b137a5da1bab0b3622f336585ff8c0ebb25`; backend `9eec4ac56e8afaf0edf9616ea1e18ecd3253089e`.

## Onde conferir

Capacidade da equipe → Cenários de capacidade (`/dashboard/team-capacity/scenarios`). Disponível para proprietários e gestores com contexto de organização, seguindo as permissões do módulo existente.

## Fluxo

1. Cadastrar ausências/férias de dia inteiro, com datas inclusivas em UTC. Elas afetam a capacidade oficial e os novos cenários; não alteram as horas semanais de referência.
2. Criar cenário pessoal com nome, semana inicial e horizonte de uma a 12 semanas. A base guarda membros, disponibilidade, ausências e tarefas abertas acessíveis naquele momento.
3. Ajustar datas e responsável de tarefas existentes ou adicionar cargas hipotéticas para simular um novo projeto. Salvar no cenário não altera tarefas reais.
4. Comparar planejamento base e cenário por semana/pessoa: disponibilidade após ausências, carga, saldo, sobrecarga, estimativas/datas ausentes, dependências e trabalho sem responsável ativo.
5. Selecionar alterações de tarefas e confirmar a revisão. A aplicação altera datas e responsáveis em uma única transação e encerra o rascunho. Mudanças não selecionadas e cargas hipotéticas permanecem sem aplicação. Não são criados projetos/tarefas automaticamente.

## Cálculo e limites

- Mantém a distribuição proporcional das estimativas por dias corridos, em semanas UTC de segunda a domingo. Horas já registradas não são descontadas. Datas não representam promessa de entrega.
- Ausências descontam `horas semanais × dias ausentes / 7`; dias sobrepostos contam uma única vez. Disponibilidade desconhecida continua desconhecida; zero continua zero. Ausências não criam automaticamente feriados ou horários diários.
- Tarefas com subtarefas não entram nos totais: somente tarefas abertas sem subtarefas contribuem para a carga, evitando somar a estimativa principal e suas divisões. Essa regra também se aplica à tela de capacidade atual.
- Trabalho inacessível não expõe títulos e torna o saldo desconhecido. Trabalho sem responsável ativo também impede afirmar capacidade livre. Mover datas não resolve dependências pendentes.
- Até 500 membros ativos, 2.000 projetos e 2.000 tarefas abertas por organização na captura; erro explícito acima do limite. Comparação mostra até 100 pessoas por vez; filtro individual alcança as demais.
- Até 100 cenários por autor, 100 alterações por cenário e 2.000 registros de ausência por organização. Datas de ausências e alterações aceitam até 367 dias inclusivos. Ausências são corrigidas por remoção e novo cadastro. Rascunhos podem ser excluídos; cenários aplicados preservam o registro.

## Concorrência e permissões

O cenário é pessoal e pertence à organização. As leituras revalidam acesso atual às tarefas da base; revogação não revela títulos armazenados. O responsável escolhido precisa estar ativo e ter acesso ao projeto. A aplicação não concede acesso a projetos privados.

Revisão do rascunho e assinatura do planejamento são verificadas antes de salvar/aplicar. A assinatura inclui tarefas, projetos, membros, capacidade e ausências da organização; até mudanças fora da janela podem exigir atualização conservadora. Atualizar a base descarta as propostas e exige confirmação explícita. A confirmação de aplicação na interface fica vinculada à revisão exibida.

Transação serializável, bloqueios de recursos e chave idempotente protegem a aplicação. Falha reverte todas as tarefas selecionadas. Repetir a mesma aplicação confirmada não repete efeitos. Auditoria registra criação, edição, atualização, exclusão, ausências e aplicação; atualizações de tarefas usam o contexto de auditoria existente. Nenhum custo financeiro entra no snapshot.

Migração aditiva `0018_capacity_scenarios`. Cenários não mudam prazos oficiais do projeto, estimativas, dependências, status ou cobranças; a aplicação atua somente nas datas e no responsável das tarefas selecionadas.

## Validação e publicação

- 16 testes de cenários/cálculo com PostgreSQL: simulação sem alterar tarefas, isolamento, acessos revogados, ausências sobrepostas, disponibilidade desconhecida, subtarefas, conflito de origem/revisão, aplicação idempotente, seleção parcial e rollback de todas as tarefas em caso de falha.
- Sete testes de regressão de capacidade e dez testes de migrações/snapshot.
- Nove testes da nova interface e quatro da capacidade existente, incluindo confirmação vinculada à revisão, bloqueio de usuários comuns e preservação das horas recorrentes ao descontar ausências.
- Builds, TypeScript e lint dos dois repositórios. Navegador com dados fictícios em desktop, 320 px, formulário, teclado, hebraico e tema escuro; sem erros JavaScript ou transbordamento horizontal da página. A comparação usa rolagem horizontal interna em telas estreitas.
- Traduções EN/PT/ES/HE. Testes locais não representam sessão autenticada de produção.

- CI de branch e `main` aprovado nos dois repositórios; frontend main concluído às 08:58:54 UTC e backend main às 08:55:35 UTC.
- Railway confirmou o backend `9eec4ac` às 08:54:18 UTC. A API respondeu `healthy`, banco `connected`, às 08:55:18 UTC.
- Cloudflare confirmou a publicação às 08:59:01 UTC. O artefato `/assets/js/index-27NVXwO_.js` servido em produção contém o SHA completo `6bbb5b137a5da1bab0b3622f336585ff8c0ebb25`.
- Próxima etapa: T33A/B, IA contextual com fontes e rascunhos revisáveis. T11 permanece separada, dependente da validação PayPal Sandbox.
