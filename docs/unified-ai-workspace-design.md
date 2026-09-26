# IA unificada e refinamento das páginas operacionais

## Escopo

Referência: imagem de Attention Center enviada pelo usuário, com confirmação de oito áreas: Central de atenção, Capacidade da equipe, Cenários, Pendências do cliente, Mudanças de escopo, Contratos mensais, Workflows e Auditoria.

O layout usa fundo azul claro `#f7faff`, superfícies brancas, títulos escuros, bordas suaves, ações `#11718c`, ícones `#079dc5` e sinais âmbar/rosa/violeta por significado. Preserva a tipografia Noto Sans Hebrew do produto, com títulos semibold, explicações menores e números tabulares. A assinatura é a combinação de cartões com ícones circulares, área operacional central e coluna lateral que explica os dados e as próximas ações.

Cabeçalhos e métricas usam os componentes compartilhados `workspace-page.tsx`, também presentes em algumas páginas anteriores. Tabelas largas têm rolagem própria; a coluna lateral passa para baixo em telas menores. Modo escuro, RTL, foco visível e movimento reduzido permanecem disponíveis. Números são calculados dos dados reais: indicadores limitados à página ou aos filtros informam esse alcance. Não foram introduzidos totais globais fictícios, tendências ou ações em massa sem suporte no servidor.

## Um acesso principal à IA

- O botão superior **Flowlio AI** abre Assistente/Ferramentas no mesmo painel. Atalhos contextuais preservam o registro selecionado. Rotas antigas redirecionam para esse painel.
- O componente flutuante `DashboardAIBot` foi removido. Cadastros assistidos, planejamento, resumo, relatórios semanais, análise de risco, conteúdo, upload, imagens e propostas foram preservados.
- Cadastro assistido valida a resposta do modelo e exige revisão antes da criação. A senha do cliente é preenchida na revisão, enviada somente ao endpoint de cadastro e excluída do histórico de conteúdo.
- Relatórios antigos deixam de depender de carregamento automático. Só são solicitados após clicar em gerar, sem repetição automática em caso de falha.
- Ferramentas pesadas são carregadas apenas ao abrir a aba correspondente.
- Clientes continuam excluídos do agente. Permissões e limites do servidor permanecem obrigatórios; nenhum endpoint novo foi criado nesta entrega.
- O histórico reúne links de acesso, mantendo execuções contextuais no servidor e conversas de conteúdo no navegador por usuário. Não há migração entre dispositivos.

## Guia de uso

O [guia funcional do Flowlio](guia-funcional-flowlio.md) cataloga funcionalidades, permissões, integrações, automações e o caminho completo de um cliente, do cadastro ao fechamento. O inventário diferencia entregas atuais de pendências, incluindo T11.

## Validação

- 76 testes em 10 suítes: oito áreas operacionais, agente contextual e ferramentas unificadas, incluindo renomeação e exclusão confirmada de conversas locais.
- Lint, TypeScript e build de produção.
- Navegador com dados simulados: oito áreas em 1440 px, 320 px e RTL/modo escuro; estados vazio/erro da Central de atenção; painel de IA e navegação das abas pelo teclado.
- Nenhum teste aciona provedor real de IA, envia mensagens, cobra clientes ou altera dados de produção.

Os scripts e capturas locais de revisão ficam fora do repositório. A publicação deve passar pelos checks do commit exato antes do avanço de `main`.
