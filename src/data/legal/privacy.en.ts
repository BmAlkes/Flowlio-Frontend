import type { LegalDoc } from "@/components/legal/LegalDocument";
import { LEGAL, legalVersionLabel } from "@/configs/legal.config";

export const privacyEn: LegalDoc = {
  title: "Privacy Policy",
  updated: `Last updated: ${legalVersionLabel("en")}`,
  intro: [
    `This Policy explains how ${LEGAL.productName} processes personal data in accordance with the Brazilian General Data Protection Law (Law No. 13,709/2018, "LGPD"), the Brazilian Internet Civil Framework (Law No. 12,965/2014, "Marco Civil") and other applicable laws. It covers the website, the platform, the client portal, the AI assistant (Lio) and integrations. The Portuguese version prevails in case of conflict.`,
  ],
  sections: [
    {
      title: "1. Who we are (controller)",
      body: [
        `${LEGAL.companyName}, CNPJ ${LEGAL.cnpj}, headquartered at ${LEGAL.address} ("Flowlio", "we").`,
        `Data Protection Officer (Encarregado): ${LEGAL.dpoName} — ${LEGAL.privacyEmail}.`,
      ],
    },
    {
      title: "2. Our role: controller and processor",
      body: [
        "We are the controller of the data of people who create an account and subscribe to Flowlio (name, email, billing data, platform usage) and of website visitors.",
        "When a customer company (\"Organization\") stores data about its own clients, leads, contacts and staff in Flowlio — including leads received by webhook, messages, proposals and invoices — the Organization is the controller of that data and Flowlio acts as its processor, handling it only under the Organization's instructions and the Terms of Service. If you are a client or lead of an Organization, please contact it first; we will help it answer you.",
      ],
    },
    {
      title: "3. Data we collect",
      subsections: [
        {
          title: "3.1 Provided by you",
          bullets: [
            "Account: name, email, password (stored only as a hash), phone, address, position, profile photo, time zone and language.",
            "Organization: company name, website, industry, size and billing details.",
            "Content you add: projects, tasks, comments, files, time entries, proposals, invoices, support tickets and messages.",
            "Third-party data added by you or your Organization (clients and leads): name, email, phone, CPF/CNPJ, address, company, notes and interaction history.",
            "AI assistant and WhatsApp: the questions, text or voice commands and attachments you send to Lio, and the WhatsApp number you link.",
          ],
        },
        {
          title: "3.2 Collected automatically",
          bullets: [
            "Access logs: IP address, date and time, browser and device (required by the Marco Civil).",
            "Technical error reports without personal data (error code, screen area and app version).",
            "Cookies and similar technologies, as described in section 9.",
          ],
        },
        {
          title: "3.3 Received from integrations you enable",
          bullets: [
            "Google Calendar: events, times, descriptions and attendees of the calendars you connect, with read and write access.",
            "Payments: transaction confirmation and status from the payment processor. We do not store card numbers.",
          ],
        },
      ],
    },
    {
      title: "4. Purposes and legal bases",
      table: {
        head: ["Purpose", "Legal basis (LGPD art. 7)"],
        rows: [
          ["Create and maintain your account and provide the service", "Performance of a contract (item V)"],
          ["Billing, invoicing and tax obligations", "Contract and legal obligation (items II and V)"],
          ["Keep access logs for 6 months", "Legal obligation — Marco Civil, art. 15 (item II)"],
          ["Security, fraud prevention, two-factor authentication and rate limiting", "Legitimate interest (item IX) and fraud prevention (art. 11, II, g, where applicable)"],
          ["Transactional emails and automations (reminders, alerts, notifications)", "Performance of a contract (item V)"],
          ["AI assistant, voice transcription and WhatsApp", "Performance of a contract, when you enable the feature (item V)"],
          ["Google Calendar sync", "Consent, when you connect your Google account (item I)"],
          ["Newsletter and marketing communications", "Consent (item I), revocable at any time"],
          ["Marketing cookies (Meta Pixel)", "Consent (item I), through the cookie banner"],
          ["Product improvement and aggregate statistics", "Legitimate interest (item IX)"],
          ["Defense in legal, administrative or arbitration proceedings", "Regular exercise of rights (item VI)"],
        ],
      },
    },
    {
      title: "5. Artificial intelligence and automated decisions",
      body: [
        "The Lio assistant uses OpenAI language models to answer questions, summarize information, suggest actions and transcribe audio. We send the provider only what each request needs (your question and the relevant records of your Organization). Under the provider's API policy, this data is not used to train its models.",
        "Actions suggested by the AI (creating tasks, moving events, sending messages) only run after you review and confirm them. Automatically calculated indicators (project risk, lead priority, alerts) are aids and do not produce decisions affecting your rights without human involvement. You may request a review of any decision made solely by automated processing (LGPD art. 20) through the DPO channel.",
      ],
    },
    {
      title: "6. Who we share data with",
      body: [
        "We do not sell personal data. We share data only with vendors that help us provide the service (processors), under contract and confidentiality and security obligations:",
      ],
      table: {
        head: ["Vendor", "Purpose", "Location"],
        rows: [
          ["Railway", "Application and database hosting", "USA"],
          ["Cloudinary", "File and image storage", "USA"],
          ["Brevo", "Transactional email and newsletter", "European Union"],
          ["OpenAI", "AI assistant and audio transcription", "USA"],
          ["Google", "Google Calendar integration (when connected)", "USA"],
          ["Meta (WhatsApp Cloud API and Meta Pixel)", "Lio on WhatsApp (when linked) and ad measurement (with consent)", "USA"],
          ["PayPal", "Subscription payment processing", "USA"],
          ["Sentry", "Error monitoring (no emails, tokens or content)", "USA"],
          ["Browser push services (Google, Mozilla, Apple)", "Push notifications, when enabled", "USA"],
        ],
      },
      bullets: [
        "Integrations set up by the Organization itself (for example a Slack webhook or third-party payment links) receive the data the Organization chooses to send.",
        "Public authorities, when required by law or court order.",
        "In a merger, acquisition or corporate reorganization, with the same protection as this Policy.",
      ],
    },
    {
      title: "7. International transfers",
      body: [
        "Because several vendors are located outside Brazil, your data may be transferred to other countries, mainly the USA and the European Union. These transfers rely on LGPD art. 33 and ANPD Resolution CD/ANPD No. 19/2024, through contractual clauses with vendors and the need to perform our contract with you.",
      ],
    },
    {
      title: "8. How long we keep data",
      table: {
        head: ["Data", "Period"],
        rows: [
          ["Account and Organization content", "While the account is active; after closure, available for up to 90 days for reactivation or export, then deleted or anonymized unless the law requires otherwise"],
          ["Access logs (IP, date and time)", "6 months (Marco Civil, art. 15)"],
          ["Tax and billing data", "5 years (tax law)"],
          ["AI assistant conversations", "180 days"],
          ["Files sent to the AI assistant", "Deleted after processing (at most 24 hours)"],
          ["Raw data received by lead webhooks", "90 days (the created lead follows the Organization's rules)"],
          ["In-app notifications", "12 months"],
          ["IP and browser in audit logs", "12 months (then the record is anonymized)"],
          ["Technical error monitoring", "30 days"],
          ["Log of data subject requests (section 10)", "5 years, as proof of compliance"],
        ],
      },
    },
    {
      title: "9. Cookies",
      body: [
        "We use necessary cookies (login, session and security, always on) and, only with your consent, marketing cookies (Meta Pixel). The Meta Pixel does not load until you accept. You can change your choice at any time from \"Cookie Settings\" in the site footer.",
      ],
      table: {
        head: ["Category", "Purpose", "Provider", "Can be disabled?"],
        rows: [
          ["Necessary", "Keep you signed in, remember your session and protect against fraud", "Flowlio", "No — required for the site to work"],
          ["Analytics", "Understand how the site is used to improve it (no third-party tools today)", "Flowlio", "Yes"],
          ["Marketing", "Measure the performance of our ads", "Meta (Facebook) Pixel", "Yes"],
        ],
      },
      links: [{ label: "Meta Privacy Policy", href: "https://www.facebook.com/privacy/policy/" }],
    },
    {
      title: "10. Your rights (LGPD art. 18)",
      bullets: [
        "Confirmation that we process your data and access to it.",
        "Correction of incomplete, inaccurate or outdated data (you can edit your profile in Settings).",
        "Anonymization, blocking or deletion of unnecessary, excessive or unlawfully processed data.",
        "Portability: in Settings > Privacy & data, download a copy of your data in JSON format.",
        "Deletion of data processed on the basis of consent and account deletion: in Settings > Privacy & data.",
        "Information about who we share your data with (section 6) and about the option not to consent and its consequences.",
        "Withdrawal of consent (newsletter, marketing cookies, Google Calendar) at any time.",
        "Objection to processing based on legitimate interest and review of automated decisions (art. 20).",
        "Filing a complaint with the Brazilian Data Protection Authority (ANPD) — www.gov.br/anpd.",
      ],
      body: [
        `To exercise any right, use the options in Settings or write to ${LEGAL.privacyEmail}. We reply within 15 days (art. 19). We may ask for information to confirm your identity. When you delete your account, we remove or anonymize your personal data and keep only what the law requires (such as access logs for 6 months and tax records). If you own an Organization, deletion closes the Organization and is completed within 15 days.`,
      ],
    },
    {
      title: "11. Security",
      body: [
        "We apply technical and administrative measures to protect data (LGPD art. 46): encryption in transit (HTTPS), hashed passwords, integration tokens encrypted at rest, two-factor authentication, secure cookies, role- and Organization-based access control, rate limiting, audit logs and removal of personal data from technical logs.",
        "If a security incident may cause relevant risk or harm, we will notify the ANPD and the affected data subjects within the period set by Resolution CD/ANPD No. 15/2024 (3 business days).",
      ],
    },
    {
      title: "12. Children and adolescents",
      body: [
        "Flowlio is a professional tool intended for people aged 18 or over. We do not knowingly collect data from children or adolescents. If we find such data without the consent required by LGPD art. 14, we will delete it.",
      ],
    },
    {
      title: "13. Changes to this Policy",
      body: [
        "We may update this Policy. The date at the top shows the current version. For material changes, we will notify you by email or in the platform before they take effect and, where required, ask for new consent.",
      ],
    },
    {
      title: "14. Contact",
      body: [
        `Data Protection Officer: ${LEGAL.dpoName} — ${LEGAL.privacyEmail}`,
        `${LEGAL.companyName} — CNPJ ${LEGAL.cnpj} — ${LEGAL.address}`,
        `General support: ${LEGAL.supportEmail}`,
      ],
    },
  ],
};
