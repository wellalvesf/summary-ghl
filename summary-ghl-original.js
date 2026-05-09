/*  HighLevel – Custom JS · Summary Button v3
 *  Botão "📝 Summary" na toolbar do composer.
 *  Abre popup multilíngue (PT/EN/ES/FR/IT/DE) com seletor de janela
 *  de dias e chama o backend stevo-ia-v2.
 *
 *  Front envia apenas { locationId, conversationId | contactId, days }.
 *  Provider e idioma do RESUMO seguem a configuração da instância
 *  na Stevo. O idioma do POPUP é independente, escolhido pelo
 *  operador via bandeirinhas no topo (persistido em localStorage).
 *
 *  Repo: https://github.com/wellalvesf/summary-ghl
 */
(function () {
    /* ─── Config ─── */
    const API_URL = 'https://stevo-ia-v2.fly.dev/api/v2/summarize/from-ghl';
    const LANG_STORAGE_KEY = 'smry-ui-lang';
    const LOG = (...a) => console.log('[Summary]', ...a);
    const WARN = (...a) => console.warn('[Summary]', ...a);
    const ERR = (...a) => console.error('[Summary]', ...a);
  
    /* ─── i18n ─── */
    // O LLM já entende qualquer idioma. Aqui é só pra UI do popup.
    // Adicione novos idiomas livremente — basta seguir o mesmo schema.
    const I18N = {
      'pt-BR': {
        flag: '🇧🇷',
        label: 'Português',
        title: 'Gerar Resumo',
        btnLabel: 'Summary',
        btnTitle: 'Gerar resumo da conversa',
        periodLabel: 'Período da conversa',
        dayOne: 'dia',
        dayMany: 'dias',
        hint: 'A IA e o idioma do resumo seguem a configuração da sua instância na Stevo.',
        generate: 'Gerar Resumo',
        generating: 'Gerando...',
        sending: 'Enviando pro backend...',
        sent: 'Enviado!',
        success: 'Resumo a caminho! Aparece na conversa em alguns segundos.',
        retry: 'Tentar novamente',
        genericError: 'Erro desconhecido',
        noLocation: 'Não consegui identificar a location na URL.',
        noConversation: 'Abra uma conversa ou um contato antes de pedir o resumo.',
      },
      'en-US': {
        flag: '🇺🇸',
        label: 'English',
        title: 'Generate Summary',
        btnLabel: 'Summary',
        btnTitle: 'Generate conversation summary',
        periodLabel: 'Conversation window',
        dayOne: 'day',
        dayMany: 'days',
        hint: 'Summary AI and language follow the configuration of your instance in Stevo.',
        generate: 'Generate Summary',
        generating: 'Generating...',
        sending: 'Sending to backend...',
        sent: 'Sent!',
        success: 'Summary on the way! It will appear in the conversation in a few seconds.',
        retry: 'Try again',
        genericError: 'Unknown error',
        noLocation: 'Could not identify the location in the URL.',
        noConversation: 'Open a conversation or contact before requesting a summary.',
      },
      'es-ES': {
        flag: '🇪🇸',
        label: 'Español',
        title: 'Generar Resumen',
        btnLabel: 'Summary',
        btnTitle: 'Generar resumen de la conversación',
        periodLabel: 'Período de la conversación',
        dayOne: 'día',
        dayMany: 'días',
        hint: 'La IA y el idioma del resumen siguen la configuración de tu instancia en Stevo.',
        generate: 'Generar Resumen',
        generating: 'Generando...',
        sending: 'Enviando al backend...',
        sent: '¡Enviado!',
        success: '¡Resumen en camino! Aparecerá en la conversación en unos segundos.',
        retry: 'Intentar de nuevo',
        genericError: 'Error desconocido',
        noLocation: 'No pude identificar la location en la URL.',
        noConversation: 'Abre una conversación o un contacto antes de pedir el resumen.',
      },
      'fr-FR': {
        flag: '🇫🇷',
        label: 'Français',
        title: 'Générer le Résumé',
        btnLabel: 'Summary',
        btnTitle: 'Générer le résumé de la conversation',
        periodLabel: 'Période de la conversation',
        dayOne: 'jour',
        dayMany: 'jours',
        hint: "L'IA et la langue du résumé suivent la configuration de votre instance dans Stevo.",
        generate: 'Générer le Résumé',
        generating: 'Génération...',
        sending: 'Envoi au backend...',
        sent: 'Envoyé !',
        success: 'Résumé en route ! Il apparaîtra dans la conversation dans quelques secondes.',
        retry: 'Réessayer',
        genericError: 'Erreur inconnue',
        noLocation: "Impossible d'identifier la location dans l'URL.",
        noConversation: 'Ouvrez une conversation ou un contact avant de demander le résumé.',
      },
      'it-IT': {
        flag: '🇮🇹',
        label: 'Italiano',
        title: 'Genera Riepilogo',
        btnLabel: 'Summary',
        btnTitle: 'Genera riepilogo della conversazione',
        periodLabel: 'Periodo della conversazione',
        dayOne: 'giorno',
        dayMany: 'giorni',
        hint: "L'IA e la lingua del riepilogo seguono la configurazione della tua istanza su Stevo.",
        generate: 'Genera Riepilogo',
        generating: 'Generazione...',
        sending: 'Invio al backend...',
        sent: 'Inviato!',
        success: 'Riepilogo in arrivo! Apparirà nella conversazione in pochi secondi.',
        retry: 'Riprova',
        genericError: 'Errore sconosciuto',
        noLocation: 'Impossibile identificare la location nell\'URL.',
        noConversation: 'Apri una conversazione o un contatto prima di chiedere il riepilogo.',
      },
      'de-DE': {
        flag: '🇩🇪',
        label: 'Deutsch',
        title: 'Zusammenfassung erstellen',
        btnLabel: 'Summary',
        btnTitle: 'Zusammenfassung der Unterhaltung erstellen',
        periodLabel: 'Zeitraum der Unterhaltung',
        dayOne: 'Tag',
        dayMany: 'Tage',
        hint: 'KI und Sprache der Zusammenfassung folgen der Konfiguration Ihrer Instanz in Stevo.',
        generate: 'Zusammenfassung erstellen',
        generating: 'Wird erstellt...',
        sending: 'Wird gesendet...',
        sent: 'Gesendet!',
        success: 'Zusammenfassung ist unterwegs! Sie erscheint in wenigen Sekunden in der Unterhaltung.',
        retry: 'Erneut versuchen',
        genericError: 'Unbekannter Fehler',
        noLocation: 'Location in der URL konnte nicht identifiziert werden.',
        noConversation: 'Öffne eine Unterhaltung oder einen Kontakt, bevor du eine Zusammenfassung anforderst.',
      },
    };
    const SUPPORTED_LANGS = Object.keys(I18N);
    const DEFAULT_LANG = 'en-US';
  
    const detectLang = () => {
      try {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (stored && I18N[stored]) return stored;
      } catch {}
  
      const candidates = [
        ...(navigator.languages || []),
        navigator.language || '',
      ];
      for (const c of candidates) {
        if (!c) continue;
        // exact match (pt-BR, en-US, ...)
        if (I18N[c]) return c;
        // prefix match (pt → pt-BR, en → en-US)
        const prefix = c.split('-')[0].toLowerCase();
        const found = SUPPORTED_LANGS.find((k) => k.toLowerCase().startsWith(prefix));
        if (found) return found;
      }
      return DEFAULT_LANG;
    };
  
    let uiLang = detectLang();
    const t = () => I18N[uiLang] || I18N[DEFAULT_LANG];
  
    const setLang = (lang) => {
      if (!I18N[lang]) return;
      uiLang = lang;
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {}
      refreshButton();
    };
  
    /* ─── URL helpers ─── */
    const getLocationId = () =>
      (window.location.pathname.match(/location\/([\w-]+)/) || [])[1] || null;
  
    const getConversationId = () =>
      (window.location.pathname.match(
        /conversations\/(?:conversations\/)?([\w-]+)/,
      ) || [])[1] || null;
  
    const getContactId = () =>
      (window.location.pathname.match(/contacts\/detail\/([\w-]+)/) || [])[1] ||
      null;
  
    /* ─── State ─── */
    let popupOpen = false;
  
    /* ─── CSS (1x) ─── */
    const injectCss = () => {
      if (document.getElementById('smry-css')) return;
      const s = document.createElement('style');
      s.id = 'smry-css';
      s.textContent = `
        #smry-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:1px solid transparent;border-radius:6px;background:transparent;color:#6b7280;cursor:pointer;transition:all .15s;margin:0 2px;flex-shrink:0;font-family:inherit;box-sizing:border-box;line-height:1}
        #smry-btn:hover{background:#eef2ff;border-color:#c7d2fe;color:#4f46e5}
        #smry-btn:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
        #smry-btn:active{transform:translateY(.5px)}
        #smry-btn .smry-ic{display:inline-flex;width:18px;height:18px;color:currentColor;flex-shrink:0}
        #smry-overlay{position:fixed;inset:0;z-index:99998;background:transparent}
        #smry-pop{position:fixed;z-index:99999;width:300px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.18);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;animation:smryIn .18s ease-out;overflow:hidden}
        @keyframes smryIn{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .smry-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff}
        .smry-hd-t{font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}
        .smry-x{background:rgba(255,255,255,.2);border:none;color:#fff;cursor:pointer;font-size:14px;padding:2px 8px;border-radius:4px;line-height:1}
        .smry-x:hover{background:rgba(255,255,255,.35)}
        .smry-langs{display:flex;align-items:center;justify-content:center;gap:2px;padding:6px 8px;background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%);border-bottom:1px solid #e5e7eb}
        .smry-flag{cursor:pointer;font-size:18px;padding:4px 6px;border-radius:6px;border:1px solid transparent;line-height:1;transition:all .15s;background:transparent;opacity:.55;filter:grayscale(.3)}
        .smry-flag:hover{opacity:1;background:#fff;filter:none;transform:scale(1.1)}
        .smry-flag.active{opacity:1;background:#fff;border-color:#c7d2fe;box-shadow:0 1px 3px rgba(99,102,241,.2);filter:none}
        .smry-bd{padding:14px;display:flex;flex-direction:column;gap:10px}
        .smry-f{display:flex;flex-direction:column;gap:4px}
        .smry-lb{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
        .smry-sel{appearance:none;-webkit-appearance:none;height:34px;padding:0 28px 0 10px;font-size:13px;border:1px solid #d1d5db;border-radius:7px;background:#f9fafb url("data:image/svg+xml,%3Csvg fill='%236b7280' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z'/%3E%3C/svg%3E") no-repeat right 8px center/10px 6px;color:#374151;cursor:pointer;width:100%;box-sizing:border-box;font-weight:500}
        .smry-sel:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
        .smry-hint{font-size:11px;color:#6b7280;line-height:1.4;padding:6px 8px;background:#f3f4f6;border-radius:6px;border-left:3px solid #6366f1}
        #smry-go{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:38px;font-size:14px;font-weight:700;border:none;border-radius:8px;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;cursor:pointer;transition:all .15s;margin-top:4px}
        #smry-go:hover:not(:disabled){background:linear-gradient(135deg,#4f46e5,#6366f1);box-shadow:0 2px 8px rgba(99,102,241,.4)}
        #smry-go:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .smry-st{text-align:center;font-size:12px;font-weight:500;padding:8px 10px;border-radius:6px;display:none;line-height:1.35}
        .smry-st.ld{display:block;color:#6366f1;background:#eef2ff}
        .smry-st.ok{display:block;color:#059669;background:#ecfdf5}
        .smry-st.er{display:block;color:#dc2626;background:#fef2f2}
        @keyframes smrySpin{to{transform:rotate(360deg)}}
        .smry-sp{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:smrySpin .6s linear infinite;vertical-align:middle}
      `;
      document.head.appendChild(s);
    };
  
    /* ─── Backend call ─── */
    const callSummarize = async (body) => {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      let data;
      try {
        data = await r.json();
      } catch {
        data = null;
      }
      if (!r.ok) {
        throw new Error((data && (data.error || data.message)) || 'HTTP ' + r.status);
      }
      return data;
    };
  
    /* ─── Popup ─── */
    const closePopup = () => {
      document.getElementById('smry-overlay')?.remove();
      document.getElementById('smry-pop')?.remove();
      popupOpen = false;
    };
  
    const buildDays = () => {
      const tr = t();
      let h = '';
      for (let d = 1; d <= 30; d++) {
        const word = d === 1 ? tr.dayOne : tr.dayMany;
        h += `<option value="${d}"${d === 1 ? ' selected' : ''}>${d} ${word}</option>`;
      }
      return h;
    };
  
    const buildLangBar = () => {
      return SUPPORTED_LANGS.map(
        (k) =>
          `<button class="smry-flag${k === uiLang ? ' active' : ''}" data-lang="${k}" type="button" title="${I18N[k].label}">${I18N[k].flag}</button>`,
      ).join('');
    };
  
    const renderPopup = (pop) => {
      const tr = t();
      pop.innerHTML = `
        <div class="smry-hd">
          <span class="smry-hd-t">📝 ${tr.title}</span>
          <button class="smry-x" id="smry-xb" type="button">✕</button>
        </div>
        <div class="smry-langs" id="smry-langs">${buildLangBar()}</div>
        <div class="smry-bd">
          <div class="smry-f">
            <label class="smry-lb">${tr.periodLabel}</label>
            <select class="smry-sel" id="smry-days">${buildDays()}</select>
          </div>
          <div class="smry-hint">${tr.hint}</div>
          <button id="smry-go" type="button">📝 ${tr.generate}</button>
          <div class="smry-st" id="smry-fb"></div>
        </div>
      `;
  
      pop.querySelector('#smry-xb').onclick = closePopup;
  
      // Bandeirinhas — troca o idioma da UI e re-renderiza o popup
      pop.querySelectorAll('.smry-flag').forEach((f) => {
        f.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const lang = f.getAttribute('data-lang');
          if (lang && lang !== uiLang) {
            // preserva o valor selecionado de dias na re-render
            const currentDays = pop.querySelector('#smry-days')?.value;
            setLang(lang);
            renderPopup(pop);
            if (currentDays) pop.querySelector('#smry-days').value = currentDays;
          }
        };
      });
  
      pop.querySelector('#smry-go').onclick = async () => {
        const tr2 = t();
        const goBtn = pop.querySelector('#smry-go');
        const fb = pop.querySelector('#smry-fb');
        const days = +pop.querySelector('#smry-days').value;
  
        const locationId = getLocationId();
        const conversationId = getConversationId();
        const contactId = getContactId();
  
        goBtn.disabled = true;
        goBtn.innerHTML = `<span class="smry-sp"></span> ${tr2.generating}`;
        fb.className = 'smry-st ld';
        fb.textContent = '⏳ ' + tr2.sending;
  
        const body = { locationId, days };
        if (conversationId) body.conversationId = conversationId;
        if (contactId) body.contactId = contactId;
  
        try {
          LOG('POST', API_URL, body);
          const res = await callSummarize(body);
          LOG('OK', res);
          fb.className = 'smry-st ok';
          fb.textContent = '✅ ' + tr2.success;
          goBtn.innerHTML = '✅ ' + tr2.sent;
          setTimeout(closePopup, 2500);
        } catch (err) {
          ERR('Falha:', err);
          fb.className = 'smry-st er';
          fb.textContent = '❌ ' + (err.message || tr2.genericError);
          goBtn.disabled = false;
          goBtn.innerHTML = '📝 ' + tr2.retry;
        }
      };
    };
  
    const openPopup = (btn) => {
      if (popupOpen) {
        closePopup();
        return;
      }
      popupOpen = true;
  
      const tr = t();
      const locationId = getLocationId();
      const conversationId = getConversationId();
      const contactId = getContactId();
  
      if (!locationId) {
        alert(tr.noLocation);
        popupOpen = false;
        return;
      }
      if (!conversationId && !contactId) {
        alert(tr.noConversation);
        popupOpen = false;
        return;
      }
  
      const ov = document.createElement('div');
      ov.id = 'smry-overlay';
      ov.onclick = closePopup;
      document.body.appendChild(ov);
  
      const pop = document.createElement('div');
      pop.id = 'smry-pop';
      document.body.appendChild(pop);
  
      // Posicionar perto do botão
      const r = btn.getBoundingClientRect();
      const popW = 300;
      const left = Math.max(
        8,
        Math.min(r.left - popW / 2 + r.width / 2, window.innerWidth - popW - 8),
      );
      pop.style.left = left + 'px';
      pop.style.bottom = window.innerHeight - r.top + 8 + 'px';
  
      renderPopup(pop);
    };
  
    /* ─── Botão da toolbar ─── */
    // SVG inline de sparkles (vibe IA) — não depende de fonte/emoji.
    const SPARKLE_SVG =
      '<svg class="smry-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>';
  
    // Botão é icon-only — o label/idioma vão pro `title` (tooltip nativo).
    const renderBtnContent = () => SPARKLE_SVG;
  
    const refreshButton = () => {
      const btn = document.getElementById('smry-btn');
      if (!btn) return;
      btn.title = t().btnTitle;
      btn.innerHTML = renderBtnContent();
    };
  
    const mkBtn = () => {
      const btn = document.createElement('button');
      btn.id = 'smry-btn';
      btn.type = 'button';
      btn.title = t().btnTitle;
      btn.setAttribute('aria-label', t().btnTitle);
      btn.innerHTML = renderBtnContent();
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPopup(btn);
      });
      return btn;
    };
  
    /* ─── Injetar botão ─── */
    // Estratégia: ambos os anchors estão DENTRO da toolbar do composer aberto.
    // Quando o composer está fechado, nenhum dos dois existe → não injetamos
    // nada. Quando abre, o MutationObserver dispara e injeta naturalmente.
    //
    // 1) #sw-selector (dropdown do switch v3) é o anchor mais resiliente —
    //    mesmo timing/região, sem depender das classes Tailwind exatas.
    // 2) Fallback: o seletor original do composer-textarea (mesmo do switch)
    //    pra clientes que não tenham o switch instalado.
    const ANCHORS = [
      {
        label: 'after #sw-selector',
        find: () => document.getElementById('sw-selector'),
      },
      {
        label: 'after composer slot 2',
        find: () =>
          document.querySelector(
            '#composer-textarea > div > div.flex.items-center.h-\\[40px\\] > div.flex.flex-row.gap-2.items-center.pl-2.rounded-md.flex-1.min-w-0 > div:nth-child(2)',
          ),
      },
    ];
  
    // Sanity check: garante que o anchor está mesmo dentro do composer aberto.
    // Evita qualquer reinjection acidental fora da toolbar.
    const isInsideComposer = (el) => {
      const composer = document.getElementById('composer-textarea');
      return !!(composer && el && composer.contains(el));
    };
  
    let injectedOnce = false;
    let attempts = 0;
  
    const inject = () => {
      if (document.getElementById('smry-btn')) return;
      if (!getConversationId() && !getContactId()) return;
  
      attempts += 1;
  
      for (const a of ANCHORS) {
        let anchor;
        try {
          anchor = a.find();
        } catch (e) {
          continue;
        }
        if (!anchor || !anchor.parentElement) continue;
        if (!isInsideComposer(anchor)) continue;
  
        injectCss();
        const btn = mkBtn();
        anchor.parentElement.insertBefore(btn, anchor.nextSibling);
        if (!injectedOnce) {
          LOG('✅ Injetado (' + a.label + ') após ' + attempts + ' tentativa(s).');
          injectedOnce = true;
        }
        return;
      }
  
      if (attempts === 5 || attempts === 20) {
        WARN('Anchor não encontrado (tentativa ' + attempts + '). Diagnóstico:', {
          hasSwSelector: !!document.getElementById('sw-selector'),
          hasComposer: !!document.getElementById('composer-textarea'),
          composerSlotMatch: !!document.querySelector(
            '#composer-textarea > div > div.flex.items-center.h-\\[40px\\] > div.flex.flex-row.gap-2.items-center.pl-2.rounded-md.flex-1.min-w-0 > div:nth-child(2)',
          ),
        });
      }
    };
  
    /* ─── Lifecycle ─── */
    new MutationObserver(inject).observe(document.body, {
      childList: true,
      subtree: true,
    });
  
    const onRouteChange = () => {
      closePopup();
      injectedOnce = false;
      attempts = 0;
      document.getElementById('smry-btn')?.remove();
      inject();
    };
  
    window.addEventListener('routeLoaded', onRouteChange);
    window.addEventListener('routeChangeEvent', onRouteChange);
    document.addEventListener('DOMContentLoaded', inject);
  
    setTimeout(inject, 1000);
    setTimeout(inject, 3000);
  
    // Helper de debug exposto: cole no console -> __summaryGhlDebug() pra ver tudo.
    window.__summaryGhlDebug = () => {
      const info = {
        apiUrl: API_URL,
        uiLang,
        supportedLangs: SUPPORTED_LANGS,
        locationId: getLocationId(),
        conversationId: getConversationId(),
        contactId: getContactId(),
        buttonInDom: !!document.getElementById('smry-btn'),
        injectedOnce,
        attempts,
        hasComposer: !!document.getElementById('composer-textarea'),
        hasSwSelector: !!document.getElementById('sw-selector'),
        composerSlotMatch: !!document.querySelector(
          '#composer-textarea > div > div.flex.items-center.h-\\[40px\\] > div.flex.flex-row.gap-2.items-center.pl-2.rounded-md.flex-1.min-w-0 > div:nth-child(2)',
        ),
      };
      LOG('Debug info:', info);
      return info;
    };
    // Helper opcional pra forçar idioma da UI via console.
    window.__summaryGhlSetLang = (lang) => setLang(lang);
  
    LOG(
      'Monitorando DOM. UI lang:',
      uiLang,
      '· API:',
      API_URL,
    );
  })();
  