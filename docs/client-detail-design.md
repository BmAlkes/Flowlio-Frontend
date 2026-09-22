# Ficha do cliente — refinamento visual

Branch: `redesign/client-detail-presence`.
Localização: Dashboard → Clientes → abrir um cliente (`/dashboard/client-management/:clientId`).

## Direção

Manter a organização já aprovada e aumentar a presença visual. A ficha deve permitir ao gestor reconhecer o cliente, entender o trabalho em andamento e navegar entre projetos, tarefas, propostas e cobranças.

Paleta: azul Flowlio `#1797ba`, azul de identidade `#116b84`, azul de ação `#11718c`, verde `#229b72`, roxo `#8b65cf` e âmbar `#d98c20`. Fundo, bordas e texto usam os tokens claro/escuro existentes. Fontes e escala do sistema preservadas: títulos semibold, texto de apoio regular e números tabulares.

A assinatura visual é o painel azul da identidade do cliente. Os demais blocos usam cor por função, com superfícies suaves: projetos em azul, tarefas em verde, propostas em roxo e cobranças em âmbar. Evitou-se uma sequência de grandes painéis saturados para manter a leitura das informações.

## Entrega

- Identidade do cliente com avatar, nome, segmento e status em painel azul.
- Contatos com ícones destacados; acompanhamento e portal em blocos próprios.
- Abas com estado selecionado mais visível, preservando URL e navegação por teclado.
- Indicadores independentes, com ícones e cores correspondentes às áreas.
- Cabeçalhos de seção com ícones, fundo contextual e ações preservadas.
- Progresso, marcos, cobrança e histórico com melhor contraste e hierarquia.
- Ajustes responsivos para métricas, identidade, abas e cabeçalhos.

Sem mudança de endpoints, permissões, cálculos ou dados. Indicadores continuam derivados das consultas existentes; erro/carregamento não é convertido em zero. Nenhuma funcionalidade T26–T33 foi incluída.

## Verificação

Lint, TypeScript, build e 185 testes aprovados. Revisão de navegador em 1600/1280/1024/768/390/320 px, tema escuro e hebraico/RTL, sem erro JavaScript ou overflow horizontal. Navegação dos quatro indicadores para suas abas e estados vazio/erro/carregamento conferidos. A revisão visual utiliza dados fictícios e APIs simuladas, não uma sessão autenticada em produção. Permanecem os avisos preexistentes do build sobre Gantt e tamanho do chunk PDF.
