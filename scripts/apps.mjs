// Catálogo de apps — fonte única para os cards da home, o índice de
// políticas (privacidade.html), a página de exclusão de dados e o <select>
// do formulário de contato. Depois de editar: `npm run build`.
//
// Padrão de domínio: cada app tem seu site em https://<slug>.glodzinski.dev.br,
// publicado a partir do repositório do próprio app (ver docs/04-subdominios.md).
// Enquanto `live` for false, os links usam `fallback` (o endereço que funciona hoje).
// Apps com `ownDomain` (ex.: Tirei!) usam sempre o domínio próprio.

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
    // Domínio próprio: não usa subdomínio de glodzinski.dev.br.
    ownDomain: "tirei.app.br",
    privacyPath: "/privacidade",
  },
  {
    slug: "combino",
    icon: "/assets/apps/combino.png",
    platforms: "Android · iOS",
    name: "Combinô",
    tag: "Família",
    description: "Rotinas, combinados, recompensas e tempo de tela das crianças, organizados pela família num só lugar.",
    privacyPath: "/privacidade/",
    live: false,
    fallback: { site: "https://combino-web.vercel.app", privacy: "https://combino-web.vercel.app/privacidade/" },
  },
  {
    slug: "farmafigurinha",
    icon: "/assets/apps/farmafigurinha.png",
    name: "FarmaFigurinha",
    tag: "Figurinhas",
    description: "Organize o álbum de figurinhas, marque as repetidas e encontre colecionadores para trocar.",
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
    privacyPath: "/privacidade",
    deletion: "Não há dados a excluir: o app não envia nada para fora do seu computador. Para apagar o histórico local, desinstale o app.",
    live: false,
    fallback: { site: "https://rglodzinski.github.io/LimpaTudo", privacy: "/privacidade.html#limpa-tudo" },
  },
];

export function links(app) {
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
export const CLIENT_PROJECTS = [
  {
    name: "iPraHoje",
    icon: "/assets/apps/iprahoje.png",
    tag: "Descoberta local",
    description: "Guia de bares, restaurantes e casas noturnas abertos agora, com filtros como música ao vivo e espaço kids.",
    site: "https://iprahoje.com.br",
  },
  {
    name: "LuxB",
    icon: "/assets/apps/luxb.png",
    tag: "Aluguel de itens",
    description: "App para alugar e emprestar itens com segurança, com pagamentos, avaliações e chat entre as partes.",
    site: "https://luxbapp.com",
  },
];
