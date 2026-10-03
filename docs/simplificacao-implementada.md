# Fluxos simplificados — implementação de 03/10/2026

Esta entrega muda frontend e backend. Está preparada e validada localmente; não foi publicada em produção. O diagnóstico em `analise-simplificacao-fluxos.md` continua sendo a visão mais ampla, incluindo propostas ainda não implementadas.

## O que mudou e como experimentar

| Objetivo | Caminho para usar | Resultado esperado |
| --- | --- | --- |
| Cadastrar um cliente rapidamente | Clientes → Novo cliente → preencher nome e e-mail; deixar acesso ao portal desligado | Cadastro sem solicitar senha. O acesso pode ser habilitado depois pelas opções existentes. |
| Registrar horas uma vez | Cliente → Contratos e horas → abrir contrato → Contar horas automaticamente → escolher projeto | Novos registros concluídos e faturáveis entram no consumo do contrato. Projeto e contrato precisam ser do mesmo cliente e moeda. |
| Acompanhar o mês | Portal → Consumo mensal | Horas usadas, disponíveis e extras; lista “Horas registradas”; explicação quando estiver vazia. O cliente não precisa lançar horas nessa página. |
| Trabalhar enquanto o mês anterior está em revisão | Contrato ativo com renovação mensal e projeto vinculado → registrar horas no novo mês | Novo mês aberto sem fechar o anterior. Se houver saldo a transferir, a tela avisa que ele ainda depende da revisão anterior. |
| Revisar uma cobrança extra | Portal → Minhas pendências → Aprovar horas extras | Link abre o contrato e o mês corretos. A tela do contrato também destaca meses anteriores aguardando decisão. |
| Preparar a fatura sem copiar valores | Faturas → Pronto para faturar → Criar rascunho de fatura | Mensalidade de mês fechado, excedente aprovado ou pedido adicional aprovado vira uma fatura com moeda e cliente preservados. Nenhum envio ou cobrança é realizado por essa ação. |
| Fazer uma pergunta simples | Projeto → Pedidos ao cliente → nova pergunta | Por padrão, a resposta conclui o pedido. É possível marcar “Quero conferir a resposta antes de concluir”. Arquivos e briefings mantêm essa conferência ativada por padrão. |
| Concluir uma entrega aprovada | Detalhes do projeto → pedir aprovação → manter marcada a opção de concluir a entrega | Aceite conclui o marco correspondente e continua válido para as automações. Não conclui todo o projeto ou todas as tarefas. |
| Encontrar automações | Configurações → Automações | Um acesso no menu, com navegação entre lembretes prontos e criação de regra. As rotas antigas continuam disponíveis. |
| Usar a IA no registro aberto | Abrir o assistente a partir do cliente/projeto | Contexto já conhecido permanece preenchido; os seletores ficam recolhidos e podem ser abertos. Clientes continuam sem acesso ao agente. |

Opções secundárias de pedidos e contratos ficam em “Mais opções”. Textos foram ajustados em português, inglês, espanhol e hebraico. A página de contratos esconde paginação sem outra página e evita apresentar contadores grandes para um único contrato.

## Regras que continuam importantes

- Vincular um projeto não importa retroativamente horas antigas. Use “Adicionar horas anteriores” quando necessário.
- Registros ainda em andamento, não faturáveis, já faturados/alocados, de moeda incompatível ou atravessando a virada do mês não entram automaticamente. Registros que atravessam meses precisam ser corrigidos/divididos antes da inclusão.
- Um projeto só pode consumir um contrato por vez. Parar o vínculo não apaga o histórico já registrado.
- A troca automática de mês depende de contrato ativo, renovação mensal e projeto vinculado. O worker abre meses pendentes; concluir um novo registro de tempo também verifica o mês.
- Fechamento continua sendo uma revisão humana. Um mês com saldo anterior pendente não pode ser finalizado até reconciliar o anterior.
- Horas já alocadas continuam protegidas contra edição. Em mês aberto, retire a alocação antes de corrigir o registro; meses fechados usam o ajuste existente.
- A mensalidade vinculada a uma fatura recorrente não reaparece como mensalidade avulsa. Excedentes dependem da aprovação aplicável.
- A integração impede preparar duas faturas simultâneas da mesma origem. Faturas manuais antigas sem vínculo não podem ser reconhecidas automaticamente como cobrança daquela origem: confira o histórico antes de preparar cobranças antigas.
- Pedido adicional com fatura vinculada não pode ter preço revisado nem ser cancelado enquanto esse vínculo existir. Remova o rascunho antes da revisão; uma cobrança já emitida precisa do tratamento comercial correspondente.
- Faturas de um único projeto criadas por horas ou pedido adicional preservam o projeto na receita ao marcar pagamento. Faturas de vários projetos ainda precisam de uma implementação própria de rateio.
- Pedidos e revisões criados anteriormente mantêm suas regras originais; nenhuma aprovação antiga passa a concluir marcos retroativamente.
- Cadastrar sem portal não envia um convite. O fluxo de convite com definição de senha pelo cliente permanece uma melhoria futura.

## Verificação realizada

- Testes de interface para contratos, vínculo de projeto, fila de faturamento, pendências, automações, diálogo de aprovação e assistente.
- Testes PostgreSQL isolados para autoalocação, saldo entre meses, aprovação de excedente, isolamento de clientes, moeda, concorrência/idempotência, pedido simples, entrega concluída e validade das automações.
- Regressões dos módulos de escopo, entrega, pendências, contratos, numeração de faturas, faturamento por tempo e registro de tempo.
- Validação da migração e correspondência entre snapshot e schema; checagens de TypeScript e compilação de produção do frontend.
- Revisão em Chrome com dados fictícios: contratos da equipe e portal, fila de faturamento, pedidos e regras; desktop, celular de 360 px e hebraico/RTL no modo escuro. Sem erros de execução ou transbordamento horizontal nesses cenários.

Isso não substitui uma sessão com usuários iniciantes nem um teste autenticado em produção.

## Publicação e continuidade

Publicar backend com a migração aditiva `0022_simpler_workflows.sql`, conferir a inicialização e reiniciar o worker antes do frontend. A migração adiciona campos, vínculos e funções; não fecha meses, envia faturas ou altera valores comerciais existentes. A prévia visual usou APIs simuladas; os testes de integração usaram bancos locais dedicados.

A proposta maior ainda inclui convite ao portal, configuração comercial guiada no projeto, fechamento automático opcional, rateio de receitas entre projetos e simplificação adicional de cenários/dashboard. Esses itens não fazem parte desta entrega. As alterações locais anteriores de “My Tasks” e arquivos de ferramentas não pertencem a esta implementação.
