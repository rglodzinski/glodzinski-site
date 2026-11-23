/**
 * BR Code Pix estático (padrão EMV do Banco Central), sem valor definido:
 * quem paga escolhe quanto enviar. Porta de `LimpaTudo/src/lib/pix.ts`.
 * Referência: Bacen, "Manual de Padrões para Iniciação do Pix".
 */

const tlv = (id, value) => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** Só ASCII maiúsculo, sem acentos — exigência do padrão. */
function sanitize(value, maxLength) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .slice(0, maxLength);
}

export function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload({ key, merchantName, merchantCity, txId = "***" }) {
  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", key);
  const withoutCrc =
    tlv("00", "01") + // Payload Format Indicator
    tlv("26", merchantAccountInfo) + // Merchant Account Information (Pix)
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Moeda: BRL
    tlv("58", "BR") + // País
    tlv("59", sanitize(merchantName, 25)) +
    tlv("60", sanitize(merchantCity, 15)) +
    tlv("62", tlv("05", sanitize(txId, 25) || "***")) +
    "6304"; // id + tamanho do CRC; o valor vem a seguir
  return withoutCrc + crc16(withoutCrc);
}
