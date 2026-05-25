import { useEffect } from "react";
import { FolderKanban, CheckSquare, Users, Clock, FileText, Sparkles, Globe, BarChart2 } from "lucide-react";
import { WhatIsFlowlioTemplate, type WIFContent } from "@/components/whatisflowlio/WhatIsFlowlioTemplate";

const content: WIFContent = {
  dir: "ltr",
  pageTitle: "¿Qué es Flowlio? — La plataforma todo-en-uno para tu negocio",

  hero: {
    badge: "¿Qué es Flowlio?",
    h1: "Todo tu trabajo.",
    h1Accent: "Un solo",
    h1End: "lugar.",
    sub: "Flowlio une gestión de proyectos y CRM para que agencias, freelancers y empresas de servicio trabajen con más control y menos caos.",
    cta1: "Prueba Flowlio gratis",
    cta2: "Ver cómo funciona",
    trust: "Equipos en más de 40 países · 4.9/5 de más de 1.200 reseñas",
    dashboardGreeting: "Buenos días, Alex — esto es lo que pasa hoy con tus proyectos.",
    dashboardStats: [
      { label: "Proyectos activos", value: "12" },
      { label: "Tareas",            value: "47" },
      { label: "Clientes",          value: "28" },
      { label: "Horas registradas", value: "184h" },
    ],
  },

  what: {
    label: "Qué hace Flowlio",
    h2: "Gestión de proyectos y CRM en un solo lugar",
    p1: "Flowlio nació para resolver el caos operativo de agencias y empresas de servicio. En lugar de repartir tu operación entre Trello, Notion, HubSpot y hojas de cálculo, Flowlio unifica todo: proyectos, tareas, clientes, tiempo y facturación dentro de una sola plataforma cohesiva.",
    p2: "Con visibilidad 360° de cada proyecto y cada cliente, tu equipo trabaja alineado, tus clientes siempre saben en qué etapa están y tú tienes los datos para tomar mejores decisiones de negocio.",
    quote: "Un solo espacio. Control total.",
    sideFeatures: [
      { label: "Actualizaciones en tiempo real", desc: "Siempre sabe qué pasa con tu equipo y tus clientes." },
      { label: "Automatización poderosa",         desc: "Ahorra horas cada semana con flujos inteligentes sin código." },
      { label: "Reportes e insights",             desc: "Toma mejores decisiones con analíticas integradas." },
    ],
  },

  who: {
    label: "¿Para quién es?",
    h2: "Diseñado para quienes viven de sus servicios",
    cards: [
      {
        title: "Agencias Digitales",
        colorClass: "purple",
        items: [
          "Gestiona múltiples clientes y campañas desde un panel.",
          "Coordina tu equipo y tareas sin esfuerzo.",
          "Entrega resultados excepcionales a tus clientes.",
        ],
      },
      {
        title: "Freelancers",
        colorClass: "blue",
        items: [
          "Controla tu tiempo y rentabilidad por proyecto.",
          "Factura a clientes de forma profesional.",
          "Mantén todo en un lugar simple.",
        ],
      },
      {
        title: "Empresas de Servicio",
        colorClass: "orange",
        items: [
          "Optimiza tus operaciones y entrega mejor.",
          "Centraliza la comunicación con tus clientes.",
          "Toma decisiones con datos en tiempo real.",
        ],
      },
    ],
  },

  platform: {
    label: "Todo lo que puedes gestionar",
    h2: "Una plataforma. Todas las herramientas.",
    desc: "De proyectos a pagos, Flowlio te da todo lo que necesitas para gestionar tu negocio con eficiencia.",
    cta: "Explorar todas las funciones",
    features: [
      { icon: FolderKanban, name: "Proyectos",         desc: "Organiza y supervisa cada proyecto de principio a fin." },
      { icon: CheckSquare,  name: "Tareas",             desc: "Crea, asigna y prioriza tareas sin esfuerzo." },
      { icon: Users,        name: "CRM",                desc: "Gestiona clientes, leads y conversaciones en un lugar." },
      { icon: Clock,        name: "Time Tracking",      desc: "Registra horas por proyecto o tarea con precisión." },
      { icon: FileText,     name: "Facturación",        desc: "Genera facturas y gestiona cobros en segundos." },
      { icon: Sparkles,     name: "Asistente IA",       desc: "Obtén insights y sugerencias impulsadas por IA." },
      { icon: Globe,        name: "Portal de Clientes", desc: "Comparte avances y documentos en tiempo real." },
      { icon: BarChart2,    name: "Reportes",           desc: "Convierte datos en insights que impulsan el crecimiento." },
    ],
  },

  pain: {
    label: "¿Te suena familiar?",
    h2: "El problema que todos conocen",
    pains: [
      "Usas 6 o 5 herramientas distintas y aún así pierdes información.",
      "Tus clientes no tienen acceso completo a sus proyectos.",
      "No tienes visibilidad de cuánto tiempo inviertes en cada cuenta.",
      "Facturar y hacer seguimiento de pagos consume tu tiempo.",
    ],
    transitionLabel: "Con Flowlio, todo eso cambia.",
    gains: [
      "Todo tu equipo trabaja desde un solo lugar — sin caos.",
      "Tus clientes tienen acceso a su portal en tiempo real.",
      "Sabes exactamente cuántas horas inviertes por proyecto.",
      "Facturas en minutos desde la misma plataforma.",
    ],
  },

  pricing: {
    label: "Planes y Precios",
    h2: "Simple, transparente, sin sorpresas",
    monthly: "Mensual",
    yearly: "Anual",
    save: "Ahorra 20%",
    plans: [
      {
        name: "Basic",
        price: "$8",
        period: "por usuario / mes",
        featured: false,
        items: ["Hasta 3 proyectos activos", "CRM básico", "Control de tiempo", "Soporte por email"],
      },
      {
        name: "Enterprise",
        price: "$12",
        period: "por usuario / mes",
        badge: "⭐ Más popular",
        featured: true,
        items: [
          "Proyectos ilimitados",
          "CRM completo + pipeline",
          "Time tracking avanzado",
          "Portal de clientes",
          "Asistente IA incluido",
          "Soporte prioritario",
        ],
      },
      {
        name: "Pro",
        price: "$16",
        period: "por usuario / mes",
        badge: "✅ Todo incluido",
        featured: false,
        items: [
          "Todo lo de Enterprise",
          "Automatización avanzada",
          "Reportes personalizados",
          "Acceso API",
          "Onboarding dedicado",
        ],
      },
    ],
    trial: "Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito.",
    getStarted: "Empezar ahora",
  },

  finalCta: {
    h2: "El control total de tu negocio empieza aquí.",
    sub: "No necesitas más herramientas. Necesitas la correcta.",
    btn: "Crear mi cuenta gratis",
  },
};

const WhatIsFlowlio = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = content.pageTitle;
  }, []);

  return <WhatIsFlowlioTemplate c={content} />;
};

export default WhatIsFlowlio;
