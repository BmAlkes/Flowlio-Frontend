# Flowlio — funcionalidades, uso e integração dos fluxos

Atualizado em 26/09/2026. Guia da versão atual, conferido nos módulos e nos registros das entregas T01–T33. Os nomes do menu podem aparecer em português, inglês, espanhol ou hebraico. Recursos disponíveis dependem do plano, do papel e do acesso ao registro.

## 1. O fluxo completo de um cliente

Exemplo: uma agência cadastra a **Acme** para criar um site e prestar manutenção mensal.

| Passo | O que fazer no Flowlio | O que acontece / próximo vínculo |
| --- | --- | --- |
| 1. Registrar a oportunidade | Em **Leads**, registrar contato, etapa comercial, interações e próxima data de acompanhamento. | A equipe acompanha a negociação. Um lead ainda não é, por si só, um projeto ou uma cobrança. |
| 2. Cadastrar o cliente | Em **Client Management → Create client**, preencher nome, e-mail, senha e dados comerciais; conferir o acesso ao portal. Também é possível preparar o cadastro em **Flowlio AI → Ferramentas → Criar cliente**, revisando antes de executar. | O cadastro cria o registro do cliente da organização e uma identidade de login com papel de cliente. Nome, e-mail e senha são obrigatórios nesse fluxo. O e-mail não pode pertencer a outro usuário já existente. A criação direta não dispara um e-mail de boas-vindas. |
| 3. Organizar a ficha | Abrir a ficha do cliente e conferir dados, contatos, interações, projetos, arquivos e propostas vinculados. | A ficha funciona como ponto de acompanhamento do relacionamento. Nenhum projeto é criado apenas por adicionar o cliente. |
| 4. Preparar a proposta | Gerar uma proposta com IA ou usar o fluxo de propostas; conferir o cliente, o conteúdo e as condições antes de salvar/compartilhar. | A proposta fica ligada ao cliente. Texto gerado precisa de conferência, especialmente valores e prazos. |
| 5. Transformar a proposta aprovada em projeto | Em **Financeiro → Propostas**, abrir uma proposta aprovada e escolher **Criar projeto**. Revisar nome, template, tarefas, marcos, estimativas e, quando permitido, orçamento. | O sistema cria projeto, tarefas e marcos revisados e preserva o vínculo com a proposta. O projeto começa privado e pendente; as tarefas começam privadas e a fazer. A repetição da conversão não deve criar outro projeto. Também existe criação manual de projeto, com seleção explícita do cliente. |
| 6. Pedir o briefing | No projeto, abrir **Aguardando cliente**, criar um briefing e definir perguntas, prazo, responsável pela conferência e eventuais dependências. A IA também pode preparar esse pedido para revisão. | O cliente atual do projeto, com portal habilitado, recebe o pedido em **Minhas pendências**. A publicação pelo agente exige confirmação de compartilhamento. |
| 7. Conferir a resposta | O cliente responde; a equipe abre o pedido e confere o conteúdo. | O estado passa a **Aguardando conferência**, não a concluído automaticamente. A equipe conclui ou reabre com motivo. |
| 8. Planejar a execução | Criar tarefas, responsáveis, estimativas, datas, dependências e marcos. Em **Team capacity**, conferir a disponibilidade. Em **Cenários**, simular mudanças antes de aplicá-las. | Estimativas e datas alimentam a previsão de carga. Uma simulação não altera o planejamento oficial até a confirmação das mudanças selecionadas. |
| 9. Executar e registrar horas | A equipe executa tarefas e usa **Time Tracking** para registrar o tempo real, associando projeto/tarefa e condição faturável. | As horas reais alimentam acompanhamento, consumo de contratos e faturamento. Estimativa de tarefa não é hora trabalhada. |
| 10. Entregar e pedir aprovação | No projeto, abrir **Aprovações de entregas** e solicitar revisão de um marco. | O cliente aprova a versão apresentada ou pede ajustes com comentário. A decisão fica no histórico. Aprovar a revisão não conclui automaticamente o marco. |
| 11. Tratar pedidos adicionais | Em **Mudanças de escopo**, registrar o extra, analisar e estimar impacto. Enviar a estimativa para decisão do cliente. | Após aprovação, a equipe pode aplicar os efeitos previstos: tarefa, prazo e rascunho comercial quando elegível. Aceitar um extra não cobra o cliente automaticamente. |
| 12. Faturar | Para horas avulsas: **Faturas → From Time Tracking**, selecionar cliente, período e registros, revisar tarifas e emitir. Para manutenção: configurar **Contratos e horas**, alocar o consumo e fechar o período após revisão. | A fatura de horas mantém vínculo com os registros usados. O fechamento de contrato prepara um rascunho comercial; a emissão da fatura continua no fluxo financeiro. |
| 13. Acompanhar o resultado | Consultar **Rentabilidade**, **Central de atenção**, **Auditoria** e históricos das automações. | A equipe vê margem estimada, pendências calculadas, alterações registradas e resultados das regras configuradas. |

**O que é automático ao cadastrar diretamente o cliente:** gravação do cadastro, criação da identidade de acesso e atualização das listas/ativação pertinentes. **O que exige decisão posterior:** proposta, projeto, vínculo de tarefas, briefing, contrato, fatura, envio e pagamento. Não existe uma cadeia que execute todas essas etapas apenas porque um cliente foi adicionado.

Para testar o caminho sem cobrança, use registros de teste e pare antes das ações de envio/pagamento. Os dados do exemplo acima são fictícios.

## 2. Catálogo funcional

### Relacionamento e organização

| Funcionalidade | Como utilizar | Como se integra |
| --- | --- | --- |
| Dashboard | Entrar na área da organização e acompanhar os indicadores acessíveis, próximos trabalhos e atalhos. | Consolida dados dos módulos; respeita o usuário e a organização ativos. |
| Onboarding por papel | Seguir o checklist de primeiros passos e abrir as ações indicadas. | Cliente, projeto e entrega reais completam as etapas; simplesmente abrir uma tela não simula conclusão. |
| Leads e detalhes | Organizar oportunidades nas etapas do pipeline; abrir os detalhes para contato, atividades e follow-up. | Prepara o relacionamento comercial. A conversão/cadastro é uma decisão da equipe, não uma criação automática de projeto. |
| Gestão de clientes | Cadastrar, editar e abrir a ficha para acompanhar relacionamento e registros vinculados. | Cliente é referência de propostas, projetos, faturas, arquivos e contratos. O acesso ao portal é controlado. |
| Campos personalizados | Configurar e preencher os campos disponibilizados nos formulários de negócio. | Complementam os dados do registro; não substituem os campos obrigatórios nem criam automações por si só. |
| Gestão de usuários e papéis | Proprietário/gestor administra as pessoas e seus vínculos, conforme as permissões disponíveis. | Responsáveis por projetos/tarefas, capacidade, notificações e execução de regras dependem de membros ativos e elegíveis. |
| Busca e atalhos | Usar a busca/central de comandos e as ações rápidas do cabeçalho. | Abrem os registros e fluxos existentes sem mudar as permissões. |

### Proposta, projeto e execução

| Funcionalidade | Como utilizar | Como se integra |
| --- | --- | --- |
| Propostas com IA | Em **Flowlio AI → Ferramentas → Arquivos, textos e imagens**, usar **Generate Proposal**; conferir o cliente e o resultado no módulo de propostas. | Gera conteúdo comercial editável. A proposta aprovada pode ser convertida em projeto por revisão explícita. |
| Conversão de proposta em projeto — T18 | Selecionar **Criar projeto** na proposta aprovada e revisar o preview. | Copia somente os elementos revisados, liga proposta/cliente/projeto e evita conversão duplicada. Não cria pagamento. |
| Templates | Selecionar um template autorizado ao preparar projetos/conversões. | Reaproveita a estrutura de tarefas e marcos, com revisão antes da criação. |
| Página de projeto — T25 | Abrir o projeto e navegar entre visão geral, tarefas, arquivos e áreas vinculadas. | Reúne execução, pendências do cliente, escopo, rentabilidade e auditoria conforme o acesso. |
| Tarefas e detalhes | Criar tarefas e ajustar responsável, datas, estimativa, estado, hierarquia e dependências nos fluxos correspondentes. | Alimenta progresso e capacidade; pode receber registros de tempo. Projetos/tarefas privados não ficam visíveis a qualquer funcionário. |
| Marcos | Definir pontos de entrega e acompanhar prazo/estado. | A revisão de entrega usa uma versão específica do marco. Projetos convertidos podem receber marcos do template. |
| Arquivos e versões | Usar a central de mídia e os arquivos vinculados ao cliente/projeto/tarefa. | Respostas de pedidos de arquivo guardam a versão anexada. A IA de conteúdo analisa uploads explícitos; o agente contextual recebe metadados, não lê automaticamente todos os arquivos. |
| Calendário | Consultar/criar eventos e utilizar os recursos de integração configurados na conta. | Complementa planejamento e lembretes. Integrações externas dependem da conexão/configuração do usuário. |
| Time Tracking | Iniciar/concluir timers ou usar os registros de tempo disponíveis, conferindo projeto, tarefa, período e condição faturável. | Fonte de horas reais para consumo de contrato, faturamento avulso e indicadores. A IA não inventa nem lança horas automaticamente. |
| Capacidade — T21 | Escolher semana/equipe, definir disponibilidade semanal e conferir carga por pessoa. | Usa estimativas, datas, ausências e dependências. Sem estimativa ou disponibilidade, o resultado é indicado como incompleto/desconhecido. |
| Cenários e ausências — T32 | Criar cenário de 1 a 12 semanas, adicionar mudanças ou carga hipotética e comparar antes/depois. Registrar ausências quando necessário. | Só a confirmação das tarefas selecionadas altera o planejamento. Carga hipotética de novo trabalho continua sendo simulação. Base desatualizada exige revisão. |

### Colaboração com o cliente

| Funcionalidade | Como utilizar | Como se integra |
| --- | --- | --- |
| Portal do cliente | Usar a conta de cliente com portal habilitado. A entrada inicia no Dashboard. | Mostra registros permitidos do próprio cliente: projetos, tarefas, documentos, propostas, faturas, pendências e consumo mensal, conforme o módulo. |
| Aprovação de entregas — T20 | Equipe solicita revisão de um marco; cliente aprova ou pede ajustes. | Preserva versão, autor, data e comentário. Mudança de marco/cliente invalida pedidos antigos quando aplicável. A decisão não altera automaticamente o progresso do marco. |
| Pendências e briefings — T31 | Criar briefing, dúvida ou pedido de arquivo no projeto; cliente responde pelo portal; equipe confere. | Reúne pedidos próprios e atalhos para aprovações de entrega/escopo. O módulo de origem continua responsável pela decisão. |
| Dependências entre pedidos | Ao criar um pedido, selecionar solicitações anteriores que precisam estar concluídas. | Pedidos dependentes ficam bloqueados até a resolução; cancelar uma dependência não equivale a concluí-la. |
| Lembretes de pendências | Configurar prazo, fuso, intervalo e canal quando necessário. | Ficam desligados por padrão. Quando habilitados, respeitam estado, ciclo, dependências, preferências e disponibilidade do canal. |
| Mudanças de escopo — T28 | Registrar → analisar → estimar → aguardar cliente → aprovar/recusar → aplicar quando elegível. | Liga solicitação à versão estimada; aplicação pode preparar tarefa, ajuste de prazo e rascunho comercial. Aprovação não emite fatura. |
| Inbox, comentários e notificações | Consultar mensagens e participar das conversas permitidas. Ajustar as preferências disponíveis. | Complementam os registros de trabalho; canais externos dependem de configuração. O agente não envia mensagens externas arbitrariamente. |
| Suporte | Abrir e acompanhar chamados nos fluxos de suporte. | Os chamados não são carregados automaticamente como contexto do agente de IA. |

### Financeiro e contratos

| Funcionalidade | Como utilizar | Como se integra |
| --- | --- | --- |
| Faturas e numeração — T06 | Criar/consultar faturas e acompanhar o estado pelos fluxos financeiros. | Numeração é controlada por organização/série, inclusive na recorrência; não depende de contar linhas da listagem. |
| Faturamento de horas — T07 | Selecionar cliente/período, registros concluídos e faturáveis, conferir tarifas e criar a fatura. | O servidor calcula valores e grava vínculos. Horas já faturadas ou alocadas a contrato não ficam disponíveis como horas avulsas. |
| Conferência das horas faturadas | Abrir **View tracked hours** na fatura criada por horas. | Mostra os registros e valores preservados na emissão. Os campos protegidos desses registros não podem ser alterados livremente. |
| Faturas recorrentes | Configurar periodicidade e cliente no módulo financeiro; revisar calendário e estado. | Jobs persistentes tratam a recorrência. Uma recorrência pode estar vinculada a um contrato mensal elegível, evitando repetir sua mensalidade no rascunho. |
| Contratos e banco de horas — T29 | Na ficha do cliente, abrir **Contratos e horas**, definir condições e acompanhar os períodos. | Franquia, saldo transferido, consumo e excedente formam o extrato. Não agrega automaticamente todo timer do cliente: a equipe aloca registros elegíveis. |
| Fechamento mensal | Revisar consumo e fechar após o fim do período; conferir excedentes e próximo mês. | Período fechado é imutável. Renovação automática abre o próximo período ao fechar o anterior; não há fechamento autônomo sem revisão. |
| Excedentes | Cliente aprova/recusa quando o contrato exige decisão; equipe revisa o rascunho comercial. | Recusa não autoriza cobrança. Aprovação não emite nem envia fatura. Ajustes posteriores usam o fluxo próprio e motivo. |
| Rentabilidade — T19 | No projeto, escolher período, conferir moeda e custo interno, receitas/despesas e horas. | Distingue custo do trabalho de tarifa de venda. Valores ausentes geram resultado incompleto; gestor sem acesso financeiro não recebe custos internos. |
| Pagamentos e links | Usar os fluxos financeiros disponíveis e configurar os provedores aplicáveis. | Estados e confirmações do provedor são distintos de aprovar proposta, entrega ou escopo. Não afirmar que toda aprovação gera cobrança. |
| Assinatura da própria organização | Consultar plano, limites e assinatura da conta Flowlio. | É diferente de cobrar os clientes da agência. A ampliação da conciliação PayPal da T11 continua pendente de validação Sandbox. |

### Gestão, rastreabilidade e automações

| Funcionalidade | Como utilizar | Como se integra |
| --- | --- | --- |
| Central de atenção — T27 | Filtrar tipo, estado, responsável e período; abrir o registro de origem, atribuir ou adiar o acompanhamento. | Calcula aprovações demoradas, horas não faturadas, sobrecarga, propostas paradas e consumo de orçamento. Resolver a origem retira o item elegível da fila. Adiar não resolve a origem. |
| Limiares da organização | Ajustar dias/minutos/percentual na Central de atenção. | Define quais condições entram na fila. Não é uma regra que altera dados de projeto ou emite cobranças. |
| Workflows — T22/T30 | Criar regra pausada, escolher gatilho/condição/ação/destinatário, simular e só então ativar. | Aplica-se a novos eventos elegíveis. Pausar/reativar não recupera automaticamente eventos anteriores. |
| Ações de workflow | Configurar notificação interna/e-mail/push, criação de tarefa, atribuição de projeto ou rascunho comercial elegível. | Acesso e estado são revalidados. Substituir responsável é uma ação explícita que pode conceder acesso ao projeto. Rascunho financeiro não equivale a fatura. |
| Histórico e nova tentativa | Abrir histórico da regra e conferir execução, bloqueio ou envio incerto. | Nova tentativa só aparece quando considerada segura. Aceitação pelo provedor não comprova leitura; envio incerto não autoriza reenvio automático. |
| Auditoria de negócio — T26 | Filtrar período, pessoa, recurso e ação; abrir o detalhe e exportar quando permitido. | Registra alterações de negócio cobertas pelo catálogo, incluindo valores antes/depois. É consulta, não botão de desfazer. Não é registro universal de cada clique. |
| Histórico operacional — T15 | Consultar falhas operacionais e referências apresentadas pela aplicação. | Ajuda a relacionar falhas de interface, API e jobs; é separado da auditoria de mudanças de negócio. |
| Segurança e sessão — T03/T04 | Entrar com a conta correta, escolher a organização permitida e administrar vínculos ativos. | O servidor confere papel, organização, cliente e visibilidade. Ocultar um botão não é a única proteção. |

## 3. Como usar o Flowlio AI unificado

O acesso principal é **Flowlio AI**, na barra superior. O boneco flutuante foi removido. Atalhos de registros e acessos antigos de AI Assist abrem esse mesmo espaço.

### Assistente

1. Abrir o painel; conferir a área e o projeto selecionados.
2. Escrever a solicitação. Abrir o painel ou ler o histórico não chama o modelo.
3. Conferir a resposta, as fontes e as informações faltantes.
4. Para ações, editar os campos necessários, selecionar o que executar e confirmar.
5. Para um briefing visível ao cliente, confirmar também o compartilhamento.
6. Conferir o recibo e abrir o registro afetado.

Exemplos úteis:

- “Resuma este projeto, cite as fontes e indique os próximos passos.”
- “Transforme o briefing em tarefas. Deixe estimativas desconhecidas em branco.”
- “Compare a solicitação extra com o escopo disponível e aponte o que falta decidir.”
- “Explique a margem deste projeto usando o relatório do período.”
- “Prepare perguntas de briefing para o cliente; quero revisar antes de publicar.”
- “Proponha um follow-up para este lead com data e observação.”

A autonomia opcional vale para a solicitação atual e cobre planos compostos por criação/replanejamento de tarefas internas. Um plano que inclua compartilhamento ou outra ação exige revisão. Planos com hierarquias/dependências complexas devem seguir o planejamento específico.

### Ferramentas

- **Criar cliente:** a IA extrai nome/e-mail/dados comerciais; a pessoa revisa e informa a senha do portal localmente. A senha preenchida na revisão não é enviada ao modelo nem incluída no histórico de conteúdo.
- **Criar projeto:** gera rascunho de nome, descrição, datas e dados informados; exige revisão. Para preservar o vínculo comercial completo de uma proposta, usar a conversão da proposta aprovada.
- **Planejar tarefas / Resumo dos projetos:** abrem o Assistente contextual com uma solicitação sugerida, sem gerar automaticamente.
- **Relatório semanal:** selecionar um período opcional e clicar em gerar. Apresenta resumo, destaques, recomendações, métricas e análise por projeto.
- **Análises de projetos:** clicar em gerar para consultar riscos, tarefas urgentes/atrasadas e recomendações. O índice de risco não é uma probabilidade estatística. Abrir essas ferramentas não gera relatórios automaticamente.
- **Arquivos, textos e imagens:** reaproveita as ferramentas existentes de chat, upload, geração de imagens e geração de propostas. `/image descrição` também gera imagem. Conteúdo textual não executa ações nos módulos.
- **Propostas:** o atalho leva ao módulo para consultar, revisar e converter propostas. A geração continua disponível na ferramenta de conteúdo.

O **Histórico** reúne o acesso às execuções contextuais e às conversas de conteúdo. Há uma diferença de armazenamento: execuções contextuais ficam no servidor por autor/organização, com nova verificação de acesso; conversas antigas e de conteúdo ficam no navegador por usuário. Unificar a navegação não migra automaticamente o histórico local entre dispositivos. Senhas da revisão e anexos binários não são copiados para um novo histórico pelo cadastro assistido.

Conversas de conteúdo podem ser abertas, renomeadas, excluídas individualmente ou limpas com confirmação. Essa limpeza afeta o histórico local; não apaga clientes, projetos ou execuções do agente no servidor.

Clientes do portal não acessam o agente, ferramentas, contexto nem geração. Podem ler materiais compartilhados e responder aos pedidos publicados pela equipe sem consumo de IA. O consumo de geração segue os limites do plano da organização.

## 4. Quais eventos podem acionar automações

| Evento de origem | Próxima ação possível, quando houver regra ativa |
| --- | --- |
| Proposta convertida em projeto | Notificar, criar tarefa ou atribuir responsável, conforme a regra elegível. |
| Entrega aprovada / ajustes solicitados / marco concluído | Organizar o próximo trabalho ou notificar o responsável escolhido. |
| Escopo aprovado | Criar/encaminhar trabalho e preparar rascunho comercial autorizado quando aplicável. |
| Consumo mensal chega a 80% ou 100% | Alertar e organizar o acompanhamento do contrato. |
| Período mensal fechado | Encaminhar a conferência do fechamento. |
| Excedente aprovado | Preparar o rascunho comercial elegível e encaminhar o acompanhamento. |

Essas ações dependem de regras configuradas, permissões, plano e estado atual. Configurar uma regra de notificação não configura automaticamente cobrança. Mensagens externas dependem também das preferências e do canal disponível.

## 5. Como ler o novo layout

- **Cabeçalho:** identifica a área e suas ações principais.
- **Cartões de resumo:** apresentam valores reais. “Nesta página”, “Itens carregados” e “Filtros atuais” delimitam a abrangência; não são totais globais implícitos.
- **Filtros:** definem a consulta ou, quando escrito “Pesquisar nesta página”, somente os registros já carregados.
- **Tabela/lista central:** apresenta registros e ações efetivas. Não há seleção em massa onde o módulo não suporta execução em massa.
- **Coluna lateral:** explica cálculo, regras e sequência de trabalho. Em telas estreitas, passa para baixo do conteúdo.
- **Dados desconhecidos:** continuam vazios ou marcados como desconhecidos. Não são convertidos visualmente em zero.

A referência visual foi aplicada à Central de atenção, Capacidade, Cenários, Pendências, Escopo, Contratos, Workflows e Auditoria. Não foram copiadas as métricas fictícias, percentuais de variação ou estados sem equivalente no Flowlio.

## 6. Inventário das entregas T01–T33

| Entregas | Resultado atual |
| --- | --- |
| T01 | Base de qualidade: lint, build e processo de validação. |
| T02 | Nova ficha de cliente e integração dos detalhes do relacionamento. |
| T03–T04 | Autorização por recurso, sessão/organização ativa e isolamento do cache. |
| T05 | Limites, reserva e contabilização do consumo de IA. |
| T06–T07 | Numeração consistente de faturas e faturamento de horas com vínculos persistentes. |
| T08 | Integridade do tempo e disponibilidade dos registros para execução/faturamento. |
| T09–T10 | Migrações controladas e jobs persistentes para os processos em segundo plano. |
| T11 | **Pendente:** ampliação da conciliação de assinaturas PayPal; requer ambiente e validação Sandbox. |
| T12–T14 | Contratos de API/estados, modularização e melhorias de cache/paginação/consulta. |
| T15–T17 | Histórico operacional, acessibilidade/localização dos fluxos core e CI dos fluxos críticos. |
| T18–T20 | Conversão de proposta, rentabilidade e aprovação de entregas. |
| T21–T24 | Capacidade, workflows, onboarding por papel e documentação operacional. |
| T25–T27 | Refinamento do projeto, auditoria de negócio e Central de atenção. |
| T28–T30 | Mudanças de escopo, banco de horas e ações entre módulos por automação. |
| T31–T33 | Pendências do cliente, cenários de capacidade e agente interno contextual. |
| Refinamento atual | Entrada única de IA, ferramentas integradas, guia de uso e padrão visual das oito áreas confirmadas. |

Base técnica, critérios e limitações detalhadas: [plano T01–T24](plano-de-trabalho.md), [plano T25–T33](plano-evolucao-produto.md), [IA contextual](t33-internal-ai-agent.md), [conversão de proposta](t18-proposal-to-project.md), [aprovações](t20-delivery-approval.md), [escopo](t28-scope-changes.md), [contratos](t29-retainer-hours.md), [workflows](t30-workflow-actions.md), [pendências](t31-client-pending.md) e [cenários](t32-capacity-scenarios.md).
