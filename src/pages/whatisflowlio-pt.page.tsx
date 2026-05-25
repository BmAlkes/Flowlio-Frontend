import { useEffect } from "react";
import { FolderKanban, CheckSquare, Users, Clock, FileText, Sparkles, Globe, BarChart2 } from "lucide-react";
import { WhatIsFlowlioTemplate, type WIFContent } from "@/components/whatisflowlio/WhatIsFlowlioTemplate";

const content: WIFContent = {
  dir: "ltr",
  pageTitle: "O que é o Flowlio? — A plataforma tudo-em-um para o seu negócio",

  hero: {
    badge: "O que é o Flowlio?",
    h1: "Todo o seu trabalho.",
    h1Accent: "Um só",
    h1End: "lugar.",
    sub: "O Flowlio une gestão de projetos e CRM para que agências, freelancers e empresas de serviços trabalhem com mais controle e menos caos.",
    cta1: "Experimente o Flowlio grátis",
    cta2: "Ver como funciona",
    trust: "Equipes em mais de 40 países · 4,9/5 de mais de 1.200 avaliações",
    dashboardGreeting: "Bom dia, Alex — veja o que está acontecendo com seus projetos hoje.",
    dashboardStats: [
      { label: "Projetos ativos",    value: "12" },
      { label: "Tarefas",            value: "47" },
      { label: "Clientes",           value: "28" },
      { label: "Horas registradas",  value: "184h" },
    ],
  },

  what: {
    label: "O que o Flowlio faz",
    h2: "Gestão de projetos e CRM em um só lugar",
    p1: "O Flowlio foi criado para resolver o caos operacional de agências e empresas de serviços. Em vez de dividir sua operação entre Trello, Notion, HubSpot e planilhas, o Flowlio unifica tudo: projetos, tarefas, clientes, horas e faturamento — em uma única plataforma coesa.",
    p2: "Com visibilidade 360° de cada projeto e cada cliente, sua equipe trabalha alinhada, seus clientes sempre sabem em que etapa estão e você tem os dados para tomar melhores decisões de negócio.",
    quote: "Um só espaço. Controle total.",
    sideFeatures: [
      { label: "Atualizações em tempo real", desc: "Sempre saiba o que está acontecendo com sua equipe e clientes." },
      { label: "Automação poderosa",          desc: "Economize horas por semana com fluxos inteligentes sem código." },
      { label: "Relatórios e insights",       desc: "Tome decisões mais inteligentes com análises integradas." },
    ],
  },

  who: {
    label: "Para quem é?",
    h2: "Feito para quem vive de serviços",
    cards: [
      {
        title: "Agências Digitais",
        colorClass: "purple",
        items: [
          "Gerencie múltiplos clientes e campanhas em um painel.",
          "Coordene sua equipe e tarefas sem esforço.",
          "Entregue resultados excepcionais aos seus clientes.",
        ],
      },
      {
        title: "Freelancers",
        colorClass: "blue",
        items: [
          "Controle seu tempo e rentabilidade por projeto.",
          "Fature clientes de forma profissional.",
          "Mantenha tudo em um lugar simples.",
        ],
      },
      {
        title: "Empresas de Serviços",
        colorClass: "orange",
        items: [
          "Otimize suas operações e entregue melhor.",
          "Centralize a comunicação com seus clientes.",
          "Tome decisões com dados em tempo real.",
        ],
      },
    ],
  },

  platform: {
    label: "Tudo o que você pode gerenciar",
    h2: "Uma plataforma. Todas as ferramentas.",
    desc: "De projetos a pagamentos, o Flowlio te dá tudo o que precisa para administrar seu negócio com eficiência.",
    cta: "Explorar todos os recursos",
    features: [
      { icon: FolderKanban, name: "Projetos",           desc: "Organize e acompanhe cada projeto do início ao fim." },
      { icon: CheckSquare,  name: "Tarefas",             desc: "Crie, atribua e priorize tarefas sem esforço." },
      { icon: Users,        name: "CRM",                 desc: "Gerencie clientes, leads e conversas em um lugar." },
      { icon: Clock,        name: "Controle de Horas",   desc: "Registre horas por projeto ou tarefa com precisão." },
      { icon: FileText,     name: "Faturamento",         desc: "Gere faturas e gerencie cobranças em segundos." },
      { icon: Sparkles,     name: "Assistente IA",       desc: "Receba insights e sugestões impulsionadas por IA." },
      { icon: Globe,        name: "Portal do Cliente",   desc: "Compartilhe avanços e documentos em tempo real." },
      { icon: BarChart2,    name: "Relatórios",          desc: "Converta dados em insights que impulsionam o crescimento." },
    ],
  },

  pain: {
    label: "Parece familiar?",
    h2: "O problema que todo mundo conhece",
    pains: [
      "Você usa 6 ou 5 ferramentas diferentes e ainda perde informações.",
      "Seus clientes não têm acesso completo aos projetos deles.",
      "Você não tem visibilidade de quanto tempo gasta em cada conta.",
      "Faturar e acompanhar pagamentos consome o seu tempo.",
    ],
    transitionLabel: "Com o Flowlio, tudo isso muda.",
    gains: [
      "Toda a sua equipe trabalha em um único lugar — sem caos.",
      "Seus clientes têm acesso ao portal em tempo real.",
      "Você sabe exatamente quantas horas gasta por projeto.",
      "Fature em minutos, diretamente da mesma plataforma.",
    ],
  },

  pricing: {
    label: "Planos e Preços",
    h2: "Simples, transparente, sem surpresas",
    monthly: "Mensal",
    yearly: "Anual",
    save: "Economize 20%",
    plans: [
      {
        name: "Basic",
        price: "$8",
        period: "por usuário / mês",
        featured: false,
        items: ["Até 3 projetos ativos", "CRM básico", "Controle de horas", "Suporte por e-mail"],
      },
      {
        name: "Enterprise",
        price: "$12",
        period: "por usuário / mês",
        badge: "⭐ Mais popular",
        featured: true,
        items: [
          "Projetos ilimitados",
          "CRM completo + pipeline",
          "Controle avançado de horas",
          "Portal do cliente",
          "Assistente IA incluído",
          "Suporte prioritário",
        ],
      },
      {
        name: "Pro",
        price: "$16",
        period: "por usuário / mês",
        badge: "✅ Tudo incluído",
        featured: false,
        items: [
          "Tudo do Enterprise",
          "Automação avançada",
          "Relatórios personalizados",
          "Acesso à API",
          "Onboarding dedicado",
        ],
      },
    ],
    trial: "Todos os planos incluem 14 dias de teste gratuito. Sem cartão de crédito.",
    getStarted: "Começar agora",
  },

  finalCta: {
    h2: "O controle total do seu negócio começa aqui.",
    sub: "Você não precisa de mais ferramentas. Você precisa da certa.",
    btn: "Criar minha conta grátis",
  },
};

const WhatIsFlowlioPT = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = content.pageTitle;
  }, []);

  return <WhatIsFlowlioTemplate c={content} />;
};

export default WhatIsFlowlioPT;
