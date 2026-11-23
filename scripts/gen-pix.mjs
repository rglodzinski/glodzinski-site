// Gera o QR Code e o "Pix copia e cola" usados nas páginas de apoio.
// Saídas: assets/pix/qr.svg e assets/pix/payload.txt (ambos versionados).
// O site em si não roda JavaScript para isso: o código é estático.
import { mkdir, writeFile } from "node:fs/promises";
import QRCode from "qrcode";
import { PIX } from "./pix.config.mjs";
import { buildPixPayload } from "./pix.mjs";

const payload = buildPixPayload(PIX);
const svg = await QRCode.toString(payload, {
  type: "svg",
  margin: 1,
  errorCorrectionLevel: "M",
  color: { dark: "#111316", light: "#FFFFFF" },
});

await mkdir("assets/pix", { recursive: true });
await writeFile("assets/pix/qr.svg", svg);
await writeFile("assets/pix/payload.txt", payload + "\n");
console.log(payload);
console.log("\nQR e payload atualizados em assets/pix/.");
