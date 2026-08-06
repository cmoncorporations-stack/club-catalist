/* =============================================================
   Swiss-made Coaching — comportements de l'interface
   Vanilla JS, aucune dépendance, aucune requête réseau.

   Le français est la langue source : il vit dans le HTML.
   assets/i18n.js ne contient que les traductions anglaises, ce
   qui évite toute désynchronisation entre le markup et le
   dictionnaire.
   ============================================================= */
(function () {
  "use strict";

  var LANG_KEY = "smc-lang";
  var DICT = (window.SMC_I18N && window.SMC_I18N.en) || {};
  var frBaseline = new Map();   // élément -> { html, attrs:{} }
  var currentLang = "fr";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------
     i18n
     --------------------------------------------------------- */

  /* data-i18n="cle"                    → contenu du nœud
     data-i18n-attr="placeholder:cle"   → un ou plusieurs attributs
                                          séparés par des virgules   */
  function captureBaseline() {
    $$("[data-i18n], [data-i18n-attr]").forEach(function (el) {
      var attrs = {};
      parseAttrSpec(el).forEach(function (pair) {
        attrs[pair.attr] = el.getAttribute(pair.attr);
      });
      frBaseline.set(el, { html: el.innerHTML, attrs: attrs });
    });
  }

  function parseAttrSpec(el) {
    var spec = el.getAttribute("data-i18n-attr");
    if (!spec) return [];
    return spec.split(",").map(function (part) {
      var bits = part.split(":");
      return { attr: bits[0].trim(), key: (bits[1] || "").trim() };
    }).filter(function (p) { return p.attr && p.key; });
  }

  function applyLang(lang) {
    var toEnglish = lang === "en";
    currentLang = toEnglish ? "en" : "fr";

    $$("[data-i18n], [data-i18n-attr]").forEach(function (el) {
      var base = frBaseline.get(el);
      if (!base) return;

      var key = el.getAttribute("data-i18n");
      if (key) {
        el.innerHTML = toEnglish && DICT[key] ? DICT[key] : base.html;
      }
      parseAttrSpec(el).forEach(function (pair) {
        var value = toEnglish && DICT[pair.key] ? DICT[pair.key] : base.attrs[pair.attr];
        if (value != null) el.setAttribute(pair.attr, value);
      });
    });

    var root = document.documentElement;
    root.lang = currentLang;

    var enTitle = root.getAttribute("data-title-en");
    var frTitle = root.getAttribute("data-title-fr");
    if (!frTitle) { frTitle = document.title; root.setAttribute("data-title-fr", frTitle); }
    document.title = toEnglish && enTitle ? enTitle : frTitle;

    var desc = $('meta[name="description"]');
    var enDesc = root.getAttribute("data-desc-en");
    if (desc) {
      if (!root.getAttribute("data-desc-fr")) root.setAttribute("data-desc-fr", desc.content);
      desc.content = toEnglish && enDesc ? enDesc : root.getAttribute("data-desc-fr");
    }

    $$("[data-lang-btn]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang-btn") === currentLang));
    });

    try { localStorage.setItem(LANG_KEY, currentLang); } catch (e) { /* mode privé */ }
  }

  function initialLang() {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl === "en" || fromUrl === "fr") return fromUrl;
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "fr") return saved;
    } catch (e) { /* mode privé */ }
    return (navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en";
  }

  /* ---------------------------------------------------------
     Navigation mobile
     --------------------------------------------------------- */
  function initDrawer() {
    var burger = $("[data-burger]");
    var drawer = $("[data-drawer]");
    if (!burger || !drawer) return;

    var lastFocus = null;

    function focusables() {
      return $$('a[href], button:not([disabled])', drawer)
        .filter(function (el) { return el.offsetParent !== null; });
    }

    function open() {
      lastFocus = document.activeElement;
      drawer.setAttribute("data-open", "true");
      drawer.removeAttribute("aria-hidden");
      burger.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-locked");
      var first = focusables()[0];
      if (first) first.focus();
    }

    function close() {
      drawer.setAttribute("data-open", "false");
      drawer.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
      if (lastFocus) lastFocus.focus();
    }

    burger.addEventListener("click", function () {
      burger.getAttribute("aria-expanded") === "true" ? close() : open();
    });

    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (burger.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      // Le tiroir est plein écran : on y piège le focus.
      var items = focusables();
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    var mq = window.matchMedia("(min-width: 820px)");
    var onChange = function (e) { if (e.matches && burger.getAttribute("aria-expanded") === "true") close(); };
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
  }

  /* ---------------------------------------------------------
     Apparition au scroll
     --------------------------------------------------------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     Filtres (coachs, workshops, blog)
     --------------------------------------------------------- */
  function initFilters() {
    $$("[data-filter-group]").forEach(function (group) {
      var targetSel = group.getAttribute("data-filter-group");
      var items = $$("[data-tags]", document.querySelector(targetSel) || document);
      var empty = $("[data-filter-empty]", (document.querySelector(targetSel) || document).parentNode || document);

      group.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-filter]");
        if (!btn) return;
        var value = btn.getAttribute("data-filter");

        $$("button[data-filter]", group).forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });

        var shown = 0;
        items.forEach(function (item) {
          var tags = (item.getAttribute("data-tags") || "").split(/\s+/);
          var match = value === "all" || tags.indexOf(value) !== -1;
          item.hidden = !match;
          if (match) shown++;
        });
        if (empty) empty.hidden = shown !== 0;
      });
    });
  }

  /* ---------------------------------------------------------
     Formulaires : validation puis composition d'un e-mail
     Aucune donnée n'est transmise sans action de l'utilisateur —
     la soumission ouvre son client mail avec un message prérempli.
     --------------------------------------------------------- */
  var MESSAGES = {
    required: { fr: "Ce champ est obligatoire.", en: "This field is required." },
    email:    { fr: "Indiquez une adresse e-mail valide.", en: "Please enter a valid email address." },
    consent:  { fr: "Merci de cocher cette case pour continuer.", en: "Please tick this box to continue." },
    sent:     {
      fr: "Votre logiciel de messagerie s'ouvre avec le message prérempli. Rien n'a été envoyé automatiquement : relisez, puis cliquez sur « Envoyer ».",
      en: "Your email app is opening with the message pre-filled. Nothing was sent automatically: review it, then hit Send."
    },
    invalid:  {
      fr: "Le formulaire comporte des champs à corriger.",
      en: "Some fields need to be corrected."
    }
  };

  function say(id) { return MESSAGES[id][currentLang] || MESSAGES[id].fr; }

  function initForms() {
    $$("form[data-mailto]").forEach(function (form) {
      var status = $("[data-form-status]", form);

      form.setAttribute("novalidate", "novalidate");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var firstInvalid = null;
        var lines = [];

        $$("input, select, textarea", form).forEach(function (input) {
          if (!input.name) return;
          var field = input.closest(".field");
          var error = field ? $(".field__error", field) : null;
          var value = input.type === "checkbox" ? input.checked : input.value.trim();
          var problem = "";

          if (input.required && !value) {
            problem = input.type === "checkbox" ? say("consent") : say("required");
          } else if (input.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
            problem = say("email");
          }

          if (field) field.setAttribute("data-invalid", String(!!problem));
          if (error) error.textContent = problem;
          input.setAttribute("aria-invalid", String(!!problem));
          if (problem && !firstInvalid) firstInvalid = input;

          if (!problem && value) {
            var label = field ? ($("label", field) || {}).textContent : input.name;
            lines.push((label || input.name).replace(/\s*\*\s*$/, "").trim() + " : " +
                       (input.type === "checkbox" ? "oui / yes" : input.value.trim()));
          }
        });

        if (firstInvalid) {
          if (status) status.textContent = say("invalid");
          firstInvalid.focus();
          return;
        }

        var to = form.getAttribute("data-mailto");
        var subject = form.getAttribute("data-subject") || "Site Swiss-made Coaching";
        var body = lines.join("\n");
        if (status) status.textContent = say("sent");
        window.location.href = "mailto:" + to +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
      });
    });
  }

  /* ---------------------------------------------------------
     Divers
     --------------------------------------------------------- */
  function initYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  function initLangButtons() {
    $$("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () { applyLang(btn.getAttribute("data-lang-btn")); });
    });
  }

  function boot() {
    captureBaseline();
    initLangButtons();
    applyLang(initialLang());
    initDrawer();
    initReveal();
    initFilters();
    initForms();
    initYear();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
