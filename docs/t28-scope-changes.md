# T28A/B — Solicitações extras e mudanças de escopo

Implementação de 24/09/2026, branches `feat/t28-change-requests` no frontend e backend. Em validação para publicação.

## Onde usar

- Projeto → Ferramentas → Mudanças de escopo: `/dashboard/project/view/:id/changes`.
- Portal → abrir projeto → Mudanças de escopo: `/clients/projects/view/:id/changes`.
- Proprietários/gestores e o cliente vinculado podem solicitar mudanças. Estimativas e aplicação exigem o mesmo acesso financeiro usado nos custos internos; gestores sem esse acesso não recebem preço/moeda.
- O cliente do projeto aprova ou recusa a versão exibida. Equipe não aprova em nome do cliente.

## Fluxo

Solicitado → em análise → aguardando aprovação → aprovado/recusado → aplicado. Cancelamento exige motivo. Recusa pode receber uma nova estimativa. Revisar uma estimativa aprovada, antes da aplicação, cria outra versão e exige novo aceite.

Pedido com título, descrição e até cinco arquivos, enviados pelo upload já existente na Central de mídia. O servidor aceita somente IDs de arquivos do mesmo projeto e cliente, sem vínculo com tarefa privada. O pedido guarda a versão de arquivo selecionada. Remover um anexo do formulário não exclui o upload da Central de mídia.

Quando houver conversão de proposta para esse projeto e a proposta pertencer ao cliente atual, o pedido guarda a referência original, título e versão da conversão. Não copia texto privado completo da proposta.

Estimativa versionada: incluído/adicional, horas, valor, moeda ISO explícita, prazo opcional e descrição comercial. Trabalho incluído deve ter valor zero. Valores decimais não são somados por ponto flutuante. Prazo é uma data UTC; deixar vazio significa não propor alteração.

## Aplicação e cobrança

O responsável escolhe os efeitos e confirma: criar tarefa privada com as horas aprovadas; aplicar o prazo; preparar rascunho de cobrança adicional. O registro original de orçamento não é sobrescrito. Pedido e versões guardam o aditivo separadamente.

O rascunho comercial fica persistido no pedido com ID, valor, moeda, cliente, projeto e versão aprovada. É consultável por quem tem acesso financeiro. **Não é uma fatura emitida e não entra no módulo de faturas automaticamente.** O modelo atual de faturas não possui moeda própria; emitir ali automaticamente perderia a moeda aprovada. A emissão segue o processo de cobrança da equipe após revisão. Não há chamada a PayPal, e-mail ou cobrança externa na T28.

Aplicação registra o ID da tarefa criada, prazo aplicado e rascunho. Repetir as mesmas opções retorna o resultado existente; mudar opções depois da aplicação é rejeitado. Não recria tarefa removida nem cobra novamente.

## Garantias e limites

- Organização, visibilidade do projeto e vínculo atual do cliente verificados no servidor. Novo cliente não recebe pedidos do cliente anterior.
- Escritas serializadas por projeto e pedido; vínculo do cliente bloqueado durante a operação. Revisão e aprovação concorrentes não aprovam a versão substituta.
- Prazo oficial alterado após a estimativa exige revisão antes de aplicar o prazo; pode-se aplicar apenas os outros efeitos selecionados. Estimativas aprovadas podem ser revistas, exigindo novo aceite.
- Estimativas e decisões concluídas são imutáveis no banco. Nenhuma API de exclusão; excluir o projeto remove seus pedidos/versões por cascata, mas os eventos da auditoria são preservados.
- Estado, criação de tarefa, alteração de prazo, rascunho e auditoria na mesma transação. Falha na auditoria reverte a aplicação inteira.
- Lista de dez pedidos e histórico paginado de dez versões. Sem carregamento integral da organização.
- Auditoria T26B inclui o novo recurso; preço/moeda são mascarados no servidor para gestores sem acesso financeiro. Descrições e anexos completos não são copiados para a auditoria.
- Migração aditiva `0014_scope_changes`, com snapshot, journal e verificação de trigger no startup. Publicar backend antes do frontend; correção adiante sem reescrever migrações publicadas.

## Validação

- PostgreSQL: fluxo completo, idempotência, versão obsoleta, revisão/aceite concorrentes, cliente/organização/projeto privado, acesso financeiro, substituição de cliente, conflito de prazo, preço zero, cancelamento, anexos, revisão após aprovação, auditoria, paginação, trigger desativado e rollback.
- Frontend: aprovação com confirmação/versão, aplicação seletiva, estimativa com moeda, upload, erro de versão, troca de cliente, falha de consulta e acesso negado.
- Chrome com dados fictícios: desktop 1440 px, mobile 390/320 px, popup de aplicação, teclado, HE/RTL/escuro, aprovação pelo portal, vazio e erro; sem overflow nem erros JavaScript.
- EN/PT/ES/HE. Backend: 333 testes aprovados, incluindo 16 cenários da T28, lint e build. Frontend: 16 testes direcionados aprovados (oito da T28), lint e build. Checks remotos e publicação em andamento.
