# T23 — Primeiros passos e ativação

O checklist aparece no dashboard e no workspace do membro. Para reabrir, use a opção de reiniciar onboarding em **Configurações**. Reabrir não apaga etapas verificadas.

- Dono/gestor: cliente cadastrado, projeto acessível e entrega aprovada pelo cliente (T20).
- Membro com papel global `user`: tarefa atribuída concluída, horas concluídas no contexto da organização e foto de perfil. Os papéis de plataforma e cliente não recebem esse checklist.
- Conclusão vem dos registros do backend. Navegar para uma tela ou enviar manualmente o nome da etapa não basta: sem evidência, a API retorna `409 STEP_NOT_COMPLETE`.
- Progresso e preferência de ocultar separados por organização, usuário e papel. O cache frontend também usa o contexto da sessão. Evidências já observadas permanecem como marcos de ativação mesmo após a exclusão posterior de um registro.
- Nova tabela `onboarding_progress`, migração `0011_onboarding_progress.sql`. `user_onboarding` foi preservada, mas suas marcações antigas não são importadas como prova de conclusão. Isso pode reapresentar o checklist atualizado a usuários existentes.
- Métricas retornadas: quantidade concluída/total, início e ativação completa. Datas de etapas representam a primeira observação pelo checklist, não necessariamente a data original de criação do recurso. Evidências de cliente/projeto/entrega são do workspace acessível, não atribuição de autoria pessoal.
- API mantém `GET /api/onboarding`, `PATCH /step`, `/dismiss`, `/reset`. Reset apenas reabre; progresso verificado e métricas permanecem. Consulta atualiza as evidências; botão **Conferir progresso** atualiza explicitamente.

Interface com links reais, progresso acessível, controles por teclado, foco/Escape no diálogo e largura compatível com 320 px. Traduções EN/PT/ES/HE. Testes verificam cache entre organizações, ausência de conclusão por clique, teclado, falha ao ocultar, evidências reais, isolamento, concorrência e persistência de ativação.
