# T31 — Pendências e solicitações do cliente

Status: implementação e validação local concluídas; publicação em andamento na branch `feat/t31a-client-pending`, que reúne T31A/B.

## Onde conferir

Portal → Minhas pendências (`/clients/pending`). Projeto → Aguardando cliente (`/dashboard/project/view/:id/pending`). O projeto no portal também oferece acesso à fila filtrada. Lembretes internos abrem a solicitação correspondente.

A fila reúne aprovações de entrega, alterações de escopo aguardando decisão, briefings, dúvidas e pedidos de arquivo. Aprovações levam ao registro exato no módulo de origem, que continua responsável pela decisão e validação de versão. Não há cópia dos estados nem aprovação por simples acesso à página.

## Solicitações

- A equipe cria o pedido para o cliente atual do projeto com portal habilitado. Define instruções públicas, responsável pela conferência, prazo opcional, fuso e dependências.
- Briefings têm até dez perguntas de texto ou escolha única. Perguntas obrigatórias são validadas no servidor. Pedidos de arquivo exigem anexo; dúvidas exigem resposta textual.
- O cliente envia uma resposta; o pedido passa para **Aguardando conferência**. A equipe confirma a conclusão. Cancelamento e reabertura exigem motivo visível ao cliente; reabertura inicia um novo ciclo e preserva respostas anteriores.
- Até dez dependências anteriores do mesmo cliente/projeto precisam estar concluídas. Cancelar uma dependência não a considera resolvida. Reabrir uma dependência volta a bloquear a confirmação do pedido dependente.
- Upload usa a rota existente, tipos permitidos e limite de 10 MB por arquivo. Até dez arquivos por resposta; anexos precisam pertencer ao cliente/projeto e não podem ser arquivos de tarefa. A resposta guarda a versão anexada, mesmo que o arquivo seja atualizado depois.
- Prazo vale até o fim da data no fuso IANA escolhido, inclusive em transições de horário de verão. Filtros por tipo, estado e atraso; contadores e tempo médio de resposta consideram projeto/tipo selecionados. O ciclo reaberto mede a partir da reabertura.

## Lembretes e limites

Lembretes ficam desativados por padrão. A equipe pode escolher notificação interna, e-mail ou push, com intervalo de 24, 48, 72 ou 168 horas. A primeira tentativa ocorre após o prazo; a varredura é horária e cada ciclo tem no máximo três tentativas. Pedidos respondidos, cancelados, de ciclo antigo ou bloqueados deixam de enviar. Mensagens já entregues ao provedor não são recolhidas.

Execução revalida cliente atual, portal, projeto, autor, vínculo, organização e assinatura. E-mail/push exigem preferências e configuração disponíveis. Jobs persistentes deduplicam as tentativas. Resultado externo incerto não é reenviado automaticamente; o histórico indica o resultado. Testes usam remetente simulado, sem enviar mensagens reais.

Limites: 500 pedidos abertos/aguardando conferência por organização; 25 itens por página; dez respostas por página; últimos 50 eventos, 12 tentativas de lembrete e 50 arquivos elegíveis. Criação oferece os últimos 100 pedidos elegíveis para dependências e até 100 revisores. Perguntas e dependências são fixadas ao criar; novo conteúdo pode ser solicitado por reabertura com motivo ou por novo pedido.

## Validação

- 17 testes PostgreSQL da T31: isolamento, papéis, portal desativado, cliente substituído, concorrência/idempotência, respostas obrigatórias, dependências, versões dos anexos, reabertura, prazos/DST, decisões de origem e lembretes.
- Oito testes de regressão do módulo de entregas e dez de migrações/snapshot.
- Nove testes da nova interface, oito de escopo e seis de entregas.
- TypeScript, builds e lint dos dois repositórios; revisão visual com dados fictícios em desktop, celular 320 px, RTL/tema escuro e teclado.
- Traduções EN/PT/ES/HE. Migração aditiva `0017_client_pending`, sem alteração dos registros de aprovação existentes.

## Publicação

Registrar aqui os SHAs, resultados de CI, Railway, saúde da API, Cloudflare e versão efetivamente servida após a publicação.
