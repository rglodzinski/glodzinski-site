# glodzinski.dev.br

Site institucional da **Glodzinski Tecnologia LTDA**: apps, políticas de
privacidade, exclusão de dados, contato e doações via Pix.

HTML/CSS/JS estático, sem framework, publicado pelo GitHub Pages (domínio em `CNAME`).

```bash
npm install      # só para gerar o QR do Pix (lib qrcode)
npm run build    # injeta partials/ e o catálogo de apps nas páginas
npm run pix      # regera o QR e o "copia e cola" do Pix + build
npm run dev      # http://localhost:8080
```

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/00-visao-geral.md](docs/00-visao-geral.md) | Objetivo, mapa do site, estrutura de arquivos |
| [docs/01-identidade-visual.md](docs/01-identidade-visual.md) | Marca: conceito, logo, cores, tipografia, voz |
| [docs/02-site.md](docs/02-site.md) | Build, parciais, catálogo de apps, como publicar |
| [docs/03-doacoes-pix.md](docs/03-doacoes-pix.md) | Como funciona o Pix estático (igual ao Limpa Tudo) |
| [docs/04-subdominios.md](docs/04-subdominios.md) | Padrão `<app>.glodzinski.dev.br` e migração |
| [docs/05-contato-e-privacidade.md](docs/05-contato-e-privacidade.md) | Formulário de contato, LGPD, exclusão de dados |
