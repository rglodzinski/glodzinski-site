// Injeta os trechos de partials/ nas páginas HTML da raiz, entre os
// marcadores <!-- @head -->…<!-- /@head --> (idem @header e @footer),
// e marca o link de navegação da página atual com aria-current.
// Gera, a partir de scripts/apps.mjs, os blocos @hero-apps, @apps, @clients,
// @policies, @app-options e @deletion, e preenche o "Pix copia e cola" com
// assets/pix/payload.txt (gerado por `npm run pix`).
// Uso: npm run build   (rode depois de editar partials/ ou scripts/apps.mjs)
import { readFile, writeFile, readdir } from "node:fs/promises";
import { APPS, CLIENT_PROJECTS, links } from "./apps.mjs";

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const isExt = (url) => url.startsWith("http");
const host = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const icon = (a, size) =>
  `<img class="app-icon" src="${a.icon}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">`;
const contactName = (a) => a.contactName ?? a.name;

const generated = {
  "hero-apps": APPS.map((a) => {
    const l = links(a);
    return `<a href="${l.site}"${isExt(l.site) ? ' rel="noopener"' : ""}>${icon(a, 56)}<span>${esc(a.name)}<small>${esc(a.tag)}</small></span></a>`;
  }).join("\n"),

  apps: APPS.map((a) => {
    const l = links(a);
    return `<li class="app-row" id="app-${a.slug}">
  ${icon(a, 64)}
  <div>
    <h3>${esc(a.name)} <small>${esc([a.tag, a.platforms].filter(Boolean).join(" · "))}</small></h3>
    <p>${esc(a.description)}</p>
  </div>
  <div class="app-meta">
    <a href="${l.site}"${isExt(l.site) ? ' rel="noopener"' : ""} aria-label="Site do ${esc(a.name)}">Site ↗</a>
    <a href="${l.privacy}"${isExt(l.privacy) ? ' rel="noopener"' : ""}>Privacidade</a>
    <a href="/?app=${encodeURIComponent(contactName(a))}#contato">Suporte</a>
  </div>
</li>`;
  }).join("\n"),

  clients: CLIENT_PROJECTS.map((c) => `<li class="app-row">
  ${icon(c, 48)}
  <div>
    <h3>${esc(c.name)} <small>${esc(c.tag)}</small></h3>
    <p>${esc(c.description)}</p>
  </div>
  <div class="app-meta"><a href="${c.site}" rel="noopener">${esc(host(c.site))} ↗</a></div>
</li>`).join("\n"),

  policies: APPS.map((a) => {
    const l = links(a);
    const where = isExt(l.privacy) ? host(l.privacy) : "nesta página";
    return `<li><a href="${l.privacy}"${isExt(l.privacy) ? ' rel="noopener"' : ""}>${icon(a, 32)}${esc(a.name)}<span class="url">${esc(where)}</span></a></li>`;
  }).join("\n"),

  "app-options": ['<option value="">Nenhum em especial</option>',
    ...APPS.map((a) => `<option>${esc(contactName(a))}</option>`)].join("\n"),

  deletion: APPS.map((a) => {
    const how = a.deletion ?? "Peça pelo formulário de contato ou por e-mail, informando o e-mail ou telefone usado no app.";
    return `<li><strong>${esc(a.name)}.</strong> ${esc(how)}</li>`;
  }).join("\n"),
};

// Logo inline: letras em currentColor e ponto final na cor de destaque (CSS),
// para acompanhar o tema claro/escuro.
const logoInline = (await readFile("assets/brand/logo.svg", "utf8")).trim()
  .replace(/ width="\d+" height="\d+"/, "")
  .replace(' role="img" aria-label="Glodzinski"', ' aria-hidden="true" focusable="false"')
  .replace(/fill="#111316"/g, 'fill="currentColor"')
  .replace(/fill="#C93F1B"/g, 'class="dot"');

const parts = {};
for (const name of ["head", "header", "footer"]) {
  parts[name] = (await readFile(`partials/${name}.html`, "utf8")).trim().replaceAll("{{logo}}", logoInline);
}
let payload = null;
try { payload = (await readFile("assets/pix/payload.txt", "utf8")).trim(); } catch { /* sem Pix */ }

const block = (name) => new RegExp(`(<!-- @${name} -->)[\\s\\S]*?(<!-- /@${name} -->)`, "g");

const pages = (await readdir(".")).filter((f) => f.endsWith(".html"));
for (const page of pages) {
  let html = await readFile(page, "utf8");
  for (const [name, content] of Object.entries(parts)) {
    let out = content;
    if (name === "header" && page !== "index.html") {
      out = out.replace(`<a href="/${page}">`, `<a href="/${page}" aria-current="page">`);
    }
    html = html.replace(block(name), (_, a, b) => `${a}\n${out}\n${b}`);
  }
  for (const [name, content] of Object.entries(generated)) {
    html = html.replace(block(name), (_, a, b) => `${a}\n${content}\n${b}`);
  }
  if (payload) html = html.replace(/(<code class="pix-code"[^>]*>)[^<]*(<\/code>)/g, (_, a, b) => a + payload + b);
  await writeFile(page, html);
  console.log("ok", page);
}
