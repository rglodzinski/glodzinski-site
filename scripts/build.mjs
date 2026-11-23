// Injeta os trechos de partials/ nas páginas HTML da raiz, entre os
// marcadores <!-- @head -->…<!-- /@head --> (idem @header e @footer),
// e marca o link de navegação da página atual com aria-current.
// Gera, a partir de scripts/apps.mjs, os blocos @apps, @clients, @policies,
// @app-options e @deletion, e preenche o "Pix copia e cola" com
// assets/pix/payload.txt (gerado por `npm run pix`).
// Uso: npm run build   (rode depois de editar partials/ ou scripts/apps.mjs)
import { readFile, writeFile, readdir } from "node:fs/promises";
import { APPS, CLIENT_PROJECTS, links } from "./apps.mjs";

const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const ext = (url) => (url.startsWith("http") ? ' rel="noopener"' : "");
const arrow = (url) => (url.startsWith("http") ? " ↗" : "");
const icon = (a) =>
  `<div class="app-icon" style="background:linear-gradient(135deg,${a.colors[0]},${a.colors[1]})" aria-hidden="true">${esc(a.initials)}</div>`;

const generated = {
  apps: APPS.map((a) => {
    const l = links(a);
    const contact = a.contactName ?? a.name;
    return `<li class="reveal">
  <article class="app-card">
    <div class="app-top">${icon(a)}<div><h3>${esc(a.name)}</h3><span class="tag">${esc(a.tag)}</span></div></div>
    <p>${esc(a.description)}</p>
    <div class="app-links">
      <a href="${l.site}"${ext(l.site)}>Site${arrow(l.site)}</a>
      <a href="${l.privacy}"${ext(l.privacy)}>Privacidade${arrow(l.privacy)}</a>
      <a href="/?app=${encodeURIComponent(contact)}#contato">Suporte</a>
    </div>
  </article>
</li>`;
  }).join("\n"),
  clients: CLIENT_PROJECTS.map((c) => `<li class="reveal">
  <article class="app-card">
    <div class="app-top">${icon(c)}<div><h3>${esc(c.name)}</h3><span class="tag">${esc(c.tag)}</span></div></div>
    <p>${esc(c.description)}</p>
    <div class="app-links"><a href="${c.site}" rel="noopener">Visitar o site${arrow(c.site)}</a></div>
  </article>
</li>`).join("\n"),
  policies: APPS.map((a) => {
    const l = links(a);
    return `<li><a href="${l.privacy}"${ext(l.privacy)}>${esc(a.name)} <span>${l.privacy.startsWith("http") ? l.privacy.replace(/^https?:\/\//, "") : "nesta página"}</span></a></li>`;
  }).join("\n"),
  "app-options": ['<option value="">Nenhum em especial</option>',
    ...APPS.map((a) => `<option>${esc(a.contactName ?? a.name)}</option>`)].join("\n"),
  deletion: APPS.map((a) => {
    const how = a.deletion ?? "Peça pelo formulário de contato ou por e-mail, informando o app e o e-mail ou telefone usado na conta.";
    return `<li><strong>${esc(a.name)}:</strong> ${esc(how)}</li>`;
  }).join("\n"),
};

const parts = {};
for (const name of ["head", "header", "footer"]) {
  parts[name] = (await readFile(`partials/${name}.html`, "utf8")).trim();
}
let payload = null;
try { payload = (await readFile("assets/pix/payload.txt", "utf8")).trim(); } catch { /* sem Pix */ }

const pages = (await readdir(".")).filter((f) => f.endsWith(".html"));
for (const page of pages) {
  let html = await readFile(page, "utf8");
  for (const [name, content] of Object.entries(parts)) {
    let block = content;
    if (name === "header") {
      const self = page === "index.html" ? null : `/${page}`;
      if (self) block = block.replace(`<a href="${self}">`, `<a href="${self}" aria-current="page">`);
    }
    const re = new RegExp(`(<!-- @${name} -->)[\\s\\S]*?(<!-- /@${name} -->)`);
    html = html.replace(re, (_, a, b) => `${a}\n${block}\n${b}`);
  }
  for (const [name, content] of Object.entries(generated)) {
    const re = new RegExp(`(<!-- @${name} -->)[\\s\\S]*?(<!-- /@${name} -->)`, "g");
    html = html.replace(re, (_, a, b) => `${a}\n${content}\n${b}`);
  }
  if (payload) html = html.replace(/(<code class="pix-code"[^>]*>)[^<]*(<\/code>)/g, (_, a, b) => a + payload + b);
  await writeFile(page, html);
  console.log("ok", page);
}
