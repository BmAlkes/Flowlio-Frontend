# T20 — Aprovação de entregas por marco

Onde usar: **Projetos → abrir projeto → Aprovações de entregas**. Proprietários e gestores solicitam uma revisão; o cliente responde em **Portal → Projetos → abrir projeto → Aprovações de entregas** (`/clients/projects/view/:id`). A solicitação aparece no portal. Esta funcionalidade não envia e-mail automaticamente.

## Solicitar e responder

1. Vincule um cliente ao projeto e habilite seu acesso ao portal. A seção explica o impedimento e oferece um atalho quando alguma dessas condições falta.
2. Clique em **Solicitar revisão**. Se não houver marcos, crie o primeiro na própria janela, com título e prazo opcional. Também é possível criar ou editar um marco pelo seletor.
3. Selecione o marco, confira o cliente destinatário e descreva o que ele deve revisar. Clique em **Enviar solicitação de revisão**.
4. No portal, o cliente abre a entrega e escolhe **Aprovar marco** ou **Solicitar ajustes**. Ajustes exigem comentário. Funcionários consultam o histórico conforme suas permissões; não podem responder pelo cliente.
5. Após ajustes na entrega, edite o marco e solicite outra revisão. Pedidos e decisões anteriores permanecem no histórico. Aprovar não conclui automaticamente o marco nem o projeto.

O atalho do portal leva à seção de aprovações. Ele substitui a antiga ação “Aprovar projeto”, que apenas publicava um comentário. Links vindos das pendências e da Central de atenção abrem a revisão específica; **Ver todas as revisões** retorna ao histórico. Uma nova solicitação limpa o filtro da revisão anterior.

## Versões, permissões e integração

A aprovação corresponde a uma versão do **marco**, não de arquivos binários. Título, prazo, status e data de atualização identificam a versão. Projetos convertidos de propostas também podem usar seus marcos existentes. O registro preserva título, prazo, versão, instruções, solicitante, data, decisão, autor e comentário.

A janela mantém a versão selecionada e o cliente exibido enquanto a pessoa escreve. Mudanças no marco exigem aceitar explicitamente a versão atual; troca de cliente exige reabrir a solicitação e conferir o destinatário. Edições de marco enviam sua versão para evitar sobrescrever alterações simultâneas. Falhas preservam o texto digitado. A janela não fecha durante o salvamento.

Repetir o mesmo pedido com o mesmo texto retorna o registro existente. Texto diferente para a mesma versão gera conflito; não é descartado silenciosamente. A interface oferece abrir a revisão existente ou editar o marco antes de solicitar novamente. Respostas repetidas são idempotentes; outra resposta não sobrescreve uma decisão registrada.

Troca de cliente, alteração ou exclusão do marco torna pedidos pendentes anteriores indisponíveis. O novo cliente não recebe o histórico do anterior. Solicitações e respostas validam organização, projeto, acesso ao portal, papel, cliente e versão no servidor, sob transação e bloqueio de linhas. Pedidos e decisões alimentam a auditoria e as integrações existentes de pendências, atenção e automações. As consultas relacionadas são atualizadas após a operação.

## API e publicação

- `GET/POST /api/projects/:projectId/delivery-reviews`.
- `POST /api/projects/:projectId/delivery-reviews/:reviewId/decision`.
- `POST /api/projects/:projectId/milestones` e `PATCH /api/projects/:projectId/milestones/:milestoneId` para preparar a entrega.

Histórico paginado de 25 registros, com navegação somente quando necessária. O seletor apresenta os 200 marcos atualizados mais recentemente e avisa quando há outros. Assim, um marco recém-criado continua disponível mesmo em projetos grandes. Nenhuma nova migração é necessária; a funcionalidade usa `0007_delivery_reviews.sql`. Publicar backend antes do frontend. Em caso de reversão, manter os registros e decisões.

## Validação

Testes cobrem criação do marco seguida de solicitação, edição e nova versão, cliente sem portal, duplicidade com instruções diferentes, concorrência entre pedidos e respostas, troca de destinatário, versão desatualizada, exclusão de marco, isolamento entre organizações, rollback e projetos com mais de 200 marcos. A interface também verifica links para uma revisão, retorno ao histórico, atualização das filas, preservação de rascunhos após falha, comentários obrigatórios e ausência de ações sem permissão.
