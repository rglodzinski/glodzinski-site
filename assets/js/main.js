// Glodzinski Tecnologia — comportamento do site. Sem dependências e sem
// rastreamento: nada aqui envia dados para servidor algum.
(() => {
  const root = document.documentElement;
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

  // ---- Ano no rodapé ----
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---- Animação de entrada ----
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

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
      const card = btn.closest(".pix-card");
      const payload = card.querySelector(".pix-code").textContent.trim();
      const msg = card.querySelector(".copied-msg");
      const ok = await copy(payload);
      msg.textContent = ok ? "Código copiado! Cole no app do seu banco, em Pix › Copia e Cola." : "Não deu para copiar — selecione o código acima.";
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
        name: (v) => v.trim().length >= 2 || "Diga como podemos te chamar.",
        email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Esse e-mail parece incompleto.",
        message: (v) => v.trim().length >= 10 || "Conte um pouco mais (mínimo de 10 caracteres).",
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
        `Olá! Meu nome é ${f.name.value.trim()}.`,
        `Assunto: ${f.subject.value}`,
        f.app.value ? `App: ${f.app.value}` : null,
        f.email.value.trim() ? `E-mail para retorno: ${f.email.value.trim()}` : null,
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
