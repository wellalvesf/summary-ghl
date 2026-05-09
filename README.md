# summary-ghl

Custom JS para o GoHighLevel (e white-labels). Adiciona um botão **✨ Summary**
na toolbar do composer da conversa que dispara um resumo da conversa via
backend `stevo-ia-v2`.

- Botão **icon-only** (18×18 sparkles SVG), discreto e alinhado com os
  demais ícones da toolbar do composer.
- Popup multilíngue (PT-BR, EN-US, ES, FR, IT, DE) com seletor de janela
  de dias (1–30).
- Auto-detecta o idioma do navegador na primeira abertura. Persiste a
  escolha em `localStorage` (`smry-ui-lang`).
- A IA e o idioma do **resumo gerado** seguem a configuração da instância
  na Stevo (aba Configurações Gerais → "Resumo de Conversas (#summary)").
- Anchor primário: `#sw-selector` (dropdown do switch v3) — mesmo timing,
  mesma região, sem depender de classes Tailwind exatas. Fallback: o
  seletor original do `#composer-textarea`.
- Sanity check: o anchor precisa estar **dentro** de `#composer-textarea`,
  então o botão só aparece quando o composer está aberto.

## Arquivos

| Arquivo | O que é |
|---|---|
| `summary-ghl.js` | **Versão obfuscada/minificada** — é essa que vai pro Custom JS do GHL. |
| `summary-ghl-original.js` | Código fonte legível (referência interna). |

## Instalação no GHL

### Opção A — colar o conteúdo direto (mais rápido)

1. GHL → Settings → Custom JS/CSS (na location ou na agência).
2. Cole o conteúdo de `summary-ghl.js` (a versão obfuscada) no campo
   **Custom JavaScript**. Salve.
3. Recarregue uma tela de conversa, abra o composer (clique em "Digite
   uma mensagem…"). O ícone ✨ aparece dentro da toolbar do composer.

### Opção B — incluir via `<script src>` (GitHub Pages)

Hospedado em GitHub Pages, basta uma única linha no Custom JS:

```html
<script src="https://wellalvesf.github.io/summary-ghl/summary-ghl.js" defer></script>
```

Cada `git push` na branch `main` republica em segundos.

> ⚠️ Em alguns clientes o GHL exige que o Custom JS seja JS puro
> (sem `<script>`). Nesse caso use:
> ```js
> (function(){var s=document.createElement('script');s.src='https://wellalvesf.github.io/summary-ghl/summary-ghl.js';s.defer=true;document.head.appendChild(s);})();
> ```

## Endpoint chamado

```
POST https://stevo-ia-v2.fly.dev/api/v2/summarize/from-ghl
{
  "locationId": "...",
  "conversationId": "...",   // ou contactId
  "days": 1
}
```

`provider` e `language` do **resumo gerado** são resolvidos no backend
a partir das colunas `ai_summary_provider` / `ai_summary_language` da
tabela `instances` (configuradas no front da Stevo). O front-end no
GHL não envia esses campos.

Detalhes completos da feature em
[`stevo` → docs/feature-summary-conversa.md](https://github.com/wellalvesf/stevo/blob/main/docs/feature-summary-conversa.md).

## Debug

No console (F12) do GHL:

```js
__summaryGhlDebug()              // mostra estado interno
__summaryGhlSetLang('en-US')     // troca idioma da UI on-the-fly
```
