const opentype = require("opentype.js");
const fs = require("fs");
// Gera o logotipo e o símbolo a partir da Inter Tight Bold, convertendo o texto
// em contornos (o SVG não depende de fonte instalada). Os "i" ganham pingos
// quadrados e o nome termina num ponto final quadrado na cor de destaque.
// Uso: npm run logo
const fontPath = process.argv[2] ?? "scripts/fonts/intertight-700.woff";
const outDir = process.argv[3] ?? "assets/brand";
const font = opentype.loadSync(fontPath);
const INK = "#111316", ACCENT = "#C93F1B";
const size = 100;

// medidas do pingo do "i" original
const iBox = font.getPath("i", 0, 0, size).getBoundingBox();
const dlBox = font.getPath("ı", 0, 0, size).getBoundingBox();
const stem = dlBox.x2 - dlBox.x1;            // largura da haste
const dotTop = iBox.y1, dotBottomGap = dlBox.y1; // y negativos (acima da baseline)

function wordmark(text, color, accent) {
  // troca i por ı e desenha pingos quadrados
  const glyphText = text.replace(/i/g, "ı");
  let x = 0, d = "", squares = [];
  const glyphs = font.stringToGlyphs(glyphText);
  const letterSpacing = -0.02 * size;
  glyphs.forEach((g, idx) => {
    const p = g.getPath(x, 0, size);
    d += p.toPathData(2);
    if (glyphText[idx] === "ı") {
      const bb = p.getBoundingBox();
      squares.push({ x: bb.x1, y: dotTop, s: stem });
    }
    let adv = g.advanceWidth * size / font.unitsPerEm + letterSpacing;
    if (idx < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[idx + 1]) * size / font.unitsPerEm;
    x += adv;
  });
  // ponto final quadrado, apoiado na baseline
  const px = x + stem * 0.35;
  squares.push({ x: px, y: -stem, s: stem, accent: true });
  const right = px + stem;
  const top = dotTop, bottom = font.getPath(glyphText, 0, 0, size).getBoundingBox().y2;
  const pad = 2;
  const vb = [-pad, top - pad, right + pad * 2, bottom - top + pad * 2].map((n) => +n.toFixed(2));
  const sq = squares.map((s) => `<rect x="${s.x.toFixed(2)}" y="${s.y.toFixed(2)}" width="${s.s.toFixed(2)}" height="${s.s.toFixed(2)}" fill="${s.accent ? accent : color}"/>`).join("");
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" width="${(vb[2]*0.4).toFixed(0)}" height="${(vb[3]*0.4).toFixed(0)}" role="img" aria-label="Glodzinski"><path d="${d}" fill="${color}"/>${sq}</svg>\n`, stem };
}

function mark(bg, fg, accent, radius = 14) {
  // "g" minúsculo + ponto quadrado, num quadrado
  const gs = 52;
  const gp = font.getPath("g", 0, 0, gs);
  const bb = gp.getBoundingBox();
  const st = stem * gs / size;
  const totalW = (bb.x2 - bb.x1) + st * 0.35 + st;
  const ox = (64 - totalW) / 2 - bb.x1;
  const oy = 32 - (bb.y1 + bb.y2) / 2;
  const p = font.getPath("g", ox, oy, gs);
  const xDot = ox + bb.x2 + st * 0.35;
  const baseline = oy;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Glodzinski">${bg ? `<rect width="64" height="64" rx="${radius}" fill="${bg}"/>` : ""}<path d="${p.toPathData(2)}" fill="${fg}"/><rect x="${xDot.toFixed(2)}" y="${(baseline - st).toFixed(2)}" width="${st.toFixed(2)}" height="${st.toFixed(2)}" fill="${accent}"/></svg>\n`;
}

fs.writeFileSync(`${outDir}/logo.svg`, wordmark("glodzinski", INK, ACCENT).svg);
fs.writeFileSync(`${outDir}/logo-white.svg`, wordmark("glodzinski", "#FFFFFF", "#FF6A3D").svg);
fs.writeFileSync(`${outDir}/logo-mono.svg`, wordmark("glodzinski", "currentColor", "currentColor").svg);
fs.writeFileSync(`${outDir}/mark.svg`, mark(INK, "#FFFFFF", "#FF6A3D"));
fs.writeFileSync(`${outDir}/mark-light.svg`, mark("#FFFFFF", INK, ACCENT));
fs.writeFileSync(`${outDir}/mark-mono.svg`, mark(null, "currentColor", "currentColor"));
console.log("ok");
