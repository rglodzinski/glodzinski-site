// Idiomas do site e textos das partes geradas (partials, catálogo de apps).
// As páginas em si ficam em ./ (pt-BR), ./en/ e ./es/, cada uma com o texto
// já traduzido; o build preenche os marcadores com os textos daqui.
// Ver docs/02-site.md, "Idiomas".

export const SITE = "https://glodzinski.dev.br";

export const LANGS = {
  pt: { dir: "", html: "pt-BR", og: "pt_BR", label: "Português", short: "PT" },
  en: { dir: "en", html: "en", og: "en_US", label: "English", short: "EN" },
  es: { dir: "es", html: "es", og: "es_ES", label: "Español", short: "ES" },
};
export const DEFAULT_LANG = "en"; // x-default e idioma para navegadores fora de pt/es

// Cada página lógica e o arquivo dela em cada idioma (relativo à raiz).
export const PAGES = {
  home: { pt: "index.html", en: "en/index.html", es: "es/index.html" },
  support: { pt: "apoie.html", en: "en/support.html", es: "es/apoyo.html" },
  privacy: { pt: "privacidade.html", en: "en/privacy.html", es: "es/privacidad.html" },
  deletion: { pt: "exclusao-de-dados.html", en: "en/data-deletion.html", es: "es/eliminacion-de-datos.html" },
};

/** Caminho público de um arquivo ("en/index.html" → "/en/"). */
export const urlOf = (file) => "/" + file.replace(/(^|\/)index\.html$/, "$1");

/** Página lógica + idioma de um arquivo, ou null (ex.: 404.html). */
export function pageOf(file) {
  for (const [id, files] of Object.entries(PAGES))
    for (const [lang, f] of Object.entries(files)) if (f === file) return { id, lang };
  return null;
}

/** Traduz um link interno escrito em pt ("/privacidade.html#site") para o idioma. */
export function localize(href, lang) {
  if (!href.startsWith("/") || lang === "pt") return href;
  const [path, hash = ""] = href.split("#");
  const [file, query = ""] = path.slice(1).split("?");
  const id = Object.keys(PAGES).find((k) => PAGES[k].pt === (file || "index.html"));
  if (!id) return href;
  return urlOf(PAGES[id][lang]) + (query ? "?" + query : "") + (hash ? "#" + hash : "");
}

export const T = {
  pt: {
    skip: "Pular para o conteúdo",
    logoLabel: "Glodzinski Tecnologia, página inicial",
    navLabel: "Principal",
    apps: "Aplicativos",
    clients: "Clientes",
    privacy: "Privacidade",
    support: "Apoie",
    contact: "Contato",
    themeLabel: "Alternar tema claro ou escuro",
    menuLabel: "Abrir menu",
    langLabel: "Idioma",
    company: "Empresa",
    policies: "Políticas de privacidade",
    deletion: "Exclusão de dados",
    country: "Florianópolis, Brasil",
    site: "Site ↗",
    siteOf: (n) => `Site do ${n}`,
    help: "Suporte",
    onThisPage: "nesta página",
    noApp: "Nenhum em especial",
    deletionDefault: "Peça pelo formulário de contato ou por e-mail, informando o e-mail ou telefone usado no app.",
  },
  en: {
    skip: "Skip to content",
    logoLabel: "Glodzinski Tecnologia, home",
    navLabel: "Main",
    apps: "Apps",
    clients: "Clients",
    privacy: "Privacy",
    support: "Support us",
    contact: "Contact",
    themeLabel: "Toggle light or dark theme",
    menuLabel: "Open menu",
    langLabel: "Language",
    company: "Company",
    policies: "Privacy policies",
    deletion: "Data deletion",
    country: "Florianópolis, Brazil",
    site: "Website ↗",
    siteOf: (n) => `${n} website`,
    help: "Support",
    onThisPage: "on this page",
    noApp: "None in particular",
    deletionDefault: "Ask through the contact form or by email, with the email or phone number you use in the app.",
  },
  es: {
    skip: "Saltar al contenido",
    logoLabel: "Glodzinski Tecnologia, inicio",
    navLabel: "Principal",
    apps: "Aplicaciones",
    clients: "Clientes",
    privacy: "Privacidad",
    support: "Apóyanos",
    contact: "Contacto",
    themeLabel: "Cambiar entre tema claro y oscuro",
    menuLabel: "Abrir menú",
    langLabel: "Idioma",
    company: "Empresa",
    policies: "Políticas de privacidad",
    deletion: "Eliminación de datos",
    country: "Florianópolis, Brasil",
    site: "Sitio ↗",
    siteOf: (n) => `Sitio de ${n}`,
    help: "Soporte",
    onThisPage: "en esta página",
    noApp: "Ninguno en particular",
    deletionDefault: "Pídelo por el formulario de contacto o por correo, indicando el correo o teléfono que usas en la app.",
  },
};
