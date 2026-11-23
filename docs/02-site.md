# Site: build, conteúdo e publicação

## Princípios

- **Estático e sem framework:** HTML/CSS/JS puros, carregamento instantâneo,
  nada para atualizar.
- **Visual sóbrio:** layout editorial (listas com fios finos), sem gradientes,
  sombras decorativas ou animações; a cor vem dos ícones dos apps.
- **Sem rastreamento:** sem cookies, analytics nem recursos de terceiros
  (as fontes são locais).
- **Funciona sem JavaScript:** o JS só adiciona tema, menu mobile, copiar Pix
  e o formulário. O conteúdo é HTML puro.
- **Tema claro/escuro:** segue o sistema; o botão salva a escolha no
  `localStorage` (com try/catch).

## Como o build funciona

Não há bundler. O `scripts/build.mjs` **reescreve as próprias páginas**,
trocando o conteúdo entre marcadores:

```mermaid
flowchart LR
    subgraph fontes
      P[partials/head.html<br>header.html<br>footer.html]
      A[scripts/apps.mjs]
      X[assets/pix/payload.txt]
    end
    B((npm run build))
    P --> B
    A --> B
    X --> B
    B --> H["*.html<br>(commitados)"]
```

| Marcador | Origem | Páginas |
|---|---|---|
| `<!-- @head -->` | `partials/head.html` | todas |
| `<!-- @header -->` | `partials/header.html` (+ `aria-current` na página atual) | todas |
| `<!-- @footer -->` | `partials/footer.html` | todas |
| `<!-- @hero-apps -->` | `APPS` (ícones no topo) | index |
| `<!-- @apps -->` | `APPS` em `scripts/apps.mjs` | index |
| `<!-- @clients -->` | `CLIENT_PROJECTS` | index |
| `<!-- @app-options -->` | `APPS` (select do formulário) | index |
| `<!-- @policies -->` | `APPS` (links de política) | privacidade |
| `<!-- @deletion -->` | `APPS` (instruções de exclusão) | exclusao-de-dados |
| `<code class="pix-code">` | `assets/pix/payload.txt` | index, apoie |

Não edite o conteúdo entre os marcadores: ele é sobrescrito no build. O HTML
gerado é commitado, então o GitHub Pages serve tudo sem precisar de CI.

## Idiomas

O site tem três versões: português na raiz, inglês em `/en/` e espanhol em
`/es/`. Cada página existe nos três idiomas, com nomes próprios:

| Página | pt-BR | en | es |
|---|---|---|---|
| Início | `/` | `/en/` | `/es/` |
| Apoie | `/apoie.html` | `/en/support.html` | `/es/apoyo.html` |
| Privacidade | `/privacidade.html` | `/en/privacy.html` | `/es/privacidad.html` |
| Exclusão de dados | `/exclusao-de-dados.html` | `/en/data-deletion.html` | `/es/eliminacion-de-datos.html` |

- **Fonte da verdade:** `scripts/i18n.mjs` tem o mapa de páginas (`PAGES`), os
  textos dos partials (`T`) e `localize()`, que traduz links internos escritos
  em português. Os apps têm `en`/`es` em `scripts/apps.mjs`.
- **Partials** usam `{{t.chave}}` e `{{href:página}}`; o build preenche cada um
  no idioma da página e gera os `<link rel="alternate" hreflang>` (com
  `x-default` → inglês) e o seletor BR · EN · ES no cabeçalho, com bandeiras em SVG
  (Brasil, Estados Unidos, Espanha; ficam em `FLAGS`, no `scripts/build.mjs`).
  Emojis de bandeira não aparecem no Windows, por isso o SVG.
- **Idioma do navegador:** na primeira visita, um script no `<head>` leva ao
  idioma do navegador (pt, en ou es; qualquer outro → en). Não age em robôs de
  busca (para não esconder as páginas em português do Google), nem mais de uma
  vez por sessão, nem depois de o visitante escolher um idioma no seletor
  (guardado em `localStorage.lang`).
- **Textos do `main.js`** (Pix, validação, mensagem do formulário) seguem o
  `lang` da página.
- **Privacidade:** as versões em inglês e espanhol são traduções de cortesia; a
  em português prevalece (aviso no topo de cada uma). Ao mudar a política,
  atualizar as três.
- **Ids das seções** (`#apps`, `#clientes`, `#contato`…) são os mesmos nos três
  idiomas, para os links gerados funcionarem igual.

## Links externos

O build acrescenta `target="_blank" rel="noopener"` a todo link para outro
site (inclusive os escritos à mão nas páginas). `mailto:`, `tel:` e links
internos abrem na mesma aba.

## SEO

O build gera `robots.txt` e `sitemap.xml` (cada página com as alternativas
pt-BR/en/es e x-default) a partir de `PAGES` em `scripts/i18n.mjs`; página nova
entra no sitemap ao ser adicionada ali. O domínio está no Google Search Console
(propriedade de domínio `glodzinski.dev.br`) e no Bing Webmaster Tools.

## Tarefas comuns

### Adicionar um app próprio

1. Coloque o ícone oficial do app em `assets/apps/<slug>.png` (quadrado, 192×192,
   sem cantos arredondados; o CSS arredonda).
2. Acrescente um item em `APPS` (`scripts/apps.mjs`): `slug`, `name`, `icon`, `tag`,
   `platforms` (opcional), `description`, `privacyPath` e, enquanto o subdomínio
   não existir, `live: false` + `fallback`. Se o app tiver domínio próprio, use `ownDomain`.
3. Preencha `en` e `es` (`tag`, `description` e, se houver, `deletion`).
4. `npm run build`.
5. Confira em `npm run dev` e faça commit.

### Adicionar um projeto de cliente

Acrescente em `CLIENT_PROJECTS` (`name`, `icon`, `tag`, `description`, `site`) e rode `npm run build`. Não entra em política nem no
formulário de contato.

### Mudar menu ou rodapé

Edite `partials/` e rode `npm run build`.

## Publicação

```mermaid
sequenceDiagram
    actor Dev as Ricardo
    participant Repo as GitHub (main)
    participant Pages as GitHub Pages
    participant DNS as glodzinski.dev.br
    Dev->>Dev: npm run build
    Dev->>Repo: git push
    Repo->>Pages: deploy automático (branch main, raiz)
    Pages-->>DNS: servido via CNAME
```

- O GitHub Pages publica a raiz da branch `main`. O `.nojekyll` desliga o
  Jekyll, então `docs/` e `scripts/` são servidos como arquivos estáticos,
  sem processamento.
- Links são absolutos a partir da raiz (`/style.css`), o que exige o domínio
  próprio (`CNAME`). Em `rglodzinski.github.io/glodzinski-site/` eles quebrariam.
- `404.html` é usado automaticamente pelo Pages.

## Checklist antes de publicar

- [ ] `npm run build` sem erros
- [ ] Testar no celular (menu, formulário abrindo o WhatsApp)
- [ ] Testar o Pix com o app de um banco (QR e copia e cola)
- [ ] Alternar o tema claro/escuro
