import type { LegalDoc } from "@/components/legal/LegalDocument";
import { LEGAL, legalContact, legalVersionLabel } from "@/configs/legal.config";

export const termsEn: LegalDoc = {
  title: "Terms of Service",
  updated: `Last updated: ${legalVersionLabel("en")}`,
  intro: [
    `These Terms govern the use of the ${LEGAL.productName} platform ("Service"), a product of ${LEGAL.companyName} ("Flowlio", "we"). By creating an account or using the Service, you confirm that you have read and accepted these Terms and the Privacy Policy. The Portuguese version prevails in case of conflict.`,
  ],
  sections: [
    {
      title: "1. The Service",
      bullets: [
        "Project, task and team management",
        "Client and lead CRM, proposals, invoices and payment links",
        "Time tracking, reports and automations",
        "Integration with Google Calendar, WhatsApp and other tools",
        "Artificial intelligence assistant (Lio)",
      ],
    },
    {
      title: "2. Account",
      body: [
        "You must be 18 or older and provide accurate information. You are responsible for keeping your credentials confidential and for all activity in your account. Tell us immediately about any unauthorized use.",
        "The subscription holder (Organization owner) is responsible for the users they invite and the permissions they grant.",
      ],
    },
    {
      title: "3. Acceptable use",
      body: ["You may not:"],
      bullets: [
        "Use the Service for unlawful purposes or to spam, harass or deceive people",
        "Store personal data without a legal basis, or sensitive data that is not necessary",
        "Infringe third-party intellectual property rights",
        "Send malicious code, attempt unauthorized access or disrupt the Service",
      ],
    },
    {
      title: "4. Personal data protection (data processing agreement)",
      body: [
        "For personal data the Organization stores in the Service about its clients, leads, contacts and staff, the Organization is the controller and Flowlio is the processor (LGPD art. 5, VI and VII). This section is the data processing agreement between the parties.",
      ],
      subsections: [
        {
          title: "4.1 Organization obligations (controller)",
          bullets: [
            "Have a legal basis for all data it stores and inform data subjects about the processing.",
            "Answer its data subjects' requests (access, correction, deletion) — the Service provides tools to edit, export and delete records.",
            "Configure permissions, integrations and webhooks appropriately and not store sensitive data without need.",
          ],
        },
        {
          title: "4.2 Flowlio obligations (processor)",
          bullets: [
            "Process data only to provide the Service and under the Organization's instructions (LGPD art. 39).",
            "Maintain appropriate technical and administrative security measures (art. 46) and confidentiality of authorized personnel.",
            "Use only the sub-processors listed in the Privacy Policy, under equivalent obligations, and give notice of relevant changes to that list.",
            "Notify the Organization without undue delay of security incidents affecting its data, with the information it needs to meet its duties towards the ANPD and data subjects.",
            "Reasonably assist the Organization with data subject requests and impact assessments.",
            "When the contract ends, make data available for export for up to 90 days and then delete or anonymize it, unless retention is required by law.",
          ],
        },
        {
          title: "4.3 Artificial intelligence",
          body: [
            "When you use the AI assistant, the data a request needs is sent to the AI provider named in the Privacy Policy, only to generate the answer. AI suggestions can be wrong: review them before confirming any action.",
          ],
        },
      ],
    },
    {
      title: "5. Third-party integrations",
      body: [
        "By connecting Google Calendar, WhatsApp, Slack, payment processors or other integrations, you authorize the necessary data exchange and accept those services' terms. You can disconnect at any time. We are not responsible for changes or failures in third-party services.",
      ],
    },
    {
      title: "6. Subscription and payment",
      bullets: [
        "Plans are billed in advance, monthly or yearly, as shown on the pricing page.",
        "Prices may change with 30 days' notice.",
        "Non-payment may lead to suspension of the Service, with prior notice.",
        "You can cancel at any time; cancellation takes effect at the end of the paid period.",
        "If you subscribe as a consumer (individual), you may withdraw within 7 days of purchase with a full refund (Brazilian Consumer Code, art. 49).",
      ],
    },
    {
      title: "7. Intellectual property",
      body: [
        "The Service, its brand and software belong to Flowlio. You keep ownership of all content you add and grant us a limited license to store and process it only to provide the Service.",
      ],
    },
    {
      title: "8. Availability",
      body: [
        "We aim to keep the Service available but do not guarantee uninterrupted operation. Planned maintenance will be announced whenever possible.",
      ],
    },
    {
      title: "9. Liability",
      body: [
        "To the extent permitted by law, Flowlio is not liable for indirect damages, lost profits or data loss caused by misuse, third-party failures or force majeure. Nothing in these Terms limits consumer rights under the Brazilian Consumer Code or liability under the LGPD.",
      ],
    },
    {
      title: "10. Suspension and termination",
      body: [
        "We may suspend or close accounts that breach these Terms or the law, with prior notice whenever possible. In serious cases (fraud, security risk or legal order) suspension may be immediate.",
        "After closure, Organization data remains available for export for up to 90 days and is then deleted or anonymized, as described in the Privacy Policy. Amounts due remain payable.",
      ],
    },
    {
      title: "11. Changes",
      body: [
        "We may change these Terms. Material changes will be announced by email or in the platform at least 15 days in advance. If you disagree, you may cancel before the change takes effect.",
      ],
    },
    {
      title: "12. Governing law and jurisdiction",
      body: [
        "For users in Brazil, these Terms are governed by the laws of the Federative Republic of Brazil, including the LGPD and the Consumer Protection Code. Disputes will be settled in the courts of the user's domicile. Before any legal action, the parties will try to resolve the matter amicably through the contact channels below.",
      ],
    },
    {
      title: "13. Contact",
      body: [
        `Support: ${LEGAL.supportEmail}`,
        `Privacy and data protection: ${legalContact("en")}`,
      ],
    },
  ],
};
