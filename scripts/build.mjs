// Injeta os trechos de partials/ nas páginas HTML (pt-BR na raiz, en/ e es/),
// entre os marcadores <!-- @head -->…<!-- /@head --> (idem @header e @footer),
// traduzindo os {{t.*}} e os links {{href:*}} para o idioma de cada página,
// e marca o link de navegação da página atual com aria-current.
// Gera, a partir de scripts/apps.mjs, os blocos @hero-apps, @apps, @clients,
// @policies, @app-options e @deletion, e preenche o "Pix copia e cola" com
// assets/pix/payload.txt (gerado por `npm run pix`).
// Idiomas e mapa de páginas: scripts/i18n.mjs. Ver docs/02-site.md.
// Uso: npm run build   (rode depois de editar partials/, apps.mjs ou i18n.mjs)
import { readFile, writeFile, readdir } from "node:fs/promises";
import { APPS, CLIENT_PROJECTS, links, tr } from "./apps.mjs";
import { DEFAULT_LANG, LANGS, PAGES, SITE, T, localize, pageOf, urlOf } from "./i18n.mjs";

// Bandeiras do seletor de idioma (SVG inline: emojis de bandeira não aparecem
// no Windows). BR = Brasil, EN = Estados Unidos, ES = Espanha.
const flag = (body) => `<svg class="flag" viewBox="0 0 20 14" aria-hidden="true" focusable="false">${body}</svg>`;
const FLAGS = {
  pt: flag(`<rect width="20" height="14" fill="#009C3B"/><path d="M10 1.6 18.2 7 10 12.4 1.8 7Z" fill="#FFDF00"/><circle cx="10" cy="7" r="3.1" fill="#002776"/><path d="M6.98 6.3q3.2-.5 6 1.3" stroke="#fff" stroke-width=".55" fill="none"/>`),
  en: flag(`<rect width="20" height="14" fill="#fff"/><path d="M0 0h20v1.08H0zm0 2.15h20v1.08H0zm0 2.15h20v1.08H0zm0 2.16h20v1.07H0zm0 2.15h20v1.08H0zm0 2.15h20v1.08H0zm0 2.16h20V14H0z" fill="#B22234"/><rect width="8.8" height="7.54" fill="#3C3B6E"/>`),
  es: flag(`<rect width="20" height="14" fill="#AA151B"/><rect y="3.5" width="20" height="7" fill="#F1BF00"/>`),
};

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const isExt = (url) => url.startsWith("http");
const host = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const icon = (a, size) =>
  `<img class="app-icon" src="${a.icon}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">`;
const contactName = (a) => a.contactName ?? a.name;

function generated(lang) {
  const t = T[lang];
  const L = (a) => {
    const l = links(a);
    return { site: l.site, privacy: localize(l.privacy, lang) };
  };
  const home = urlOf(PAGES.home[lang]);
  return {
    "hero-apps": APPS.map((a) => {
      const l = L(a);
      return `<a href="${l.site}"${isExt(l.site) ? ' rel="noopener"' : ""}>${icon(a, 56)}<span>${esc(a.name)}<small>${esc(tr(a, lang, "tag"))}</small></span></a>`;
    }).join("\n"),

    apps: APPS.map((a) => {
      const l = L(a);
      return `<li class="app-row" id="app-${a.slug}">
  ${icon(a, 64)}
  <div>
    <h3>${esc(a.name)} <small>${esc([tr(a, lang, "tag"), a.platforms].filter(Boolean).join(" · "))}</small></h3>
    <p>${esc(tr(a, lang, "description"))}</p>
  </div>
  <div class="app-meta">
    <a href="${l.site}"${isExt(l.site) ? ' rel="noopener"' : ""} aria-label="${esc(t.siteOf(a.name))}">${t.site}</a>
    <a href="${l.privacy}"${isExt(l.privacy) ? ' rel="noopener"' : ""}>${t.privacy}</a>
    <a href="${home}?app=${encodeURIComponent(contactName(a))}#contato">${t.help}</a>
  </div>
</li>`;
    }).join("\n"),

    clients: CLIENT_PROJECTS.map((c) => `<li class="app-row">
  ${icon(c, 48)}
  <div>
    <h3>${esc(c.name)} <small>${esc(tr(c, lang, "tag"))}</small></h3>
    <p>${esc(tr(c, lang, "description"))}</p>
  </div>
  <div class="app-meta"><a href="${c.site}" rel="noopener">${esc(host(c.site))} ↗</a></div>
</li>`).join("\n"),

    policies: APPS.map((a) => {
      const l = L(a);
      const where = isExt(l.privacy) ? host(l.privacy) : t.onThisPage;
      return `<li><a href="${l.privacy}"${isExt(l.privacy) ? ' rel="noopener"' : ""}>${icon(a, 32)}${esc(a.name)}<span class="url">${esc(where)}</span></a></li>`;
    }).join("\n"),

    "app-options": [`<option value="">${t.noApp}</option>`,
      ...APPS.map((a) => `<option>${esc(contactName(a))}</option>`)].join("\n"),

    deletion: APPS.map((a) => {
      const how = tr(a, lang, "deletion") ?? t.deletionDefault;
      return `<li><strong>${esc(a.name)}.</strong> ${esc(how)}</li>`;
    }).join("\n"),
  };
}

// Primeira visita: leva ao idioma do navegador (pt, en ou es; outros → en).
// Não age em robôs de busca, nem depois de o visitante escolher um idioma no
// seletor (localStorage "lang"), nem mais de uma vez por sessão.
const LANG_DETECT = `<script>(function(){try{var n=navigator;if(n.webdriver||/bot|crawl|spider|slurp|preview|lighthouse|headless/i.test(n.userAgent))return;if(localStorage.getItem("lang")||sessionStorage.getItem("langAuto"))return;sessionStorage.setItem("langAuto","1");var cur=document.documentElement.lang.slice(0,2),want="${DEFAULT_LANG}",ls=n.languages&&n.languages.length?n.languages:[n.language||""];for(var i=0;i<ls.length;i++){var l=String(ls[i]).slice(0,2).toLowerCase();if(l==="pt"||l==="en"||l==="es"){want=l;break}}if(want===cur)return;var alt=document.querySelector('link[rel="alternate"][hreflang^="'+want+'"]');if(alt){var u=new URL(alt.href);location.replace(u.pathname+location.search+location.hash)}}catch(e){}})();</script>`;

// Logo inline: letras em currentColor e ponto final na cor de destaque (CSS),
// para acompanhar o tema claro/escuro.
const logoInline = (await readFile("assets/brand/logo.svg", "utf8")).trim()
  .replace(/ width="\d+" height="\d+"/, "")
  .replace(' role="img" aria-label="Glodzinski"', ' aria-hidden="true" focusable="false"')
  .replace(/fill="#111316"/g, 'fill="currentColor"')
  .replace(/fill="#C93F1B"/g, 'class="dot"');

const templates = {};
for (const name of ["head", "header", "footer"]) {
  templates[name] = (await readFile(`partials/${name}.html`, "utf8")).trim().replaceAll("{{logo}}", logoInline);
}
let payload = null;
try { payload = (await readFile("assets/pix/payload.txt", "utf8")).trim(); } catch { /* sem Pix */ }

const block = (name) => new RegExp(`(<!-- @${name} -->)[\\s\\S]*?(<!-- /@${name} -->)`, "g");

function render(template, file, lang, page) {
  const t = T[lang];
  const files = page ? PAGES[page.id] : Object.fromEntries(Object.keys(LANGS).map((l) => [l, PAGES.home[l]]));
  const alternates = page
    ? [
        ...Object.entries(files).map(([l, f]) => `<link rel="alternate" hreflang="${LANGS[l].html}" href="${SITE}${urlOf(f)}">`),
        `<link rel="alternate" hreflang="x-default" href="${SITE}${urlOf(files[DEFAULT_LANG])}">`,
      ].join("\n")
    : "";
  const langSwitch = `<nav class="lang-switch" aria-label="${t.langLabel}">${Object.entries(LANGS)
    .map(([l, L]) => {
      const inner = `${FLAGS[l]}<span>${L.short}</span>`;
      return l === lang
        ? `<span class="lang" aria-current="true" lang="${L.html}" title="${L.label}">${inner}</span>`
        : `<a class="lang" href="${urlOf(files[l])}" hreflang="${L.html}" lang="${L.html}" title="${L.label}" aria-label="${L.label}" data-lang="${l}">${inner}</a>`;
    })
    .join("")}</nav>`;
  let out = template
    .replaceAll("{{alternates}}", alternates)
    .replaceAll("{{ogLocale}}", LANGS[lang].og)
    .replaceAll("{{langDetect}}", page ? LANG_DETECT : "")
    .replaceAll("{{langSwitch}}", langSwitch)
    .replace(/\{\{href:(\w+)\}\}/g, (_, id) => urlOf(PAGES[id][lang]))
    .replace(/\{\{t\.(\w+)\}\}/g, (_, k) => {
      if (typeof t[k] !== "string") throw new Error(`texto sem tradução: t.${k} (${lang})`);
      return t[k];
    });
  if (page && page.id !== "home") {
    const self = urlOf(file);
    out = out.replace(`<nav class="nav"`, "\u0000").replace(`<a href="${self}">`, `<a href="${self}" aria-current="page">`).replace("\u0000", `<nav class="nav"`);
  }
  return out;
}

// Links para outros sites abrem em nova aba (target="_blank" + rel="noopener").
// Vale para todo <a href="http…"> que não seja deste domínio, inclusive os
// escritos à mão nas páginas; é idempotente.
function externalLinksInNewTab(html) {
  return html.replace(/<a\b([^>]*\bhref="(https?:\/\/[^"]+)"[^>]*)>/g, (tag, attrs, href) => {
    if (new URL(href).hostname === new URL(SITE).hostname) return tag;
    let a = attrs.replace(/\s+target="[^"]*"/, "");
    a = /\brel="/.test(a)
      ? a.replace(/\brel="([^"]*)"/, (_, r) => `rel="${r.split(/\s+/).includes("noopener") ? r : (r + " noopener").trim()}"`)
      : a + ' rel="noopener"';
    return `<a${a} target="_blank">`;
  });
}

const files = [
  ...(await readdir(".")).filter((f) => f.endsWith(".html")),
  ...(await readdir("en")).filter((f) => f.endsWith(".html")).map((f) => `en/${f}`),
  ...(await readdir("es")).filter((f) => f.endsWith(".html")).map((f) => `es/${f}`),
];
const blocks = Object.fromEntries(Object.keys(LANGS).map((l) => [l, generated(l)]));

for (const file of files) {
  const page = pageOf(file);
  const lang = page?.lang ?? (file.startsWith("en/") ? "en" : file.startsWith("es/") ? "es" : "pt");
  let html = await readFile(file, "utf8");
  for (const [name, template] of Object.entries(templates)) {
    const out = render(template, file, lang, page);
    html = html.replace(block(name), (_, a, b) => `${a}\n${out}\n${b}`);
  }
  for (const [name, content] of Object.entries(blocks[lang])) {
    html = html.replace(block(name), (_, a, b) => `${a}\n${content}\n${b}`);
  }
  if (payload) html = html.replace(/(<code class="pix-code"[^>]*>)[^<]*(<\/code>)/g, (_, a, b) => a + payload + b);
  html = externalLinksInNewTab(html);
  await writeFile(file, html);
  console.log("ok", file);
}
