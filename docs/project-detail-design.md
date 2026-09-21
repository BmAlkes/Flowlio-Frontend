# Refinamento da página do projeto — T25

Branch: `redesign/project-detail-refinement`. Rota: `/dashboard/project/view/:id`.

## Direção visual

Público: gestores e responsáveis por projetos. Objetivo: entender o contexto e o andamento, acessar decisões de entrega e agir sobre o projeto.

Paleta preservada: azul Flowlio `#1797ba`, azul `#2563eb`, verde `#16a34a`, roxo `#9333ea` e laranja `#ea580c`. Ações primárias usam `#11718c` para contraste. Superfícies, texto e bordas seguem tokens existentes de tema. Tipografia herdada do sistema; título com peso semibold, rótulos discretos e valores percentuais tabulares.

Estrutura escolhida: cabeçalho de identificação com ações, faixa de progresso e duas colunas no desktop. Informações, entregas, contrato e despesas na principal; acompanhamento, cliente, ferramentas e PDF na lateral. Em telas menores, os blocos seguem fluxo vertical.

Alternativa descartada: manter grandes faixas saturadas em todos os painéis. Elas competiam com o nome do projeto e com as ações. As cores passam a identificar seções através de fundos suaves e ícones. A faixa superior azul/roxa e o progresso contínuo conectam visualmente o resumo do projeto.

## Alterações

- Cabeçalho com número, nome, status traduzido, cliente e visibilidade. Editar e comentar ficam no topo; contrato disponível quando existe.
- Voltar usa botão acessível. Breadcrumb trunca nomes longos sem empurrar a tela.
- Progresso publicado separado dos campos de edição. Status/progresso e salvar agrupados na lateral, com rótulos associados aos controles.
- Cartões com bordas e sombras leves; menos fundos e caixas sobrepostas. Descrição preserva quebras de linha.
- Aprovação de entregas aparece antes da prévia de contrato. A toolbar quebra em várias linhas em telas estreitas.
- Cliente, modelo, rentabilidade e PDF têm blocos compactos. Acesso financeiro mantém a política existente.
- Painel de despesas acompanha a composição visual e empilha os indicadores no celular. Sem alteração de cálculos.
- Novos rótulos de interface em EN/PT/ES/HE. Corrigida a chave ausente de campos personalizados. Tradução integral de textos legados de modais/despesas não faz parte desta entrega.
- Nenhum endpoint, job ou migração novo. As oito funcionalidades T26–T33 permanecem apenas no plano.

## Validação

- Suíte geral: 185 testes passaram após a reorganização principal.
- Revisão visual com dados fictícios: desktop, 1024/768/390/320 px, tema escuro e hebraico/RTL. Sem erro JavaScript ou overflow horizontal na rodada final, incluindo documentos presentes e ausentes.
- O teste visual usa a página real, hooks/API simulados e um documento fictício na prévia. Não é teste autenticado em produção, nem valida entrega/download real de PDF por um provedor.
- Lint sem avisos, TypeScript e build de produção finais aprovados. Quatro testes focados passaram após os ajustes finais; os novos rótulos têm chaves completas em EN/PT/ES/HE. Permanecem os avisos preexistentes do build sobre Gantt e tamanho do chunk PDF.
- Publicação solicitada pelo usuário após a validação: integrar na `main`, fazer push e confirmar CI/Cloudflare e versão servida, conforme o runbook de release.

Plano completo: [evolução do produto](plano-evolucao-produto.md).
