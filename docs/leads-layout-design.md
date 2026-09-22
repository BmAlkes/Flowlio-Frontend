# Refinamento de Leads e detalhes

## Direção visual

Manter a identidade azul do Flowlio, as fontes e a escala tipográfica existentes. A página organiza o trabalho comercial: alternar tabela/pipeline, localizar leads e acessar suas ações. O painel concentra identificação, qualificação e acompanhamento.

- Azul principal `#1797ba`, azul de ação `#11718c` e cabeçalho `#116b84`.
- Roxo `#8b65cf` identifica a área de estágio; âmbar `#d98c20` distingue qualificação. Fundos usam misturas discretas com os tokens do tema.
- Cabeçalho com identidade e criação; barra separada para visualizações e ferramentas.
- Tabela com cabeçalhos destacados, avatares e estágios delimitados; pipeline com faixas correspondentes às etapas e cartões com mais definição.
- Detalhes com cabeçalho fixo, cartão de identidade e seções visuais. Um único corpo rolável mantém campos personalizados e histórico acessíveis em telas pequenas.

## Compatibilidade e validação

Busca, filtros, exportação, etiquetas, campos personalizados, atribuição, conversão e hooks existentes foram mantidos. Os estilos dos componentes compartilhados são delimitados ao contexto de leads.

Novos textos disponíveis em português, inglês, espanhol e hebraico. Painel acompanha a direção RTL, inclui título acessível e abertura pelo teclado na tabela.

Validação local: lint sem avisos, build de produção e 185 testes aprovados. Revisão em Chrome com dados fictícios: tabela, pipeline, estado vazio, abertura por Enter, fechamento por Escape, atualização de temperatura, tema escuro/RTL e larguras de 1440, 390 e 320 px. Sem transbordamento da página; histórico acessível pela rolagem. A revisão simulada não realiza alterações em dados reais.
