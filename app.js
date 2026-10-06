/* CasaCraft waitlist — dependency-free.
   - FR / EN / Darija(AR) UI toggle (default FR)
   - captures UTM + referrer so we can report language/channel performance
   - posts to a Supabase REST endpoint when configured in config.js
   - never fakes success: if capture is not configured, it says so honestly */
(function () {
  "use strict";

  /* ---------- i18n ---------- */
  var I18N = {
    nl: {
      kicker: "Binnenkort beschikbaar · Verzending door heel Europa",
      h1: "Breng Marokko naar huis",
      sub: "Muntthee, arganolie, specerijen en Berber-textiel — rechtstreeks van Marokkaanse ambachtslieden, thuisbezorgd in Europa. Meld je aan en hoor als eerste wanneer we lanceren.",
      trust: "Partnercoöperaties in Safi, Tamanar, Tazenakht en Marrakech · Marokkaans bedrijf · Eerlijke prijzen",
      cta: "Op de wachtlijst →",
      micro: "Gratis, zonder verplichting. Geen spam.",
      c1t: "Het theeritueel", c1b: "Goudgerande glazen en zilveren theepotten, zoals thuis.",
      c2t: "Arganolie", c2b: "Vrouwencoöperaties uit Tamanar — culinair en cosmetisch.",
      c3t: "Specerijen & saffraan", c3b: "Ras el hanout, saffraan uit Taliouine, specerijenpakket.",
      c4t: "Berber-textiel", c4b: "Handgeweven kussens en plaids uit de Atlas.",
      ft: "Vertel ons wat je het meest mist", fb: "2 minuten om onze eerste lancering vorm te geven — en als eerste op de hoogte te zijn.",
      l_email: 'E-mail <span class="req">*</span>', ph_email: "jij@voorbeeld.nl",
      l_name: "Voornaam", ph_name: "Optioneel",
      l_country: 'Land <span class="req">*</span>', sel: "Kies…", opt_other: "Ander EU-land",
      l_collections: 'Wat wil je het liefst als eerste? <span class="hint">(meerdere mogelijk)</span>',
      i_tea: "Theeritueel (glazen & theepot)", i_argan: "Arganolie (culinair & cosmetisch)",
      i_spices: "Specerijen & saffraan", i_textiles: "Berber-textiel (kussens & plaids)",
      i_poufs: "Poefs & lantaarns", i_tagines: "Tajines & tafelservies",
      l_price: "Budget voor een theeset (6 glazen)",
      l_ship: "Acceptabele levertijd",
      s1: "1–3 dagen", s2: "4–7 dagen", s3: "1–2 weken", s4: "2–3 weken", s5: "Maakt niet uit, als het maar authentiek is",
      l_pay: 'Voorkeursbetaalmethoden <span class="hint">(meerdere mogelijk)</span>',
      p_card: "Kaart", p_klarna: "Klarna (achteraf betalen)", p_transfer: "Bankoverschrijving",
      l_pref: "Voorkeurstaal voor onze e-mails",
      opt_fr: "Frans", opt_nl: "Nederlands", opt_de: "Duits",
      c_consent: 'Ik ga ermee akkoord per e-mail te worden gecontacteerd over de lancering van CasaCraft. <span class="req">*</span>',
      c_news: "Stuur me ook nieuws en aanbiedingen (optioneel).",
      submit: "Op de wachtlijst",
      legal: "Je gegevens worden alleen gebruikt om je over de lancering te informeren. Uitschrijven met één klik. We beloven geen leverdatum.",
      foot_tag: "Marokko, rechtstreeks van de ambachtslieden.", foot_note: "Showcase-site — nog geen online verkoop.",
      ok: "Je staat op de lijst. We mailen je bij de lancering — bsaha!",
      err_email: "Vul een geldig e-mailadres in.",
      err_country: "Kies je land.",
      err_consent: "Vink het vakje aan zodat we je kunnen mailen.",
      err_generic: "Er ging iets mis. Probeer het zo nog eens.",
      preview: "Aanmeldingen zijn nog niet open — kom snel terug.",
      sending: "Versturen…"
    },
    de: {
      kicker: "Bald verfügbar · Versand in ganz Europa",
      h1: "Hol Marokko nach Hause",
      sub: "Minztee, Arganöl, Gewürze und Berber-Textilien — direkt von marokkanischen Handwerkern, zu dir nach Hause in Europa. Melde dich an und erfahre als Erste:r vom Launch.",
      trust: "Partnerkooperativen in Safi, Tamanar, Tazenakht und Marrakesch · Marokkanisches Unternehmen · Faire Preise",
      cta: "Auf die Warteliste →",
      micro: "Kostenlos, unverbindlich. Kein Spam.",
      c1t: "Das Tee-Ritual", c1b: "Goldrandgläser und silberne Teekannen, wie zu Hause.",
      c2t: "Arganöl", c2b: "Frauenkooperativen aus Tamanar — kulinarisch und kosmetisch.",
      c3t: "Gewürze & Safran", c3b: "Ras el hanout, Safran aus Taliouine, Gewürzauswahl.",
      c4t: "Berber-Textilien", c4b: "Handgewebte Kissen und Decken aus dem Atlas.",
      ft: "Sag uns, was dir am meisten fehlt", fb: "2 Minuten, um unseren ersten Launch mitzugestalten — und als Erste:r informiert zu sein.",
      l_email: 'E-Mail <span class="req">*</span>', ph_email: "du@beispiel.de",
      l_name: "Vorname", ph_name: "Optional",
      l_country: 'Land <span class="req">*</span>', sel: "Auswählen…", opt_other: "Anderes EU-Land",
      l_collections: 'Was möchtest du zuerst? <span class="hint">(Mehrfachauswahl)</span>',
      i_tea: "Tee-Ritual (Gläser & Teekanne)", i_argan: "Arganöl (kulinarisch & kosmetisch)",
      i_spices: "Gewürze & Safran", i_textiles: "Berber-Textilien (Kissen & Decken)",
      i_poufs: "Poufs & Laternen", i_tagines: "Tajine & Tischkultur",
      l_price: "Budget für ein Teeset (6 Gläser)",
      l_ship: "Akzeptable Lieferzeit",
      s1: "1–3 Tage", s2: "4–7 Tage", s3: "1–2 Wochen", s4: "2–3 Wochen", s5: "Egal, solange es authentisch ist",
      l_pay: 'Bevorzugte Zahlungsmethoden <span class="hint">(Mehrfachauswahl)</span>',
      p_card: "Karte", p_klarna: "Klarna (später zahlen)", p_transfer: "Überweisung",
      l_pref: "Bevorzugte Sprache für unsere E-Mails",
      opt_fr: "Französisch", opt_nl: "Niederländisch", opt_de: "Deutsch",
      c_consent: 'Ich stimme zu, per E-Mail über den CasaCraft-Launch informiert zu werden. <span class="req">*</span>',
      c_news: "Schick mir auch Neuigkeiten und Angebote (optional).",
      submit: "Auf die Warteliste",
      legal: "Deine Daten werden nur genutzt, um dich über den Launch zu informieren. Abmeldung mit einem Klick. Wir versprechen kein Lieferdatum.",
      foot_tag: "Marokko, direkt von den Handwerkern.", foot_note: "Schaufenster-Website — noch kein Online-Verkauf.",
      ok: "Du bist auf der Liste. Wir schreiben dir zum Launch — bsaha!",
      err_email: "Bitte gib eine gültige E-Mail-Adresse ein.",
      err_country: "Bitte wähle dein Land.",
      err_consent: "Bitte setze das Häkchen, damit wir dir schreiben können.",
      err_generic: "Etwas ist schiefgelaufen. Bitte versuch es gleich noch einmal.",
      preview: "Anmeldungen sind noch nicht offen — schau bald wieder vorbei.",
      sending: "Wird gesendet…"
    },
    en: {
      kicker: "Coming soon · Shipping across Europe",
      h1: "Bring Morocco home",
      sub: "Mint tea, argan oil, spices and Berber textiles — straight from Moroccan artisans, delivered to your door in Europe. Sign up to be told the moment we launch.",
      trust: "Partner co-ops in Safi, Tamanar, Tazenakht and Marrakech · Moroccan-owned · Fair prices",
      cta: "Join the waitlist →",
      micro: "Free, no commitment. No spam.",
      c1t: "The tea ritual", c1b: "Gold-rimmed glasses and silver teapots, like home.",
      c2t: "Argan oil", c2b: "Tamanar women's co-ops — culinary and cosmetic.",
      c3t: "Spices & saffron", c3b: "Ras el hanout, Taliouine saffron, spice collection.",
      c4t: "Berber textiles", c4b: "Handwoven Atlas cushions and throws.",
      ft: "Tell us what you miss most", fb: "2 minutes to help shape our first launch — and be among the first to know.",
      l_email: 'Email <span class="req">*</span>', ph_email: "you@example.com",
      l_name: "First name", ph_name: "Optional",
      l_country: 'Country <span class="req">*</span>', sel: "Choose…", opt_other: "Other EU country",
      l_collections: 'What would you like first? <span class="hint">(pick any)</span>',
      i_tea: "Mint tea ritual (glasses & teapot)", i_argan: "Argan oil (culinary & cosmetic)",
      i_spices: "Spices & saffron", i_textiles: "Berber textiles (cushions & throws)",
      i_poufs: "Poufs & lanterns", i_tagines: "Tagines & tableware",
      l_price: "Budget for a tea set (6 glasses)",
      l_ship: "Acceptable delivery time",
      s1: "1–3 days", s2: "4–7 days", s3: "1–2 weeks", s4: "2–3 weeks", s5: "As long as it's authentic",
      l_pay: 'Preferred payment methods <span class="hint">(pick any)</span>',
      p_card: "Card", p_klarna: "Klarna (pay later)", p_transfer: "Bank transfer",
      l_pref: "Preferred language for our emails",
      opt_fr: "French", opt_nl: "Dutch", opt_de: "German",
      c_consent: 'I agree to be contacted by email about the CasaCraft launch. <span class="req">*</span>',
      c_news: "Also send me news and offers (optional).",
      submit: "Join the waitlist",
      legal: "Your details are used only to tell you about the launch. One-click unsubscribe. We do not promise any delivery date.",
      foot_tag: "Morocco, straight from the artisans.", foot_note: "Showcase site — no online sales yet.",
      ok: "You're on the list. We'll write to you at launch — bsaha!",
      err_email: "Please enter a valid email address.",
      err_country: "Please choose your country.",
      err_consent: "Please tick the consent box so we can email you.",
      err_generic: "Something went wrong. Please try again in a moment.",
      preview: "Signups are not open yet — check back very soon.",
      sending: "Sending…"
    },
    darija: {
      kicker: "قريباً · التوصيل فـ أوروبا",
      h1: "جيب المغرب معك للدار",
      sub: "أتاي بالنعنع، زيت أركان، عطرية وزرابي أمازيغية — مباشرة من الصنّاع المغاربة، توصلك حتّى باب دارك فـ أوروبا. سجّل باش نعلموك ملي نطلقو.",
      trust: "تعاونيات شريكة فـ آسفي، تمنار، تزناخت ومراكش · مشروع مغربي · أثمنة عادلة",
      cta: "سجّل فـ قائمة الانتظار ←",
      micro: "مجاناً وبلا التزام. بلا سبام.",
      c1t: "تقاليد أتاي", c1b: "كيسان مذهّبة وبراد فضي، بحال الدار.",
      c2t: "زيت أركان", c2b: "تعاونيات نساء تمنار — للأكل والتجميل.",
      c3t: "العطرية والزعفران", c3b: "رأس الحانوت، زعفران تاليوين، تشكيلة عطرية.",
      c4t: "الزرابي الأمازيغية", c4b: "خداديات وأغطية منسوجة باليد فـ الأطلس.",
      ft: "قول لنا شنو خاصك بزاف", fb: "جوج دقايق باش تعاونا نوجدو أول إطلاق — وتكون من اللولين اللي يعرفو.",
      l_email: 'الإيميل <span class="req">*</span>', ph_email: "you@example.com",
      l_name: "السمية", ph_name: "اختياري",
      l_country: 'البلد <span class="req">*</span>', sel: "اختار…", opt_other: "بلد آخر فـ الاتحاد الأوروبي",
      l_collections: 'شنو تحب يكون الأول؟ <span class="hint">(اختر كتير من واحد)</span>',
      i_tea: "تقاليد أتاي (كيسان وبراد)", i_argan: "زيت أركان (للأكل والتجميل)",
      i_spices: "العطرية والزعفران", i_textiles: "الزرابي الأمازيغية (خداديات وأغطية)",
      i_poufs: "بوفات وفوانيس", i_tagines: "طواجن وأدوات المائدة",
      l_price: "الميزانية لطقم أتاي (6 كيسان)",
      l_ship: "وقت التوصيل اللي مقبول",
      s1: "1–3 أيام", s2: "4–7 أيام", s3: "أسبوع – جوج", s4: "جوج – تلاتة سيمانات", s5: "بلا مشكل إلا كان أصلي",
      l_pay: 'طريقة الخلاص المفضّلة <span class="hint">(اختر كتير من واحد)</span>',
      p_card: "الكارط", p_klarna: "Klarna (الخلاص من بعد)", p_transfer: "تحويل بنكي",
      l_pref: "اللغة اللي تفضّل فـ الرسائل",
      opt_fr: "الفرنسية", opt_nl: "الهولندية", opt_de: "الألمانية",
      c_consent: 'كنقبل يتواصلو معايا بالإيميل على إطلاق CasaCraft. <span class="req">*</span>',
      c_news: "بغيت تاني نتوصل بالجديد والعروض (اختياري).",
      submit: "سجّل فـ قائمة الانتظار",
      legal: "المعلومات ديالك تستعمل غير باش نعلموك على الإطلاق. تقدر تحيّد راسك بكليكة وحدة. ما كنوعدوكش بتاريخ توصيل.",
      foot_tag: "المغرب، مباشرة من الصنّاع.", foot_note: "موقع تعريفي — مازال ما كاينش بيع.",
      ok: "تسجّلت! غانكتبو ليك ملي نطلقو — بالصحة!",
      err_email: "عافاك دخّل إيميل صحيح.",
      err_country: "عافاك اختار البلد.",
      err_consent: "عافاك علّم على خانة الموافقة باش نقدرو نكتبو ليك.",
      err_generic: "وقع مشكل. عاود جرّب من بعد شوية.",
      preview: "التسجيل مازال ما حلّش — عاود شوف قريب.",
      sending: "كنصيفطو…"
    }
  };

  var FR_TEXT = {}; // captured from the DOM to restore French

  function cacheFrench() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      FR_TEXT[el.getAttribute("data-i18n")] = el.innerHTML;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      FR_TEXT[el.getAttribute("data-i18n-ph")] = el.getAttribute("placeholder") || "";
    });
  }

  function setLang(lang) {
    document.documentElement.lang = lang === "darija" ? "ar" : lang;
    document.documentElement.dir = "ltr";
    var dict = I18N[lang];
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (lang === "fr") { if (FR_TEXT[k] != null) el.innerHTML = FR_TEXT[k]; return; }
      if (dict && dict[k] != null) el.innerHTML = dict[k];
      else if (FR_TEXT[k] != null) el.innerHTML = FR_TEXT[k];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      var v = lang === "fr" ? FR_TEXT[k] : (dict && dict[k] != null ? dict[k] : FR_TEXT[k]);
      if (v != null) el.setAttribute("placeholder", v);
    });
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    try { localStorage.setItem("casacraft_lang", lang); } catch (e) {}
    window.__casacraftLang = lang;
  }

  cacheFrench();

  /* ---------- UTM / traffic attribution ---------- */
  var TRACK_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  function captureTracking() {
    var params = new URLSearchParams(window.location.search);
    var existing = {};
    try { existing = JSON.parse(sessionStorage.getItem("casacraft_utm") || "{}"); } catch (e) {}
    var out = {};
    TRACK_KEYS.forEach(function (k) {
      var v = params.get(k);
      out[k] = v != null && v !== "" ? v : (existing[k] || null);
    });
    try { sessionStorage.setItem("casacraft_utm", JSON.stringify(out)); } catch (e) {}
    return out;
  }
  var tracking = captureTracking();

  /* ---------- form ---------- */
  var form = document.getElementById("waitlist-form");
  if (!form) return;
  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector(".submit");

  function t(key) {
    var lang = window.__casacraftLang || "fr";
    if (lang === "fr") return null;
    return I18N[lang] && I18N[lang][key] != null ? I18N[lang][key] : null;
  }

  function setStatus(msgKeyOrText, kind, translated) {
    var msg = translated ? msgKeyOrText : (t(msgKeyOrText) || (FR_TEXT[msgKeyOrText] || msgKeyOrText));
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (kind ? " " + kind : "");
  }

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-lang"));
      statusEl.textContent = "";
      statusEl.className = "form-status";
    });
  });

  var SUPPORTED_LANGS = ["fr", "en", "darija", "nl", "de"];
  try {
    var saved = localStorage.getItem("casacraft_lang");
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) {
      setLang(saved);
    } else {
      /* first visit: default to the visitor's browser language for the target markets */
      var base = ((navigator.language || navigator.userLanguage || "fr") + "").slice(0, 2).toLowerCase();
      var auto = { fr: "fr", en: "en", nl: "nl", de: "de", ar: "darija" }[base] || "fr";
      if (auto !== "fr") setLang(auto);
    }
  } catch (e) {}

  function checkedValues(name) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (i) { return i.value; });
  }

  function isConfigured() {
    var c = window.CASACRAFT_CONFIG || {};
    return !!(c.supabaseUrl && c.supabaseAnonKey && c.table);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var email = (document.getElementById("email").value || "").trim();
    var country = document.getElementById("country").value;
    var consent = document.getElementById("consent").checked;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("err_email", "error"); document.getElementById("email").focus(); return;
    }
    if (!country) { setStatus("err_country", "error"); document.getElementById("country").focus(); return; }
    if (!consent) { setStatus("err_consent", "error"); document.getElementById("consent").focus(); return; }

    var payload = {
      email: email,
      first_name: (document.getElementById("first_name").value || "").trim() || null,
      country: country,
      interests: checkedValues("interest"),
      price_band: document.getElementById("price_band").value || null,
      ship_max: document.getElementById("ship_max").value || null,
      payment_methods: checkedValues("payment"),
      preferred_language: document.getElementById("pref_lang").value || null,
      consent_gdpr: consent,
      consent_marketing: document.getElementById("news").checked,
      page_lang: (window.__casacraftLang || "fr"),
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_content: tracking.utm_content,
      utm_term: tracking.utm_term,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      submitted_at: new Date().toISOString()
    };

    if (!isConfigured()) {
      setStatus("preview", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("sending", null, true);

    var cfg = window.CASACRAFT_CONFIG;
    fetch(cfg.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + cfg.table, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": cfg.supabaseAnonKey,
        "Authorization": "Bearer " + cfg.supabaseAnonKey,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      submitBtn.disabled = false;
      setStatus("ok", "ok");
    }).catch(function () {
      submitBtn.disabled = false;
      setStatus("err_generic", "error");
    });
  });
})();
