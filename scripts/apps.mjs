// Catálogo de apps — fonte única para os cards da home, o índice de
// políticas (privacidade.html), a página de exclusão de dados e o <select>
// do formulário de contato. Depois de editar: `npm run build`.
//
// Padrão de domínio: cada app tem seu site em https://<slug>.glodzinski.dev.br,
// publicado a partir do repositório do próprio app (ver docs/04-subdominios.md).
// Enquanto `live` for false, os links usam `fallback` (o endereço que funciona hoje).
// Apps com `ownDomain` (ex.: Tirei!) usam sempre o domínio próprio. `privacy`
// força o link da política (ex.: Limpa Tudo, cuja política fica neste site).
// Textos em inglês e espanhol: campos `en` e `es` (tag, description, deletion);
// o que faltar cai no português.

export const BASE_DOMAIN = "glodzinski.dev.br";

export const APPS = [
  {
    slug: "tirei",
    icon: "/assets/apps/tirei.png",
    platforms: "Android · iOS · Web",
    name: "Tirei! Amigo Secreto",
    contactName: "Tirei",
    tag: "Amigo secreto",
    description: "Amigo secreto sem papelzinho: sorteio com restrições, um link individual para cada participante e lista de desejos.",
    en: { tag: "Secret Santa", description: "Secret Santa without slips of paper: a draw with restrictions, a personal link for each participant and wish lists." },
    es: { tag: "Amigo invisible", description: "Amigo invisible sin papelitos: sorteo con restricciones, un enlace individual para cada participante y lista de deseos." },
    // Domínio próprio: não usa subdomínio de glodzinski.dev.br.
    ownDomain: "tirei.app.br",
    privacyPath: "/privacidade",
  },
  {
    slug: "combino",
    icon: "/assets/apps/combino.png",
    platforms: "iOS",
    name: "Combinô",
    tag: "Família",
    description: "Rotinas, combinados, recompensas e tempo de tela das crianças, organizados pela família num só lugar.",
    deletion: "No app, em Mais › Conta › Excluir minha conta. Se não conseguir entrar, peça pelo formulário de contato ou por e-mail. Passo a passo em combino.app.br/excluir-conta.",
    en: {
      tag: "Family",
      description: "Kids' routines, agreements, rewards and screen time, organized by the whole family in one place.",
      deletion: "In the app, under Mais › Conta › Excluir minha conta. If you can't sign in, ask through the contact form or by email. Step by step at combino.app.br/excluir-conta.",
    },
    es: {
      tag: "Familia",
      description: "Rutinas, acuerdos, recompensas y tiempo de pantalla de los niños, organizados por la familia en un solo lugar.",
      deletion: "En la app, en Mais › Conta › Excluir minha conta. Si no puedes entrar, pídelo por el formulario de contacto o por correo. Paso a paso en combino.app.br/excluir-conta.",
    },
    // Domínio próprio, no Vercel (repo Combino, apps/web).
    ownDomain: "combino.app.br",
    privacyPath: "/privacidade/",
  },
  {
    slug: "farmafigurinha",
    icon: "/assets/apps/farmafigurinha.png",
    name: "FarmaFigurinha",
    tag: "Figurinhas",
    description: "Organize o álbum de figurinhas, marque as repetidas e encontre colecionadores para trocar.",
    en: { tag: "Stickers", description: "Organize your sticker album, mark your duplicates and find collectors to trade with." },
    es: { tag: "Cromos", description: "Organiza tu álbum de cromos, marca los repetidos y encuentra coleccionistas para cambiar." },
    privacyPath: "/privacidade",
    live: false,
    fallback: { site: "https://auracopa26.app", privacy: "https://auracopa26.app/privacidade" },
  },
  {
    slug: "limpatudo",
    icon: "/assets/apps/limpatudo.png",
    platforms: "macOS · Linux",
    name: "Limpa Tudo",
    tag: "Utilitário",
    description: "Encontra e remove caches de desenvolvimento, do sistema e de apps comuns, sempre com a sua confirmação.",
    deletion: "Não há dados a excluir: o app não envia nada para fora do seu computador. Para apagar o histórico local, desinstale o app.",
    en: {
      tag: "Utility",
      description: "Finds and removes developer, system and app caches, always with your confirmation.",
      deletion: "There is no data to delete: the app sends nothing off your computer. To erase the local history, uninstall the app.",
    },
    es: {
      tag: "Utilidad",
      description: "Encuentra y elimina cachés de desarrollo, del sistema y de apps comunes, siempre con tu confirmación.",
      deletion: "No hay datos que eliminar: la app no envía nada fuera de tu computadora. Para borrar el historial local, desinstala la app.",
    },
    // Site no subdomínio; a política fica nesta página (o app não tem servidor).
    live: true,
    privacy: "/privacidade.html#limpa-tudo",
  },
];

export function links(app) {
  if (app.privacy) {
    const site = app.ownDomain ? `https://${app.ownDomain}` : `https://${app.slug}.${BASE_DOMAIN}`;
    return { site, privacy: app.privacy };
  }
  if (app.ownDomain) {
    const site = `https://${app.ownDomain}`;
    return { site, privacy: site + app.privacyPath };
  }
  if (!app.live) return app.fallback;
  const site = `https://${app.slug}.${BASE_DOMAIN}`;
  return { site, privacy: site + app.privacyPath };
}

// Projetos que desenvolvemos para outras empresas. Não são produtos nossos:
// cada um tem marca, site, política de privacidade e suporte próprios (a
// empresa cliente é a controladora dos dados). Por isso ficam numa seção à
// parte, só com link para o site deles, sem subdomínio glodzinski.dev.br e
// fora do índice de políticas e do formulário de contato.
/** Campo traduzido de um app ou projeto ("tag", "description", "deletion"). */
export const tr = (item, lang, field) => (lang !== "pt" && item[lang]?.[field]) || item[field];

export const CLIENT_PROJECTS = [
  {
    name: "iPraHoje",
    icon: "/assets/apps/iprahoje.png",
    tag: "Descoberta local",
    description: "Guia de bares, restaurantes e casas noturnas abertos agora, com filtros como música ao vivo e espaço kids.",
    en: { tag: "Local discovery", description: "A guide to bars, restaurants and nightclubs open right now, with filters such as live music and kids' areas." },
    es: { tag: "Descubrimiento local", description: "Guía de bares, restaurantes y discotecas abiertos ahora, con filtros como música en vivo y espacio para niños." },
    site: "https://iprahoje.com.br",
  },
  {
    name: "LuxB",
    icon: "/assets/apps/luxb.png",
    tag: "Aluguel de itens",
    description: "App para alugar e emprestar itens com segurança, com pagamentos, avaliações e chat entre as partes.",
    en: { tag: "Item rental", description: "An app to rent and lend items safely, with payments, reviews and chat between the parties." },
    es: { tag: "Alquiler de artículos", description: "App para alquilar y prestar artículos con seguridad, con pagos, reseñas y chat entre las partes." },
    site: "https://luxbapp.com",
  },
];
