// Glodzinski Tecnologia — comportamento do site. Sem dependências e sem
// rastreamento: nada aqui envia dados para servidor algum.
(() => {
  const root = document.documentElement;
  const lang = root.lang.slice(0, 2) === "en" ? "en" : root.lang.slice(0, 2) === "es" ? "es" : "pt";
  const T = {
    pt: {
      copied: "Código copiado. Cole no app do seu banco, em Pix Copia e Cola.",
      copyFail: "Não foi possível copiar. Selecione o código acima.",
      name: "Diga como podemos te chamar.",
      email: "Esse e-mail parece incompleto.",
      message: "Conte um pouco mais (mínimo de 10 caracteres).",
      hello: (n) => `Olá! Meu nome é ${n}.`, subject: "Assunto", app: "App", reply: "E-mail para retorno",
    },
    en: {
      copied: "Code copied. Paste it in your bank app, under Pix Copia e Cola.",
      copyFail: "Couldn't copy. Select the code above.",
      name: "Tell us what to call you.",
      email: "This email looks incomplete.",
      message: "Tell us a bit more (at least 10 characters).",
      hello: (n) => `Hi! My name is ${n}.`, subject: "Subject", app: "App", reply: "Reply-to email",
    },
    es: {
      copied: "Código copiado. Pégalo en la app de tu banco, en Pix Copia e Cola.",
      copyFail: "No se pudo copiar. Selecciona el código de arriba.",
      name: "Dinos cómo podemos llamarte.",
      email: "Ese correo parece incompleto.",
      message: "Cuéntanos un poco más (mínimo 10 caracteres).",
      hello: (n) => `¡Hola! Me llamo ${n}.`, subject: "Asunto", app: "App", reply: "Correo de respuesta",
    },
  }[lang];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem storage */ } },
  };

  // ---- Tema claro/escuro (o valor salvo já foi aplicado no <head>) ----
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = root.dataset.theme ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      store.set("theme", next);
    });
  });

  // ---- Menu mobile ----
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  // ---- Idioma escolhido no seletor vale para as próximas visitas ----
  document.querySelectorAll(".lang-switch a[data-lang]").forEach((a) => {
    a.addEventListener("click", () => store.set("lang", a.dataset.lang));
  });

  // ---- Ano no rodapé ----
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---- Pix copia e cola ----
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fallback abaixo */ }
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
  document.querySelectorAll("[data-pix-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const card = btn.closest("[data-pix]");
      const payload = card.querySelector(".pix-code").textContent.trim();
      const msg = card.querySelector(".copied-msg");
      const ok = await copy(payload);
      msg.textContent = ok ? T.copied : T.copyFail;
    });
  });

  // ---- Formulário de contato (WhatsApp ou e-mail; nada é armazenado) ----
  const form = document.getElementById("contact-form");
  if (form) {
    const PHONE = form.dataset.phone;
    const EMAIL = form.dataset.email;
    const params = new URLSearchParams(location.search);
    if (params.get("app")) { const sel = form.elements.app; if ([...sel.options].some((o) => o.value === params.get("app"))) sel.value = params.get("app"); }
    if (params.get("assunto")) { const sel = form.elements.subject; if ([...sel.options].some((o) => o.value === params.get("assunto"))) sel.value = params.get("assunto"); }

    function validate() {
      let ok = true;
      const rules = {
        name: (v) => v.trim().length >= 2 || T.name,
        email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || T.email,
        message: (v) => v.trim().length >= 10 || T.message,
      };
      for (const [name, rule] of Object.entries(rules)) {
        const input = form.elements[name];
        const res = rule(input.value);
        const err = form.querySelector(`[data-err="${name}"]`);
        if (res !== true) { ok = false; err.textContent = res; input.setAttribute("aria-invalid", "true"); }
        else { err.textContent = ""; input.removeAttribute("aria-invalid"); }
      }
      if (!ok) form.querySelector('[aria-invalid="true"]').focus();
      return ok;
    }

    function compose() {
      const f = form.elements;
      const lines = [
        T.hello(f.name.value.trim()),
        `${T.subject}: ${f.subject.value}`,
        f.app.value ? `${T.app}: ${f.app.value}` : null,
        f.email.value.trim() ? `${T.reply}: ${f.email.value.trim()}` : null,
        "",
        f.message.value.trim(),
      ].filter((l) => l !== null);
      return { subject: `[Site] ${f.subject.value}${f.app.value ? " — " + f.app.value : ""}`, body: lines.join("\n") };
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      const { subject, body } = compose();
      const via = e.submitter?.value || "whatsapp";
      const url = via === "email"
        ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        : `https://wa.me/${PHONE}?text=${encodeURIComponent(body)}`;
      if (via === "email") location.href = url; else window.open(url, "_blank", "noopener");
    });
  }
})();
