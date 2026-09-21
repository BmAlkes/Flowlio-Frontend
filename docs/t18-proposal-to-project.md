# T18 — Proposta para projeto

Em **Financeiro → Propostas** (`/dashboard/proposals`), propostas aprovadas oferecem **Criar projeto**. A revisão permite escolher um template autorizado, ajustar nome, número, descrição, tarefas, horas estimadas e marcos. Trocar o template reinicia os ajustes. Proprietários podem informar o orçamento; gestores não recebem o orçamento da proposta nesta operação.

O projeto mantém o cliente da proposta e começa privado, com status pendente. Tarefas começam privadas e a fazer; marcos começam pendentes. Nenhum pagamento é criado. Valores com moeda escrita não são convertidos automaticamente em números. Projetos legados não possuem moeda no contrato de orçamento.

Backend: `GET /api/proposals/:id/project-preview` e `POST /api/proposals/:id/project`. Ambos exigem acesso administrativo à organização e recurso de propostas no plano. A revisão tem versão verificável; mudanças na proposta ou nas tarefas do template exigem nova revisão. Criação, tarefas, marcos, vínculo e atividade são uma transação. Repetições retornam o projeto existente, respeitando acesso a projetos privados. A exclusão do projeto mantém um registro que impede sua recriação acidental.

Migração aditiva `0005_proposal_to_project.sql`: tabela de rastreabilidade com referências anuláveis à proposta e ao projeto. Publicar backend antes do frontend. Recuperação: reverter o código e manter a tabela; não excluir vínculos existentes. A T11 continua fora desta entrega e sua antiga migração precisará ser regenerada quando retomada.

Limites: 100 tarefas e 30 marcos por conversão. Limites do plano são verificados dentro da transação; conversões da mesma organização são serializadas. O criador legado de projetos não compartilha essa trava, portanto não se afirma exclusão global de concorrência de cotas com todos os outros fluxos.

Validação: testes PostgreSQL de concorrência, rollback, isolamento, orçamento restrito, versão desatualizada, cotas e projeto excluído; testes de interface cobrem revisão, criação, acesso ao projeto existente, falha recuperável e templates.
