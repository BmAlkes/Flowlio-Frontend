# T24 — Documentação operacional

- README do frontend substitui o template Vite por instalação, configuração pública, comandos de validação, mapa do código e localização das features.
- README do backend documenta configuração validada pelo código, processo HTTP/worker, migrações, banco de teste, CI e deploy.
- [Release e recuperação](release-and-recovery.md) explica a sequência backend/frontend, confirmação da versão real, referências de erro, notificações do GitHub e limites de rollback.
- `Flowlio-Backend/docs/core-operations.md` reúne papéis, invariantes do core, faturamento, jobs, consulta operacional e recuperação. Complementa os guias existentes de contratos, módulos, migrações e fila persistente.
- Links locais dos novos documentos conferidos. Comandos e caminhos comparados com `package.json`, rotas, configuração de ambiente e workflow do CI. Não foram realizados restore de produção ou cobranças reais para validar documentação.

Onde conferir: `README.md` e `docs/` dos dois repositórios no GitHub. Esta tarefa não cria uma tela adicional na aplicação.
