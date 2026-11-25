// Varispeed: slows the whole session down (or speeds it up) with LUNA's own session speed,
// `enable_tempo_percent` and `tempo_percent` (1 = normal), keeping the pitch. A take recorded
// at another speed is then made to follow the tempo, so it plays in time at every speed.

(() => {
  const $ = (id) => document.getElementById(id);
  const VERSION = '1.0.1';
  const MIN = 25, MAX = 150;
  const PRESETS = [50, 60, 70, 75, 80, 85, 90, 100];
  const PROPS = ['enable_tempo_percent', 'tempo_percent', 'pitch', 'playing', 'record_enabled'];
  const KEY = 'com.fedetrillo.varispeed.';
  const store = {
    get: (k) => { try { return localStorage.getItem(KEY + k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(KEY + k, v); } catch { /* not fatal */ } },
  };

  // ---- Texts ---------------------------------------------------------------------------------
  const I18N = {
    es: { _name: 'Español', on: 'Activado', off: 'Desactivado', reset: 'Volver a 100 %', normal: 'Velocidad normal',
      slower: '{v} BPM efectivos · más lento', faster: '{v} BPM efectivos · más rápido',
      fit: 'Cuadrar las tomas grabadas a otra velocidad', dark: 'Oscuro', grey: 'Gris',
      connecting: 'Conectando con LUNA…', waiting: 'Esperando a LUNA…', noSession: 'Abre una sesión en LUNA.',
      fixing: 'Cuadrando la toma…', fixed: '{name} cuadrada', fixedN: '{n} tomas cuadradas', fixFail: 'No se ha podido cuadrar {name}', refused: 'LUNA no ha aceptado el cambio', copied: 'Informe copiado' },
    en: { _name: 'English', on: 'On', off: 'Off', reset: 'Back to 100 %', normal: 'Normal speed',
      slower: '{v} BPM in effect · slower', faster: '{v} BPM in effect · faster',
      fit: 'Fit takes recorded at another speed', dark: 'Dark', grey: 'Grey',
      connecting: 'Connecting to LUNA…', waiting: 'Waiting for LUNA…', noSession: 'Open a session in LUNA.',
      fixing: 'Fitting the take…', fixed: '{name} fitted', fixedN: '{n} takes fitted', fixFail: 'Could not fit {name}', refused: 'LUNA did not take the change', copied: 'Report copied' },
    ca: { _name: 'Català', on: 'Activat', off: 'Desactivat', reset: 'Tornar a 100 %', normal: 'Velocitat normal',
      slower: '{v} BPM efectius · més lent', faster: '{v} BPM efectius · més ràpid',
      fit: 'Quadrar les preses gravades a una altra velocitat', dark: 'Fosc', grey: 'Gris',
      connecting: 'Connectant amb LUNA…', waiting: 'Esperant LUNA…', noSession: 'Obre una sessió a LUNA.',
      fixing: 'Quadrant la presa…', fixed: '{name} quadrada', fixedN: '{n} preses quadrades', fixFail: "No s'ha pogut quadrar {name}", refused: 'LUNA no ha acceptat el canvi', copied: 'Informe copiat' },
    fr: { _name: 'Français', on: 'Activé', off: 'Désactivé', reset: 'Revenir à 100 %', normal: 'Vitesse normale',
      slower: '{v} BPM effectifs · plus lent', faster: '{v} BPM effectifs · plus rapide',
      fit: 'Caler les prises enregistrées à une autre vitesse', dark: 'Sombre', grey: 'Gris',
      connecting: 'Connexion à LUNA…', waiting: 'En attente de LUNA…', noSession: 'Ouvrez une session dans LUNA.',
      fixing: 'Calage de la prise…', fixed: '{name} calée', fixedN: '{n} prises calées', fixFail: 'Impossible de caler {name}', refused: "LUNA n'a pas accepté le changement", copied: 'Rapport copié' },
    de: { _name: 'Deutsch', on: 'Ein', off: 'Aus', reset: 'Zurück auf 100 %', normal: 'Normale Geschwindigkeit',
      slower: '{v} BPM wirksam · langsamer', faster: '{v} BPM wirksam · schneller',
      fit: 'Mit anderer Geschwindigkeit aufgenommene Takes anpassen', dark: 'Dunkel', grey: 'Grau',
      connecting: 'Verbinde mit LUNA…', waiting: 'Warte auf LUNA…', noSession: 'Öffne eine Session in LUNA.',
      fixing: 'Take wird angepasst…', fixed: '{name} angepasst', fixedN: '{n} Takes angepasst', fixFail: '{name} konnte nicht angepasst werden', refused: 'LUNA hat die Änderung nicht übernommen', copied: 'Bericht kopiert' },
    it: { _name: 'Italiano', on: 'Attivo', off: 'Disattivo', reset: 'Torna a 100 %', normal: 'Velocità normale',
      slower: '{v} BPM effettivi · più lento', faster: '{v} BPM effettivi · più veloce',
      fit: 'Adatta le riprese registrate a un’altra velocità', dark: 'Scuro', grey: 'Grigio',
      connecting: 'Connessione a LUNA…', waiting: 'In attesa di LUNA…', noSession: 'Apri una sessione in LUNA.',
      fixing: 'Adatto la ripresa…', fixed: '{name} adattata', fixedN: '{n} riprese adattate', fixFail: 'Impossibile adattare {name}', refused: 'LUNA non ha accettato la modifica', copied: 'Rapporto copiato' },
    pt: { _name: 'Português', on: 'Ligado', off: 'Desligado', reset: 'Voltar a 100 %', normal: 'Velocidade normal',
      slower: '{v} BPM efetivos · mais lento', faster: '{v} BPM efetivos · mais rápido',
      fit: 'Acertar os takes gravados a outra velocidade', dark: 'Escuro', grey: 'Cinzento',
      connecting: 'A ligar ao LUNA…', waiting: 'À espera do LUNA…', noSession: 'Abre uma sessão no LUNA.',
      fixing: 'A acertar o take…', fixed: '{name} acertado', fixedN: '{n} takes acertados', fixFail: 'Não foi possível acertar {name}', refused: 'O LUNA não aceitou a mudança', copied: 'Relatório copiado' },
  };
  // The guide: its texts, in every language.
  for (const [c, v] of Object.entries({"en": {"help": "Quick guide", "helpBtn": "Guide", "tNext": "Next", "tBack": "Back", "tSkip": "Skip", "tDone": "Got it", "langT": "Choose your language", "langX": "The guide and the whole window will use it. You can change it later here, at the top right.", "zt": "Always at hand", "z": "Open this guide again whenever you need it with the ? button.", "q1t": "Session speed", "q1": "Drag to slow the whole session down or speed it up (25 to 150 %), keeping the pitch. Below it you see the tempo you are actually hearing.", "q2t": "Quick speeds", "q2": "The usual practice speeds, one click away.", "q3t": "On and back", "q3": "Switch it on and off without losing the speed you set; Back to 100 % returns to normal.", "q4t": "Takes at another speed", "q4": "With this on, a take you record at another speed is fitted to the tempo, so it plays in time at any speed."}, "es": {"help": "Guía rápida", "helpBtn": "Guía", "tNext": "Siguiente", "tBack": "Atrás", "tSkip": "Saltar", "tDone": "Entendido", "langT": "Elige tu idioma", "langX": "La guía y toda la ventana lo usarán. Puedes cambiarlo luego aquí, arriba a la derecha.", "zt": "Siempre a mano", "z": "Vuelve a esta guía cuando la necesites con el botón ?.", "q1t": "Velocidad de la sesión", "q1": "Arrastra para ralentizar o acelerar toda la sesión (del 25 al 150 %) sin cambiar el tono. Debajo ves el tempo que estás oyendo de verdad.", "q2t": "Velocidades rápidas", "q2": "Las velocidades de práctica de siempre, a un clic.", "q3t": "Activar y volver", "q3": "Actívalo y desactívalo sin perder la velocidad elegida; Volver a 100 % lo deja normal.", "q4t": "Tomas a otra velocidad", "q4": "Con esto marcado, una toma que grabes a otra velocidad se ajusta al tempo, así suena a tiempo a cualquier velocidad."}, "ca": {"help": "Guia ràpida", "helpBtn": "Guia", "tNext": "Següent", "tBack": "Enrere", "tSkip": "Saltar", "tDone": "Entesos", "langT": "Tria el teu idioma", "langX": "La guia i tota la finestra el faran servir. El pots canviar després aquí, a dalt a la dreta.", "zt": "Sempre a mà", "z": "Torna a aquesta guia quan la necessitis amb el botó ?.", "q1t": "Velocitat de la sessió", "q1": "Arrossega per alentir o accelerar tota la sessió (del 25 al 150 %) sense canviar el to. A sota veus el tempo que realment sents.", "q2t": "Velocitats ràpides", "q2": "Les velocitats de pràctica de sempre, a un clic.", "q3t": "Activar i tornar", "q3": "Activa-ho i desactiva-ho sense perdre la velocitat triada; Tornar a 100 % ho deixa normal.", "q4t": "Preses a una altra velocitat", "q4": "Amb això marcat, una presa que gravis a una altra velocitat s’ajusta al tempo, així sona a temps a qualsevol velocitat."}, "fr": {"help": "Guide rapide", "helpBtn": "Guide", "tNext": "Suivant", "tBack": "Retour", "tSkip": "Passer", "tDone": "Compris", "langT": "Choisissez votre langue", "langX": "Le guide et toute la fenêtre l’utiliseront. Vous pourrez la changer ici, en haut à droite.", "zt": "Toujours à portée", "z": "Rouvrez ce guide quand vous voulez avec le bouton ?.", "q1t": "Vitesse de la session", "q1": "Faites glisser pour ralentir ou accélérer toute la session (de 25 à 150 %) sans changer la hauteur. En dessous, le tempo que vous entendez vraiment.", "q2t": "Vitesses rapides", "q2": "Les vitesses de travail habituelles, en un clic.", "q3t": "Activer et revenir", "q3": "Activez-le ou coupez-le sans perdre la vitesse choisie ; Revenir à 100 % remet la vitesse normale.", "q4t": "Prises à une autre vitesse", "q4": "Coché, une prise enregistrée à une autre vitesse est calée sur le tempo, pour jouer en place à toute vitesse."}, "de": {"help": "Kurzanleitung", "helpBtn": "Anleitung", "tNext": "Weiter", "tBack": "Zurück", "tSkip": "Überspringen", "tDone": "Verstanden", "langT": "Wähle deine Sprache", "langX": "Die Anleitung und das ganze Fenster verwenden sie. Du kannst sie später hier oben rechts ändern.", "zt": "Immer zur Hand", "z": "Öffne diese Anleitung jederzeit wieder mit dem Button ?.", "q1t": "Session-Geschwindigkeit", "q1": "Zieh, um die ganze Session zu verlangsamen oder zu beschleunigen (25 bis 150 %), ohne die Tonhöhe zu ändern. Darunter siehst du das Tempo, das du wirklich hörst.", "q2t": "Schnellwahl", "q2": "Die üblichen Übungstempi, einen Klick entfernt.", "q3t": "Ein und zurück", "q3": "Schalte es ein und aus, ohne die gewählte Geschwindigkeit zu verlieren; Zurück auf 100 % stellt wieder normal ein.", "q4t": "Takes in anderem Tempo", "q4": "Ist das an, wird ein Take, den du in anderer Geschwindigkeit aufnimmst, ans Tempo angepasst und spielt bei jeder Geschwindigkeit im Takt."}, "it": {"help": "Guida rapida", "helpBtn": "Guida", "tNext": "Avanti", "tBack": "Indietro", "tSkip": "Salta", "tDone": "Capito", "langT": "Scegli la tua lingua", "langX": "La guida e tutta la finestra la useranno. Puoi cambiarla poi qui, in alto a destra.", "zt": "Sempre a portata di mano", "z": "Riapri questa guida quando ti serve con il pulsante ?.", "q1t": "Velocità della sessione", "q1": "Trascina per rallentare o accelerare tutta la sessione (dal 25 al 150 %) senza cambiare l’intonazione. Sotto vedi il tempo che senti davvero.", "q2t": "Velocità rapide", "q2": "Le solite velocità di studio, a un clic.", "q3t": "Attiva e torna", "q3": "Attivalo e disattivalo senza perdere la velocità scelta; Torna a 100 % lo riporta normale.", "q4t": "Take a un’altra velocità", "q4": "Con questa opzione, una take registrata a un’altra velocità viene adattata al tempo e suona a tempo a qualsiasi velocità."}, "pt": {"help": "Guia rápido", "helpBtn": "Guia", "tNext": "Seguinte", "tBack": "Voltar", "tSkip": "Saltar", "tDone": "Percebi", "langT": "Escolhe o teu idioma", "langX": "O guia e toda a janela vão usá-lo. Podes mudá-lo depois aqui, em cima à direita.", "zt": "Sempre à mão", "z": "Volta a este guia quando precisares com o botão ?.", "q1t": "Velocidade da sessão", "q1": "Arrasta para abrandar ou acelerar toda a sessão (de 25 a 150 %) sem mudar o tom. Por baixo vês o tempo que estás mesmo a ouvir.", "q2t": "Velocidades rápidas", "q2": "As velocidades de estudo de sempre, à distância de um clique.", "q3t": "Ligar e voltar", "q3": "Liga e desliga sem perder a velocidade escolhida; Voltar a 100 % repõe o normal.", "q4t": "Takes a outra velocidade", "q4": "Com isto marcado, um take gravado a outra velocidade é ajustado ao tempo e toca a tempo a qualquer velocidade."}})) Object.assign(I18N[c], v);
  const LANGS = Object.keys(I18N);
  let lang = (() => {
    const saved = store.get('lang');
    if (saved && I18N[saved]) return saved;
    for (const l of navigator.languages ?? [navigator.language]) { const c = String(l || '').slice(0, 2).toLowerCase(); if (I18N[c]) return c; }
    return 'en';
  })();
  const t = (k, v = {}) => (I18N[lang][k] ?? I18N.en[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => (x in v ? String(v[x]) : m));

  // ---- Status line (inside the dial) ------------------------------------------------------------
  let status = { key: 'connecting', vars: {}, kind: '' };
  let statusTimer = null;
  function say(key, vars = {}, kind = '', ms = 0) {
    status = { key, vars, kind };
    clearTimeout(statusTimer);
    if (ms) statusTimer = setTimeout(() => say(null), ms);
    paintStatus();
  }
  function paintStatus() {
    $('status').textContent = status.key ? t(status.key, status.vars) : '';
    $('status').className = `status ${status.kind}`;
  }

  // ---- Theme and language ----------------------------------------------------------------------
  let theme = store.get('theme') === 'grey' ? 'grey' : 'dark';
  let repaint = () => {};
  function paintStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    $('ver').textContent = `v${VERSION}`;
    $('lang').replaceChildren(...LANGS.map((c) => Object.assign(document.createElement('option'), { value: c, textContent: I18N[c]._name })));
    $('lang').value = lang;
    for (const [id, name] of [['tDark', 'dark'], ['tGrey', 'grey']]) {
      $(id).classList.toggle('on', theme === name); $(id).title = t(name); $(id).setAttribute('aria-label', t(name));
    }
    $('help').title = t('help'); $('help').setAttribute('aria-label', t('help')); { const q = document.createElement('b'); q.textContent = '?'; $('help').replaceChildren(q); }
    $('reset').textContent = t('reset');
    $('autoLabel').textContent = t('fit');
    paintStatus();
  }
  $('lang').onchange = () => { lang = $('lang').value; store.set('lang', lang); paintStatic(); repaint(); };
  for (const b of [$('tDark'), $('tGrey')]) b.onclick = () => { theme = b.dataset.t; store.set('theme', theme); paintStatic(); };
  paintStatic();
  const tour = window.AddOnTour?.attach({
    button: $('help'), key: `${KEY}tourSeen`,
    labels: () => ({ next: t('tNext'), back: t('tBack'), skip: t('tSkip'), done: t('tDone') }),
    language: {
      sel: '#lang',
      list: () => LANGS.map((c) => [c, I18N[c]._name]),
      current: () => lang,
      set: (c) => { lang = c; store.set('lang', c); paintStatic(); repaint(); },
      title: () => t('langT'), text: () => t('langX'),
    },
    steps: () => [
      { sel: '.dial', title: () => t('q1t'), text: () => t('q1') },
      { sel: '#presets', title: () => t('q2t'), text: () => t('q2') },
      { sel: '.row', title: () => t('q3t'), text: () => t('q3') },
      { sel: '.check', title: () => t('q4t'), text: () => t('q4') },
      { sel: '#help', title: () => t('zt'), text: () => t('z') },
    ],
  });

  // ---- LUNA ----------------------------------------------------------------------------------------
  let luna;
  let built;
  let page = new Luna.Bindings();
  let timer = null;
  const log = [];
  const note = (what, extra = {}) => { log.push({ t: new Date().toISOString().slice(11, 23), what, ...extra }); if (log.length > 60) log.shift(); };

  async function build() {
    const s = luna.sessions.current();
    if (s === built) return;
    built = s;
    page.dispose();
    page = new Luna.Bindings();
    if (timer) { clearInterval(timer); timer = null; }
    if (!s) { say('noSession'); return; }
    await s.ready();
    if (s !== built) return;
    await s.musical.ready();
    say(null);
    const tr = s.transport;

    let live = {};            // what LUNA reports
    let want = 100;           // the speed shown, in percent
    let pending = false;      // a change on its way, so a read does not pull the display back

    const enabled = () => live.enable_tempo_percent === true;
    const ratioNow = () => {
      const v = Number(live.tempo_percent);
      if (!enabled() || !(v > 0)) return 1;
      return v > 4 ? v / 100 : v;          // LUNA reports 1 for normal; tolerate a 100-based value
    };

    async function read() {
      const got = await luna.raw.get(s.path, { children: false, commands: false, flatvalue: true, propfilter: PROPS }).catch(() => null);
      if (!got) return;
      const p = got.properties ?? {};
      const changed = PROPS.some((k) => p[k] !== live[k]);
      live = p;
      if (changed) {
        note('LUNA', { ...p });
        const v = Number(p.tempo_percent);
        if (!pending && v > 0) want = Math.round(v > 4 ? v : v * 100);
        render();
      }
    }

    async function setSpeed(pct) {
      want = Math.min(MAX, Math.max(MIN, Math.round(pct)));
      render();
      pending = true;
      const on = want !== 100;
      try {
        note('set', { pct: want, enable: on });
        await luna.raw.set(`${s.path}/tempo_percent`, want / 100);
        if (live.enable_tempo_percent !== on) await luna.raw.set(`${s.path}/enable_tempo_percent`, on);
        if (status.kind === 'bad') say(null);
      } catch (e) { note('refused', { e: String(e?.message || e) }); say('refused', {}, 'bad', 4000); }
      pending = false;
      await read();
    }
    async function setEnabled(on) {
      try {
        note('enable', { on });
        await luna.raw.set(`${s.path}/enable_tempo_percent`, on);
      } catch (e) { note('refused', { e: String(e?.message || e) }); say('refused', {}, 'bad', 4000); }
      await read();
    }

    // ---- Takes recorded at another speed -----------------------------------------------------------
    // LUNA places a take recorded at 80 % with the right musical length, but the take keeps its
    // length in seconds, so at 100 % it would grow and play slow. Replaced, when it ends, by an
    // identical copy that follows the tempo, it stays the same musical length at every speed.
    let autoFit = store.get('fit') !== 'off';
    let pass = null;          // { ratio, tracks: [{ track, before: Set }] } while punched in
    async function clipIds(track) {
      const lane = s.playlistFor(track);
      if (!lane) return new Set();
      await lane.clips.load().catch(() => undefined);
      return new Set(lane.clips.items.map((c) => c.id));
    }
    async function onPunchIn() {
      const ratio = ratioNow();
      const armed = s.tracks.items.filter((tk) => tk.recordEnabled?.value === true);
      pass = { ratio, tracks: await Promise.all(armed.map(async (track) => ({ track, before: await clipIds(track) }))) };
      note('punch in', { ratio, tracks: armed.map((tk) => tk.name.value) });
    }
    async function onPunchOut() {
      const p = pass; pass = null;
      if (!p || !autoFit || Math.abs(p.ratio - 1) < 0.005) return;
      say('fixing');
      await new Promise((r) => setTimeout(r, 700));           // the take lands as a clip a moment later
      let n = 0, last = '', failed = '';
      for (const { track, before } of p.tracks) {
        const lane = s.playlistFor(track);
        let fresh = [];
        for (let i = 0; i < 10 && !fresh.length; i++) {
          await lane?.clips.load().catch(() => undefined);
          fresh = (lane?.clips.items ?? []).filter((c) => !before.has(c.id) && c.stop.value > c.start.value);
          if (!fresh.length) await new Promise((r) => setTimeout(r, 250));
        }
        for (const c of fresh) {
          const name = c.name.value || track.name.value || '';
          try {
            const copy = await s.insertClip({ playlistUid: lane.id, copyOf: c, startTick: c.start.value, stopTick: c.stop.value, lengthFollows: 'ticks', layer: c.layer.value });
            await c.delete();
            n++; last = name;
            note('fitted', { clip: name, ratio: p.ratio, start: copy.start.value, stop: copy.stop.value });
          } catch (e) {
            failed = name;
            note('fit failed', { clip: name, e: String(e?.message || e) });
          }
        }
      }
      if (failed) say('fixFail', { name: failed }, 'bad', 6000);
      else if (n === 1) say('fixed', { name: last }, 'ok', 5000);
      else if (n > 1) say('fixedN', { n }, 'ok', 5000);
      else say(null);
    }

    // ---- Drawing ---------------------------------------------------------------------------------------
    function render() {
      const on = enabled();
      const shown = on ? want : 100;
      $('big').firstChild.textContent = String(want);
      $('big').classList.toggle('slow', on && want < 100);
      $('big').classList.toggle('fast', on && want > 100);
      $('big').classList.toggle('off', !on && want !== 100);
      const bpm = s.musical.timeline.tempoAt(tr.tick);
      const eff = Number.isFinite(bpm) ? (bpm * shown / 100).toFixed(1) : '—';
      $('sub').textContent = shown === 100 ? t('normal') : t(shown < 100 ? 'slower' : 'faster', { v: eff });
      if (!dragging) $('slider').value = String(want);
      // The buttons are made once and only restyled here: render runs on every playhead move,
      // and a button replaced between press and release never gets its click.
      for (const b of presetButtons) b.classList.toggle('on', shown === Number(b.dataset.p));
      $('toggle').textContent = on ? t('on') : t('off');
      $('toggle').classList.toggle('on', on);
      $('auto').checked = autoFit;
    }
    repaint = render;

    const presetButtons = PRESETS.map((p) => {
      const b = document.createElement('button');
      b.textContent = `${p} %`;
      b.dataset.p = String(p);
      if (p === 100) b.className = 'n';
      b.onclick = () => void setSpeed(p);
      return b;
    });
    $('presets').replaceChildren(...presetButtons);

    let dragging = false, sendTimer = null;
    $('slider').oninput = () => {
      dragging = true;
      want = Number($('slider').value); render();
      clearTimeout(sendTimer); sendTimer = setTimeout(() => { dragging = false; void setSpeed(want); }, 150);
    };
    $('toggle').onclick = () => void setEnabled(!enabled());
    $('reset').onclick = () => void setSpeed(100);
    $('auto').onchange = () => { autoFit = $('auto').checked; store.set('fit', autoFit ? 'on' : 'off'); };
    // A report for support: Alt-click the version number.
    $('ver').onclick = async (ev) => {
      if (!ev.altKey) return;
      const text = JSON.stringify({ version: VERSION, want, live, autoFit, tempoPercentProp: tr.tempoPercent?.value, bpm: s.musical.timeline.tempoAt(tr.tick), log }, null, 2);
      try { await navigator.clipboard.writeText(text); say('copied', {}, 'ok', 3000); } catch { /* nothing to do */ }
    };

    page.on(tr.punchedIn, () => { if (tr.punchedIn.value) void onPunchIn(); else void onPunchOut(); });
    page.on(tr.playing, () => { if (!tr.playing.value && pass) void onPunchOut(); });
    page.on(tr.location, () => render());
    if (tr.tempoPercent) page.on(tr.tempoPercent, () => render());
    await read();
    note('start', { ...live });
    timer = setInterval(() => void read(), 600);
    render();
  }

  (async () => {
    for (;;) {
      try { luna = await Luna.connect(); break; }
      catch (e) { say(e instanceof Luna.NotRunning ? 'waiting' : 'connecting'); await new Promise((r) => setTimeout(r, 1500)); }
    }
    Luna.bindShortcuts(luna, { onError: (e) => note('shortcut error', { e: String(e?.message || e) }) });
    luna.status.onChange(() => { if (luna.status.value !== 'connected') say('connecting'); });
    await luna.sessions.ready();
    luna.sessions.focused.onChange(() => void build());
    await build();
  })();
})();
