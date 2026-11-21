import type { LegalDoc } from "@/components/legal/LegalDocument";
import { LEGAL, legalVersionLabel } from "@/configs/legal.config";

export const termsPt: LegalDoc = {
  title: "Termos de Uso",
  updated: `Última atualização: ${legalVersionLabel("pt")}`,
  intro: [
    `Estes Termos regem o uso da plataforma ${LEGAL.productName} ("Serviço"), operada por ${LEGAL.companyName}, CNPJ ${LEGAL.cnpj} ("Flowlio", "nós"). Ao criar uma conta ou usar o Serviço, você declara ter lido e aceito estes Termos e a Política de Privacidade.`,
  ],
  sections: [
    {
      title: "1. O Serviço",
      bullets: [
        "Gestão de projetos, tarefas e equipes",
        "CRM de clientes e leads, propostas, faturas e links de pagamento",
        "Apontamento de horas, relatórios e automações",
        "Integração com Google Agenda, WhatsApp e outras ferramentas",
        "Assistente de inteligência artificial (Lio)",
      ],
    },
    {
      title: "2. Conta",
      body: [
        "Você deve ter 18 anos ou mais e fornecer informações verdadeiras. É responsável por manter suas credenciais em sigilo e por todas as atividades na sua conta. Avise-nos imediatamente sobre qualquer uso não autorizado.",
        "O titular da assinatura (dono da Organização) responde pelos usuários que convidar e pelas permissões que conceder.",
      ],
    },
    {
      title: "3. Uso aceitável",
      body: ["Você não pode:"],
      bullets: [
        "Usar o Serviço para fins ilegais ou para enviar spam, assediar ou enganar pessoas",
        "Inserir dados pessoais sem base legal para isso, ou dados sensíveis que não sejam necessários",
        "Violar direitos de propriedade intelectual de terceiros",
        "Enviar código malicioso, tentar acessar sistemas sem autorização ou prejudicar o funcionamento do Serviço",
      ],
    },
    {
      title: "4. Proteção de dados pessoais (acordo de tratamento)",
      body: [
        "Em relação aos dados pessoais que a Organização inserir no Serviço sobre seus clientes, leads, contatos e colaboradores, a Organização é a controladora e a Flowlio é a operadora (LGPD art. 5º, VI e VII). Esta seção constitui o acordo de tratamento de dados entre as partes.",
      ],
      subsections: [
        {
          title: "4.1 Obrigações da Organização (controladora)",
          bullets: [
            "Ter base legal para cada dado que inserir e informar os titulares sobre o tratamento.",
            "Atender aos pedidos dos seus titulares (acesso, correção, exclusão) — o Serviço oferece ferramentas para editar, exportar e excluir registros.",
            "Configurar permissões, integrações e webhooks de forma adequada e não inserir dados sensíveis sem necessidade.",
          ],
        },
        {
          title: "4.2 Obrigações da Flowlio (operadora)",
          bullets: [
            "Tratar os dados apenas para prestar o Serviço e conforme as instruções da Organização (LGPD art. 39).",
            "Manter medidas de segurança técnicas e administrativas adequadas (art. 46) e confidencialidade das pessoas autorizadas a tratar os dados.",
            "Usar apenas os suboperadores listados na Política de Privacidade, com obrigações equivalentes, e informar mudanças relevantes nessa lista.",
            "Comunicar a Organização sem demora injustificada sobre incidentes de segurança que afetem seus dados, com as informações necessárias para que ela cumpra suas obrigações perante a ANPD e os titulares.",
            "Auxiliar a Organização no atendimento aos direitos dos titulares e em relatórios de impacto, na medida do razoável.",
            "Ao fim do contrato, disponibilizar a exportação dos dados por até 90 dias e, depois, excluí-los ou anonimizá-los, salvo obrigação legal de guarda.",
          ],
        },
        {
          title: "4.3 Inteligência artificial",
          body: [
            "Ao usar o assistente de IA, os dados necessários ao pedido são enviados ao provedor de IA indicado na Política de Privacidade, apenas para gerar a resposta. As sugestões da IA podem conter erros: revise antes de confirmar qualquer ação.",
          ],
        },
      ],
    },
    {
      title: "5. Integrações de terceiros",
      body: [
        "Ao conectar Google Agenda, WhatsApp, Slack, processadores de pagamento ou outras integrações, você autoriza a troca de dados necessária e aceita os termos desses serviços. Você pode desconectar a qualquer momento. Não respondemos por mudanças ou falhas em serviços de terceiros.",
      ],
    },
    {
      title: "6. Assinatura e pagamento",
      bullets: [
        "Os planos são cobrados antecipadamente, de forma mensal ou anual, conforme a página de preços.",
        "Preços podem mudar com aviso prévio de 30 dias.",
        "A falta de pagamento pode levar à suspensão do Serviço, com aviso prévio.",
        "Você pode cancelar a qualquer momento; o cancelamento vale ao fim do período já pago.",
        "Se você contratar como consumidor (pessoa física), poderá desistir em até 7 dias da contratação, com reembolso integral (Código de Defesa do Consumidor, art. 49).",
      ],
    },
    {
      title: "7. Propriedade intelectual",
      body: [
        "O Serviço, sua marca e seu software pertencem à Flowlio. Você mantém a propriedade de todo o conteúdo que inserir e nos concede licença limitada para armazená-lo e processá-lo apenas para prestar o Serviço.",
      ],
    },
    {
      title: "8. Disponibilidade",
      body: [
        "Buscamos manter o Serviço disponível, mas não garantimos funcionamento ininterrupto. Manutenções programadas serão avisadas sempre que possível.",
      ],
    },
    {
      title: "9. Responsabilidade",
      body: [
        "Na extensão permitida pela lei, a Flowlio não responde por danos indiretos, lucros cessantes ou perda de dados causada por uso inadequado, falhas de terceiros ou caso fortuito. Nada nestes Termos limita direitos garantidos ao consumidor pelo Código de Defesa do Consumidor ou a responsabilidade prevista na LGPD.",
      ],
    },
    {
      title: "10. Suspensão e encerramento",
      body: [
        "Podemos suspender ou encerrar contas que violem estes Termos ou a lei, com aviso prévio sempre que possível. Em casos graves (fraude, risco à segurança ou ordem legal) a suspensão pode ser imediata.",
        "Após o encerramento, os dados da Organização ficam disponíveis para exportação por até 90 dias e depois são excluídos ou anonimizados, conforme a Política de Privacidade. Valores devidos continuam exigíveis.",
      ],
    },
    {
      title: "11. Alterações",
      body: [
        "Podemos alterar estes Termos. Mudanças relevantes serão avisadas por e-mail ou na plataforma com antecedência mínima de 15 dias. Se você não concordar, pode cancelar antes de a mudança entrar em vigor.",
      ],
    },
    {
      title: "12. Lei aplicável e foro",
      body: [
        `Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de ${LEGAL.forumCity} para resolver controvérsias, ressalvado ao consumidor o direito de propor ação no foro do seu domicílio.`,
      ],
    },
    {
      title: "13. Contato",
      body: [
        `Suporte: ${LEGAL.supportEmail}`,
        `Privacidade e proteção de dados: ${LEGAL.privacyEmail}`,
        `${LEGAL.companyName} — ${LEGAL.address}`,
      ],
    },
  ],
};
