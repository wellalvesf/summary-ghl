# summary-ghl

Custom JS para o GoHighLevel (e white-labels). Adiciona um botão **📝 Summary**
na toolbar do composer da conversa que dispara um resumo da conversa via
backend `stevo-ia-v2`.

- Popup multilíngue (PT-BR, EN-US, ES, FR, IT, DE) com seletor de janela
  de dias (1–30).
- Auto-detecta o idioma do navegador na primeira abertura. Persiste a
  escolha em `localStorage`.
- A IA e o idioma do **resumo gerado** seguem a configuração da instância
  na Stevo (aba Configurações Gerais → "Resumo de Conversas (#summary)").
- Tolerante a DOM diferente (4 anchors em cascata + failsafe flutuante
  no canto inferior direito após 8s).

## Instalação

1. No GoHighLevel: Settings → Custom JS/CSS (na location ou na agência).
2. Cole o conteúdo de `summary-ghl.js` no campo **Custom JavaScript**.
3. Recarregue uma tela de conversa. O botão `📝 Summary` aparece na toolbar.

## Endpoint chamado

```
POST https://stevo-ia-v2.fly.dev/api/v2/summarize/from-ghl
{
  "locationId": "...",
  "conversationId": "...",   // ou contactId
  "days": 1
}
```

Body completo do payload e demais detalhes na doc da feature em
[`stevo` repo → docs/feature-summary-conversa.md](https://github.com/wellalvesf/stevo/blob/main/docs/feature-summary-conversa.md).

## Debug

No console (F12):

```js
__summaryGhlDebug()              // mostra estado interno
__summaryGhlSetLang('en-US')     // força idioma da UI
```
