# T33 — Agente interno contextual

## Contrato de acesso

O agente pertence à organização e aos funcionários internos (`user`, `operator`, `viewer`, respeitando suas permissões; administradores precisam de organização e vínculo ativos). Clientes não têm launcher, contexto, histórico, geração nem aplicação. O servidor rejeita o perfil cliente antes da consulta ao modelo. Abrir o painel, consultar fontes, ler histórico e executar um plano já gerado não chama o provedor.

Clientes podem receber solicitações de briefing/informação preparadas pela equipe. O resultado é publicado como uma solicitação T31 somente após seleção e confirmação específica de compartilhamento. O cliente usa o portal existente para ler e responder, sem consumir tokens. Nada é enviado por e-mail por esta ação.

## Experiência entregue

Refinamento de 26/09/2026: o botão superior abre um único painel com **Assistente** e **Ferramentas**. O bot flutuante foi removido; rotas antigas de AI Assist abrem a aba Ferramentas desse painel. Cadastro assistido, relatórios semanais, análise de projetos, conteúdo, imagens e propostas continuam disponíveis. Relatórios só são gerados sob solicitação explícita. O histórico oferece uma navegação conjunta para execuções no servidor e conversas locais, sem migrar o armazenamento. Veja o [guia funcional](guia-funcional-flowlio.md) e o [registro do refinamento](unified-ai-workspace-design.md).

- **Flowlio AI** na barra superior de todas as rotas internas de dashboard e viewer, com contexto da página e seleção de área/projeto.
- Atalhos nos detalhes de cliente, lead e tarefa; selecionam o registro sem gerar automaticamente.
- Resposta com fontes reais autorizadas, informações faltantes, prévia editável e seleção de ações.
- Histórico persistente por usuário e organização, status e recibos com links para registros afetados.
- Idiomas EN/PT/ES/HE, RTL, modo escuro, painel responsivo e cancelamento de geração.
- Modo padrão de revisão. A opção de autonomia vale apenas para a solicitação atual e só executa planos compostos inteiramente por criação/planejamento de tarefas internas. Planos mistos permanecem para revisão integral.

## Contexto por área

| Área | Dados utilizados |
| --- | --- |
| Visão geral/projetos/tarefas | Projetos e tarefas visíveis, marcos, briefings, respostas e solicitações de escopo quando o perfil permite |
| Clientes/leads | Cadastro comercial e interações; contratos e consumo calculado ao selecionar cliente |
| Propostas/escopo | Propostas, seus estados e conteúdo, mudanças solicitadas e vínculo com o projeto/cliente |
| Capacidade | Relatório determinístico T21/T32, ausências, incompletude e sobrecarga |
| Financeiro | Faturas para quem pode ver dados financeiros; margem T19 do mês corrente em UTC ao selecionar projeto |
| Registro de horas | Registros recentes do próprio funcionário, respeitando a visibilidade de projeto/tarefa |
| Calendário | Eventos do usuário na organização, de sete dias atrás até trinta dias adiante |
| Documentos | Metadados de arquivos autorizados; análise de conteúdo continua no upload do AI Assist |
| Central de atenção | Relatório determinístico T30 para perfis autorizados |
| Configurações | Regras de fluxo do próprio autor; credenciais e configurações sensíveis não são incluídas |
| Suporte | Orientação textual; conversas de chamados não são carregadas como contexto |

Os conjuntos são amostras recentes limitadas, não totais da organização. Contexto máximo de 100 KB; descrições longas são truncadas. A geração não pesquisa arbitrariamente URLs nem arquivos externos. A presença do agente nas áreas internas não significa autorização para toda operação possível dessas áreas.

## Ações executáveis

1. Criar até 12 tarefas privadas em projetos acessíveis, com responsável, datas e estimativa opcional; zero é preservado e desconhecido continua vazio.
2. Replanejar responsável/datas de tarefas independentes. Tarefas concluídas, hierarquias e dependências exigem o fluxo específico de planejamento.
3. Agendar/alterar follow-up comercial com data e observação, para perfis que podem gerenciar clientes.
4. Publicar solicitação de briefing/informação no portal do cliente atual do projeto, após revisão separada.

Seleção aplica atomicamente e registra auditoria. Papéis, vínculo, visibilidade, responsável elegível, cliente atual, versões e limite do plano são reavaliados. Rascunhos expiram para aplicação em 24 horas. O usuário pode editar textos, responsáveis, datas e estimativas; não pode trocar o tipo ou recurso alvo de uma ação pelo payload.

Não há cobrança, envio de e-mail, aprovação de escopo, exclusão, mudança de acesso nem lançamento de horas pelo agente. Propostas, imagens, arquivos e criação de clientes/projetos continuam disponíveis nas ferramentas existentes; cadastro pelo bot agora exige revisão prévia. Automações recorrentes existentes são preservadas; este incremento não cria rotinas autônomas arbitrárias por linguagem natural.

## Confiabilidade e evolução do existente

- Migração backend `0019_ai_agent_runs`, com snapshot compatível e histórico/recibos por autor.
- Repetir a mesma geração com o mesmo UUID não chama novamente o provedor, inclusive após falha. Repetir aplicação idêntica não duplica efeitos; seleção diferente é recusada.
- Sem retry automático do provedor; resposta inválida ou citação inexistente não pode executar ações. Cancelamento não promete estornar tokens já usados.
- Reutiliza T05 para plano, orçamento, reserva e contabilização. API key permanece no backend.
- Contextos e saídas são validados; documentos são instruídos como dados não confiáveis, não comandos. Esses controles não garantem ausência de erro factual: há fontes e revisão.
- Revogação de acesso bloqueia leitura de respostas antigas. Relatórios agregados alterados exigem novo contexto, por poderem conter informação aninhada cujo acesso mudou. A comparação do snapshot normaliza a ordem das propriedades JSON, preservando a leitura após persistência em JSONB.
- Gerador antigo de tarefas usa IDs reais de usuários ativos, preserva estimativas e passa por revisão.
- Resumo semanal manual, insights e geração antiga de tarefas respeitam visibilidade por recurso. Calendário usa condições SQL conjuntas e escopo de usuário/organização.
- Resumos automáticos compartilhados usam projetos/tarefas públicos e destinatários internos ativos.
- Histórico do chat genérico aceita somente papéis de conversa e possui limites de tamanho; anexos são tratados como dados não confiáveis.
- Removida a apresentação incorreta de modelos no chat.

Integração segue [a documentação de saídas estruturadas da OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs). A chamada usa JSON mode e a aplicação valida o esquema e as referências antes de persistir ações; JSON válido, sozinho, não é tratado como ação válida.

## Validação

Testes PostgreSQL com dados fictícios e provedor simulado: isolamento, bloqueio de clientes, referências forjadas, dados privados, revogação, aplicação idempotente, rollback por quota, zero/estimativa desconhecida, compartilhamento explícito, mudança de cliente, cancelamento e autonomia limitada. Testes React: abertura sem geração, histórico sem consumo, revisão, edição, compartilhamento, execução automática explícita e conflitos.

Migrações testadas em banco vazio, upgrade legado, inicialização concorrente e rollback. Conferência visual do componente real com respostas fictícias: desktop, 320 px, teclado, hebraico e modo escuro. Não representa teste com dados reais nem avaliação factual de respostas ao vivo do provedor.

Resultado local final: 17 testes do agente em PostgreSQL e 10 testes React aprovados, além dos testes de acesso, contabilização e migrações. A regressão de gravação/releitura de relatórios reproduziu a falha antes da correção e passou depois, incluindo rejeição quando o conteúdo aninhado realmente muda. Build e lint aprovados nos dois projetos; suites completas aprovadas pelo CI da entrega inicial.

## Publicação

Entrega inicial publicada em 26/09/2026:

- Frontend `21de5b90d7e75efef8422d4e4badc95cbce38151`, incluindo implementação `8665718` e correção do contexto de rotas. CI branch/main e Cloudflare aprovados; SHA confirmado no bundle servido por `flowlioapp.com`.
- Backend `7ebee6caf0c34b4eae78faea36908dbea79bc71f`. CI branch/main e Railway aprovados; `/api/health` saudável e banco conectado após a migração.
- Branch de implementação nos dois projetos: `feat/t33-contextual-agent`.
- Correção adicional do histórico: backend `44a8f76`, branch `fix/t33-report-history`; normalização de JSONB com teste de regressão. O estado dos checks/deploy dessa correção pode ser conferido no commit do backend.

Próximas expansões de autonomia, fora deste incremento: ampliar ações permitidas por módulo e permitir configurar rotinas recorrentes por linguagem natural com regras por organização. O agente atual não executa operações arbitrárias nem transforma orientações textuais em ações não implementadas.
