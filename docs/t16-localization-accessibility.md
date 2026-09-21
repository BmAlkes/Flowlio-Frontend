# T16 — Localização e acessibilidade

Branches FE e BE: `feat/t16-localization-accessibility`.

## Onde conferir

- Configurações → idioma: português, espanhol, inglês e hebraico; depois abra projetos, tarefas e controle de tempo.
- Configurações → Segurança → 2FA: campos identificados, título e descrição acessíveis, erros associados ao campo e preenchimento automático adequado.
- Faturas → faturar horas registradas; detalhes das horas de uma fatura e listagem de faturas.
- Controle de tempo: datas e tempo relativo no idioma escolhido, com fuso explícito.

## Alterações

Preenchidas 75 chaves ausentes em português e hebraico e três em espanhol nos namespaces principais. Teste de paridade verifica presença e parâmetros de interpolação em common/settings/projects/tasks/clients/invoices/timeTracking e nas novas mensagens de faturamento. O fluxo de faturamento de horas agora possui traduções EN/PT/ES/HE.

Datas de calendário não mudam de dia com o fuso. Datas inválidas, como 29/02 em ano não bissexto, não são normalizadas silenciosamente para março. Instantes usam o fuso do navegador, explicitado nos fluxos alterados; horário relativo acompanha o idioma. A sincronização do fuso aceita UTC, diferencia sessões e permite nova tentativa após falha. Backend valida tipo e zona antes de gravar e não devolve mensagens internas de banco.

Valores usam formatação do idioma. Quando um contrato informa moeda, o formatador usa código ISO explícito; quando não informa, não inventa símbolo nem converte valores. A listagem e o faturamento de horas informam "Moeda não informada", pois o contrato legado de faturas não possui moeda. Esta etapa não migra valores históricos nem adiciona conversão cambial. PDFs e demais telas legadas não são declarados como um sistema completo de múltiplas moedas.

Diálogos recebem texto na cor semântica do tema, fechamento traduzido, foco e Escape preservados. Textos pequenos em azul e ação de faturamento usam tons da marca com maior contraste. Campos do 2FA têm label/id, autocomplete e identificação dos erros.

## Validação e limites

- Lint e 147 testes frontend aprovados; três testes específicos backend aprovados, incluindo entrada inválida e erro de armazenamento.
- Revisão local com chamadas externas bloqueadas e dados fictícios: desktop, 320 px, hebraico/RTL, tema escuro, foco dentro do diálogo e Escape. Sem overflow horizontal.
- Testes de datas incluem zonas opostas, ano bissexto, início/fim do horário de verão e validação de fuso.
- A paridade cobre os namespaces listados; não comprova tradução de todo texto legado escrito diretamente nos componentes nem substitui auditoria completa de acessibilidade por leitores de tela.
- Nenhuma migração de banco. Recuperação: reverter os commits de código preservando dados.
- Publicação: aguardando validação final de build e confirmação dos provedores.
