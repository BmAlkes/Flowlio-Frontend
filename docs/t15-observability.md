# T15 — Histórico operacional

Branches FE e BE: `feat/t15-observability`.

## Onde consultar

- Organização: Configurações → Histórico operacional (`/dashboard/settings/operations`), para proprietários, gestores e administradores autorizados.
- Superadmin: Configurações → Histórico operacional (`/superadmin/operations`), visão global.

### Correção de navegação (21/09/2026)

O domínio de produção já servia a tela e as rotas da T15, mas faltava o item no menu lateral. O dashboard agora inclui **Configurações → Histórico operacional** no submenu de proprietários e gestores. No superadmin, **Histórico operacional** aparece junto de Configurações, apenas para o papel superadmin. As duas páginas de configurações também oferecem um acesso destacado abaixo do título, com permissões alinhadas às rotas.
- Falhas de interface capturadas pelo ErrorBoundary exibem uma referência quando o registro é confirmado pelo servidor.

## Comportamento

Falhas de API, interface autenticada e jobs são persistidas com código, referência, versão e origem. O servidor resolve a organização pela sessão. Proprietários não podem ampliar a consulta para outras organizações. Relatórios da interface não aceitam mensagens de exceção, conteúdo de formulários, URLs completas ou campos extras.

O painel mostra os últimos 100 eventos das últimas 24 horas. Contadores de API/jobs são agregados por hora e gravados a cada cinco segundos; a janela inclui a hora atual e as 23 anteriores. Cinco falhas ou duração máxima de dez segundos geram um aviso no painel. Não há envio externo de alertas nesta etapa. Os horários dos eventos usam o fuso do navegador, identificado no texto da interface.

Logs recebem referência e versão, com ocultação de campos sensíveis e e-mails. O log HTTP deixa de incluir URLs. Essa ocultação não representa uma classificação completa de qualquer texto arbitrário legado. Eventos estruturados usam uma lista explícita de campos permitidos.

## Limites operacionais

Métricas são diagnósticas, não contábeis: o buffer é limitado e pode perder amostras em encerramento abrupto ou indisponibilidade prolongada. Falha de armazenamento não interrompe operações de negócio. Eventos de interface anônima não são persistidos. Jobs sem organização explícita e chamadas sem contexto de organização aparecem somente na visão global. A limpeza de registros com mais de 30 dias roda no worker, por lotes.

## Migração e recuperação

`0004_observability.sql` adiciona duas tabelas e índices; não altera registros existentes. Backend antigo permanece compatível. Em caso de rollback do código, manter as tabelas aditivas. Não executar rollback destrutivo do banco. A branch T11 adiada precisará regenerar sua migração contra a main antes de qualquer integração futura.

## Validação

- Frontend: lint aprovado, 138 testes aprovados; revisão visual local com dados fictícios em desktop, 320 px, tema escuro e RTL, sem overflow horizontal; navegação por Tab alcança os controles.
- Backend: 162 testes aprovados na suíte completa, seis suítes opcionais de outros bancos não configuradas; teste adicional dos alertas executado separadamente.
- Integração PostgreSQL dedicada cobre migração, isolamento entre organizações, permissões, ingestão, limites, falha HTTP, falha de job, persistência e retenção.
- Publicação confirmada: Railway `278b84d` e Cloudflare `1fee22f`, ambos com sucesso em 20/09/2026.
