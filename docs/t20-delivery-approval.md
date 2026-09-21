# T20 — Aprovação de entregas por marco

Onde usar: **Projetos → abrir projeto → Aprovações de entregas**. Proprietários e gestores solicitam revisão de um marco existente, com texto explicando o que revisar. O cliente responde no mesmo detalhe de projeto em `/clients/projects/view/:id`, aprovando ou solicitando ajustes. O pedido de ajustes exige comentário. Nenhum e-mail é enviado automaticamente nesta etapa.

Escopo escolhido: aprovação de uma versão do **marco**, não de arquivos binários. Título, prazo, status e data de atualização identificam a versão. Os marcos podem ser administrados no overview da ficha do cliente; projetos convertidos pela T18 também recebem os marcos revisados. O texto da solicitação é publicado explicitamente para o cliente do projeto.

O registro preserva título, prazo, versão, instruções, solicitante, data, decisão, autor e comentário. Uma decisão não altera o progresso do marco. Após ajustes, editar o marco permite nova solicitação; a decisão anterior permanece no histórico. Pedidos e respostas repetidos são idempotentes. Uma resposta diferente não sobrescreve uma decisão já registrada.

Troca do cliente do projeto ou alteração/exclusão do marco torna solicitações pendentes antigas indisponíveis. A decisão valida novamente a versão e o cliente sob transação e bloqueio de linhas. O novo cliente não recebe o histórico do cliente anterior. Servidor verifica organização, projeto privado, papel e cliente efetivamente vinculado, além da sessão.

API: `GET/POST /api/projects/:projectId/delivery-reviews`; `POST /api/projects/:projectId/delivery-reviews/:reviewId/decision`. Histórico paginado de 25 registros. O seletor apresenta até 200 marcos, com aviso quando há mais. Migração aditiva `0007_delivery_reviews.sql`. Recuperação: reverter o código mantendo os registros; não apagar decisões. Publicar backend antes do frontend.

Validação: concorrência entre pedidos/respostas, replay, conflito entre decisões, comentários obrigatórios, versão desatualizada, exclusão de marco, troca de cliente, isolamento e rollback. Interface verifica aprovação da versão exibida, obrigatoriedade do comentário, ausência de ações sem permissão e preservação do comentário em falhas.
