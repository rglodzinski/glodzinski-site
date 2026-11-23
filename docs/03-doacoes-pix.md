# Doações via Pix

Implementação **igual à do Limpa Tudo** (`LimpaTudo/src/lib/pix.ts`):
um **BR Code Pix estático, sem valor definido**. Quem paga escolhe quanto
enviar, sem intermediário, sem taxa e sem API de banco.

A diferença está no momento em que o código é gerado. No app, o QR é
desenhado em tempo de execução. Aqui ele é gerado **uma vez, no build**
(`npm run pix`), e o site serve um `qr.svg` fixo. O navegador do visitante
não roda nenhum código de Pix.

## Fluxo

```mermaid
sequenceDiagram
    autonumber
    participant Cfg as scripts/pix.config.mjs
    participant Gen as npm run pix
    participant Site as apoie.html / index.html
    actor V as Visitante
    participant Banco as App do banco
    Cfg->>Gen: chave, nome, cidade, txid
    Gen->>Gen: monta BR Code (EMV) + CRC16
    Gen->>Site: assets/pix/qr.svg + payload no "copia e cola"
    V->>Site: abre /apoie.html
    alt Celular de outra pessoa / computador
        V->>Banco: lê o QR Code
    else No próprio celular
        V->>Site: "Copiar Pix copia e cola"
        V->>Banco: cola o código
    end
    Banco->>V: mostra recebedor "RICARDO GLODZINSKI"
    V->>Banco: digita o valor e confirma
    Banco-->>Cfg: crédito na conta da chave, txid GLODSITE no extrato
```

## Configuração

`scripts/pix.config.mjs`:

| Campo | Valor | Observação |
|---|---|---|
| `key` | `04765662900` | Mesma chave do Limpa Tudo (CPF) |
| `merchantName` | `Ricardo Glodzinski` | Vira `RICARDO GLODZINSKI` (máx. 25, ASCII maiúsculo) |
| `merchantCity` | `Florianopolis` | Máx. 15 caracteres |
| `txId` | `GLODSITE` | Mostra no extrato que a doação veio do site |

Depois de mudar: `npm run pix` (gera o QR e roda o build) e commit de
`assets/pix/` e dos HTML.

> ⚠️ **A chave é um CPF e fica pública** (no QR e no repositório, que é público),
> como no Limpa Tudo. O `docs/10-monetizacao.md` do Limpa Tudo recomenda usar uma
> **chave aleatória ou o CNPJ** numa conta separada. Para trocar, basta mudar `key`
> (e `merchantName` para `Glodzinski Tecnologia`, se for a conta PJ) e rodar `npm run pix`.

## Estrutura do payload (EMV)

```mermaid
flowchart LR
    A["00 Formato = 01"] --> B["26 Conta Pix<br>00 br.gov.bcb.pix<br>01 chave"]
    B --> C["52 MCC = 0000"] --> D["53 Moeda = 986 (BRL)"] --> E["58 País = BR"]
    E --> F["59 Nome"] --> G["60 Cidade"] --> H["62 Dados adicionais<br>05 txid"] --> I["63 CRC16-CCITT"]
```

Cada campo é `ID (2) + tamanho (2) + valor`. Não há o campo `54` (valor), por
isso o pagador digita quanto quiser. O CRC é CRC16-CCITT-FALSE (polinômio
`0x1021`, início `0xFFFF`), validado com o vetor de teste `123456789 → 29B1`.

## Atribuição sem rastreamento

Seguindo o plano do Limpa Tudo, cada origem usa um `txid` diferente e o
extrato mostra de onde veio a doação:

| Origem | txid |
|---|---|
| Site institucional | `GLODSITE` |
| Limpa Tudo (app) | `***` (padrão; sugestão do plano: `LTAPP`) |

## Regras de loja

Um QR de Pix ou link de doação **dentro de apps da App Store** (fora dos EUA)
viola a regra 3.1.1. Nos apps iOS, gorjeta só por compra no app (IAP).
Este site está fora da loja e não tem essa restrição, mas **não coloque link
para `/apoie.html` dentro de apps iOS**.
