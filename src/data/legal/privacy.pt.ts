import type { LegalDoc } from "@/components/legal/LegalDocument";
import { LEGAL, legalContact, legalVersionLabel } from "@/configs/legal.config";

export const privacyPt: LegalDoc = {
  title: "Política de Privacidade",
  updated: `Última atualização: ${legalVersionLabel("pt")}`,
  intro: [
    `Esta Política explica como a ${LEGAL.productName} trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018, "LGPD"), o Marco Civil da Internet (Lei nº 12.965/2014) e demais normas aplicáveis. Ela vale para o site, a plataforma, o portal do cliente, o assistente de IA (Lio) e as integrações.`,
  ],
  sections: [
    {
      title: "1. Quem somos (controlador)",
      body: [
        `A ${LEGAL.productName} é um produto da ${LEGAL.companyName} ("Flowlio", "nós"), que é a controladora dos dados descritos nesta Política.`,
        `Canal do Encarregado pelo tratamento de dados pessoais: ${legalContact("pt")}. Como agente de tratamento de pequeno porte, mantemos este canal de comunicação com os titulares nos termos da Resolução CD/ANPD nº 2/2022.`,
      ],
    },
    {
      title: "2. Nosso papel: controlador e operador",
      body: [
        "Somos controladores dos dados das pessoas que criam conta e assinam a Flowlio (nome, e-mail, dados de cobrança, uso da plataforma) e dos visitantes do site.",
        "Quando uma empresa cliente (\"Organização\") cadastra na Flowlio os dados dos seus próprios clientes, leads, contatos e colaboradores — inclusive leads recebidos por webhook, mensagens, propostas e faturas — a Organização é a controladora desses dados e a Flowlio atua como operadora, tratando-os apenas conforme as instruções da Organização e os Termos de Uso. Se você é cliente ou lead de uma Organização, dirija seus pedidos primeiro a ela; nós a ajudaremos a atendê-lo.",
      ],
    },
    {
      title: "3. Dados que coletamos",
      subsections: [
        {
          title: "3.1 Fornecidos por você",
          bullets: [
            "Cadastro: nome, e-mail, senha (armazenada apenas como hash), telefone, endereço, cargo, foto de perfil, fuso horário e idioma.",
            "Organização: nome da empresa, site, segmento, tamanho e dados de faturamento.",
            "Conteúdo que você inclui na plataforma: projetos, tarefas, comentários, arquivos, apontamento de horas, propostas, faturas, chamados de suporte e mensagens.",
            "Dados de terceiros inseridos por você ou pela sua Organização (clientes e leads): nome, e-mail, telefone, CPF/CNPJ, endereço, empresa, notas e histórico de interações.",
            "Assistente de IA e WhatsApp: as perguntas, comandos de texto ou voz e anexos que você envia ao Lio, e o número de WhatsApp que você vincular.",
          ],
        },
        {
          title: "3.2 Coletados automaticamente",
          bullets: [
            "Registros de acesso: endereço IP, data e hora, navegador e dispositivo (obrigatórios pelo Marco Civil da Internet).",
            "Registros técnicos de erro sem dados pessoais (código do erro, área da tela e versão do app).",
            "Cookies e tecnologias similares, conforme a seção 9.",
          ],
        },
        {
          title: "3.3 Recebidos de integrações que você ativa",
          bullets: [
            "Google Agenda: eventos, horários, descrições e participantes dos calendários que você conectar, com permissão de leitura e escrita. Usamos esses dados apenas para sincronizar sua agenda com a Flowlio; não os usamos para publicidade, não os vendemos e não os usamos para treinar modelos de IA.",
            "O uso e a transferência, para qualquer outro aplicativo, de informações recebidas das APIs do Google seguem a Política de Dados do Usuário dos Serviços de API do Google (Google API Services User Data Policy), incluindo os requisitos de Uso Limitado (Limited Use).",
            "Pagamentos: confirmação e status das transações informados pelo processador de pagamento. Não armazenamos números de cartão.",
          ],
        },
      ],
    },
    {
      title: "4. Finalidades e bases legais",
      table: {
        head: ["Finalidade", "Base legal (LGPD art. 7º)"],
        rows: [
          ["Criar e manter sua conta e prestar o serviço contratado", "Execução de contrato (inc. V)"],
          ["Cobrança, emissão de notas e obrigações fiscais", "Execução de contrato e cumprimento de obrigação legal (inc. II e V)"],
          ["Guardar registros de acesso por 6 meses", "Cumprimento de obrigação legal — Marco Civil, art. 15 (inc. II)"],
          ["Segurança, prevenção a fraudes, autenticação em dois fatores e limite de requisições", "Legítimo interesse (inc. IX) e proteção ao crédito/prevenção à fraude (art. 11, II, g, quando aplicável)"],
          ["E-mails transacionais e automações (lembretes, alertas, notificações)", "Execução de contrato (inc. V)"],
          ["Assistente de IA, transcrição de voz e WhatsApp", "Execução de contrato, quando você ativa o recurso (inc. V)"],
          ["Sincronização com o Google Agenda", "Consentimento, ao conectar a conta Google (inc. I)"],
          ["Newsletter e comunicações de marketing", "Consentimento (inc. I), revogável a qualquer momento"],
          ["Cookies de marketing (Meta Pixel)", "Consentimento (inc. I), pelo banner de cookies"],
          ["Melhoria do produto e estatísticas agregadas", "Legítimo interesse (inc. IX)"],
          ["Defesa em processos judiciais, administrativos ou arbitrais", "Exercício regular de direitos (inc. VI)"],
        ],
      },
    },
    {
      title: "5. Inteligência artificial e decisões automatizadas",
      body: [
        "O assistente Lio usa modelos de linguagem da OpenAI para responder perguntas, resumir informações, sugerir ações e transcrever áudios. Para isso, enviamos ao provedor apenas o conteúdo necessário para cada pedido (sua pergunta e os registros da sua Organização relevantes para ela). Pela política do provedor para uso via API, esses dados não são usados para treinar os modelos.",
        "Ações sugeridas pela IA (criar tarefas, mover eventos, enviar mensagens) só são executadas após sua revisão e confirmação. Indicadores calculados automaticamente (risco de projeto, prioridade de leads, alertas) são auxiliares e não produzem decisões que afetem direitos sem intervenção humana. Você pode pedir a revisão de qualquer decisão tomada unicamente com base em tratamento automatizado (LGPD art. 20) pelo canal do Encarregado.",
      ],
    },
    {
      title: "6. Com quem compartilhamos",
      body: [
        "Não vendemos dados pessoais. Compartilhamos dados somente com fornecedores que nos ajudam a prestar o serviço (operadores), sob contrato e obrigação de confidencialidade e segurança:",
      ],
      table: {
        head: ["Fornecedor", "Finalidade", "Local"],
        rows: [
          ["Railway", "Hospedagem da aplicação e do banco de dados", "EUA"],
          ["Cloudinary", "Armazenamento de arquivos e imagens", "EUA"],
          ["Brevo", "Envio de e-mails transacionais e newsletter", "União Europeia"],
          ["OpenAI", "Assistente de IA e transcrição de áudio", "EUA"],
          ["Google", "Integração com Google Agenda (quando conectada)", "EUA"],
          ["Meta (WhatsApp Cloud API e Meta Pixel)", "Lio no WhatsApp (quando vinculado) e medição de anúncios (com consentimento)", "EUA"],
          ["PayPal", "Processamento de pagamentos de assinatura", "EUA"],
          ["Sentry", "Monitoramento de erros (sem e-mails, tokens ou conteúdo)", "EUA"],
          ["Serviços de push do navegador (Google, Mozilla, Apple)", "Notificações push, quando ativadas", "EUA"],
        ],
      },
      bullets: [
        "Integrações configuradas pela própria Organização (por exemplo, webhook do Slack ou links de pagamento de terceiros) recebem os dados que a Organização escolher enviar.",
        "Autoridades públicas, quando houver obrigação legal ou ordem judicial.",
        "Em caso de fusão, aquisição ou reorganização societária, com a mesma proteção desta Política.",
      ],
    },
    {
      title: "7. Transferência internacional",
      body: [
        "Como vários fornecedores estão fora do Brasil, seus dados podem ser transferidos para outros países, principalmente os EUA e a União Europeia. Essas transferências se apoiam no art. 33 da LGPD e na Resolução CD/ANPD nº 19/2024, por meio de cláusulas contratuais com os fornecedores e da necessidade para executar o contrato com você.",
      ],
    },
    {
      title: "8. Por quanto tempo guardamos",
      table: {
        head: ["Dado", "Prazo"],
        rows: [
          ["Conta e conteúdo da Organização", "Enquanto a conta estiver ativa; após o encerramento, ficam disponíveis por até 90 dias para reativação ou exportação e depois são excluídos ou anonimizados, salvo obrigação legal"],
          ["Registros de acesso (IP, data e hora)", "6 meses (Marco Civil, art. 15)"],
          ["Dados fiscais e de cobrança", "5 anos (legislação tributária)"],
          ["Conversas com o assistente de IA", "180 dias"],
          ["Arquivos enviados ao assistente de IA", "Excluídos após o processamento (no máximo 24 horas)"],
          ["Dados brutos recebidos por webhook de leads", "90 dias (o lead criado segue as regras da Organização)"],
          ["Notificações no app", "12 meses"],
          ["IP e navegador nos registros de auditoria", "12 meses (depois o registro é anonimizado)"],
          ["Monitoramento técnico de erros", "30 dias"],
          ["Registro dos pedidos de titulares (seção 10)", "5 anos, para comprovar o atendimento"],
        ],
      },
    },
    {
      title: "9. Cookies",
      body: [
        "Usamos cookies necessários (login, sessão e segurança, sempre ativos) e, somente com seu consentimento, cookies de marketing (Meta Pixel). O Meta Pixel não é carregado até você aceitar. Você pode mudar sua escolha a qualquer momento em \"Configurações de cookies\", no rodapé do site.",
      ],
      table: {
        head: ["Categoria", "Finalidade", "Fornecedor", "Pode desativar?"],
        rows: [
          ["Necessários", "Manter você conectado, lembrar a sessão e proteger contra fraudes", "Flowlio", "Não — essenciais ao funcionamento"],
          ["Análise", "Entender o uso do site para melhorá-lo (hoje não usamos ferramentas de terceiros)", "Flowlio", "Sim"],
          ["Marketing", "Medir o desempenho dos nossos anúncios", "Meta (Facebook) Pixel", "Sim"],
        ],
      },
      links: [{ label: "Política de Privacidade da Meta", href: "https://www.facebook.com/privacy/policy/" }, { label: "Google API Services User Data Policy", href: "https://developers.google.com/terms/api-services-user-data-policy" }],
    },
    {
      title: "10. Seus direitos (LGPD art. 18)",
      bullets: [
        "Confirmação de que tratamos seus dados e acesso a eles.",
        "Correção de dados incompletos, inexatos ou desatualizados (você pode editar seu perfil em Configurações).",
        "Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade.",
        "Portabilidade: em Configurações > Privacidade e dados, baixe uma cópia dos seus dados em formato JSON.",
        "Eliminação dos dados tratados com base no consentimento e exclusão da conta: em Configurações > Privacidade e dados.",
        "Informação sobre com quem compartilhamos seus dados (seção 6) e sobre a possibilidade de não consentir e suas consequências.",
        "Revogação do consentimento (newsletter, cookies de marketing, Google Agenda) a qualquer momento.",
        "Oposição a tratamentos baseados em legítimo interesse e revisão de decisões automatizadas (art. 20).",
        "Petição à Autoridade Nacional de Proteção de Dados (ANPD) — www.gov.br/anpd.",
      ],
      body: [
        `Para exercer qualquer direito, use as opções em Configurações ou fale conosco: ${legalContact("pt")}. Respondemos em até 15 dias (art. 19). Podemos pedir informações para confirmar sua identidade. Quando você exclui a conta, removemos ou anonimizamos seus dados pessoais; guardamos apenas o que a lei exige (como registros de acesso por 6 meses e dados fiscais). Se você é dono de uma Organização, a exclusão encerra a Organização e é concluída em até 15 dias.`,
      ],
    },
    {
      title: "11. Segurança",
      body: [
        "Adotamos medidas técnicas e administrativas para proteger os dados (LGPD art. 46): criptografia em trânsito (HTTPS), senhas armazenadas com hash, tokens de integração criptografados no banco, autenticação em dois fatores, cookies seguros, controle de acesso por função e por Organização, limite de requisições, registros de auditoria e remoção de dados pessoais dos logs técnicos.",
        "Se ocorrer um incidente de segurança que possa causar risco ou dano relevante, comunicaremos a ANPD e os titulares afetados no prazo da Resolução CD/ANPD nº 15/2024 (3 dias úteis).",
      ],
    },
    {
      title: "12. Crianças e adolescentes",
      body: [
        "A Flowlio é uma ferramenta profissional destinada a maiores de 18 anos. Não coletamos intencionalmente dados de crianças e adolescentes. Se identificarmos esse tipo de dado sem o consentimento exigido pelo art. 14 da LGPD, ele será excluído.",
      ],
    },
    {
      title: "13. Alterações desta Política",
      body: [
        "Podemos atualizar esta Política. A data no topo indica a versão vigente. Em mudanças relevantes, avisaremos por e-mail ou na plataforma antes de elas entrarem em vigor e, quando necessário, pediremos novo consentimento.",
      ],
    },
    {
      title: "14. Contato",
      body: [
        `${LEGAL.companyName} — privacidade e proteção de dados: ${legalContact("pt")}`,
        `Suporte geral: ${LEGAL.supportEmail}`,
      ],
    },
  ],
};
