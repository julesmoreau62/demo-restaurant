/* ’t Kanneke — un peu de JavaScript, sans dépendance.
   Tout se règle sur l'heure de Lille. Pour une démonstration, on peut la forcer :
   ?jour=4&heure=12:30 (0 = dimanche). Sans JavaScript, chaque page reste complète. */
(function () {
  "use strict";

  var d = document;
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  /* Les services : minutes depuis minuit, [début, fin) */
  var SERVICES = {
    0: [[720, 900]],
    1: [],
    2: [[720, 870], [1140, 1320]],
    3: [[720, 870], [1140, 1320]],
    4: [[720, 870], [1140, 1320]],
    5: [[720, 870], [1140, 1380]],
    6: [[720, 870], [1140, 1380]]
  };

  function maintenant() {
    var p = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris", weekday: "short", year: "numeric", month: "numeric", day: "numeric",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var jour = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    var t = { jour: jour, minutes: +p.hour * 60 + +p.minute, date: new Date(Date.UTC(+p.year, +p.month - 1, +p.day, 12)) };
    var q = location.search, fj = /[?&]jour=([0-6])/.exec(q), fh = /[?&]heure=(\d{1,2})(?:[:h](\d{2}))?/.exec(q);
    if (fj) {
      t.date.setUTCDate(t.date.getUTCDate() + ((+fj[1] - jour + 7) % 7));
      t.jour = +fj[1];
    }
    if (fh) t.minutes = +fh[1] * 60 + +(fh[2] || 0);
    return t;
  }

  /* « dimanche 1er novembre » : une date à midi UTC, pour ne pas glisser d'un jour */
  function dateFr(date) {
    var q = date.getUTCDate();
    return JOURS[date.getUTCDay()] + " " + (q === 1 ? "1er" : q) + " " + new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" }).format(date);
  }

  function heure(m) {
    var h = Math.floor(m / 60), mn = m % 60;
    return h + " h" + (mn ? " " + (mn < 10 ? "0" : "") + mn : "");
  }

  function etatDe(t) {
    var s = SERVICES[t.jour], i, k;
    for (i = 0; i < s.length; i++) {
      if (t.minutes >= s[i][0] && t.minutes < s[i][1]) return { ouvert: true, texte: "Ouvert · on sert jusqu’à " + heure(s[i][1]) };
    }
    for (k = 0; k < 8; k++) {
      var j = (t.jour + k) % 7, ss = SERVICES[j];
      for (i = 0; i < ss.length; i++) {
        if (k === 0 && ss[i][0] <= t.minutes) continue;
        var quand = k === 0 ? "" : k === 1 ? "demain " : JOURS[j] + " ";
        var verbe = k === 0 && i === 0 ? "on ouvre" : "on rouvre";
        return { ouvert: false, texte: (t.jour === 1 ? "Fermé le lundi" : "Fermé") + " · " + verbe + " " + quand + "à " + heure(ss[i][0]) };
      }
    }
    return { ouvert: false, texte: "Fermé" };
  }

  var t = maintenant();
  var etat = etatDe(t);

  /* ---- Ouvert ou fermé, partout où la page le demande ---- */
  d.querySelectorAll("[data-etat]").forEach(function (el) {
    el.querySelector("[data-etat-texte]").textContent = etat.texte;
    el.classList.toggle("etat--ouvert", etat.ouvert);
    el.hidden = false;
  });
  d.querySelectorAll("[data-horaires] [data-jour]").forEach(function (ligne) {
    if (+ligne.getAttribute("data-jour") === t.jour) {
      ligne.classList.add("aujourdhui");
      ligne.setAttribute("aria-current", "date");
    }
  });

  /* ---- L'ardoise : un sous-bock par jour, l'éponge passe, la craie réécrit ---- */
  var semaine = d.querySelector("[data-semaine]");
  if (semaine) ardoise(semaine);

  function ardoise(semaine) {
    var jours = {};
    semaine.querySelectorAll(".jour").forEach(function (li) { jours[li.getAttribute("data-jour")] = li; });
    var titre = d.querySelector("[data-titre-jour]");
    var formule = d.querySelector("[data-formule]");
    var zone = d.querySelector("[data-sous-bocks]");
    var rang = zone.querySelector(".sous-bocks__rang");
    var cadre = semaine.closest(".ardoise__cadre");
    var dateLongue = dateFr(t.date);
    var ORDRE = [2, 3, 4, 5, 6, 0, 1];
    var ABR = { 0: "Di", 1: "Lu", 2: "Ma", 3: "Me", 4: "Je", 5: "Ve", 6: "Sa" };
    var PENTE = [-4, 3, -2, 5, -3, 2, -5];
    var choisi = null, occupe = false;

    var bocks = ORDRE.map(function (j, i) {
      var b = d.createElement("button");
      b.type = "button";
      b.className = "sous-bock" + (j === 1 ? " sous-bock--ferme" : "") + (j === t.jour ? " sous-bock--auj" : "");
      b.textContent = ABR[j];
      b.setAttribute("aria-label", JOURS[j].charAt(0).toUpperCase() + JOURS[j].slice(1) + (j === t.jour ? ", aujourd’hui" : ""));
      b.setAttribute("aria-pressed", "false");
      b.style.setProperty("--r", PENTE[i] + "deg");
      b.addEventListener("click", function () { montrer(j); });
      rang.appendChild(b);
      return b;
    });
    zone.hidden = false;

    function libelle(j) {
      if (j === t.jour) return "Aujourd’hui, " + dateLongue;
      return j === 1 ? "Le lundi" : "Tous les " + JOURS[j] + "s";
    }

    function appliquer(j) {
      Object.keys(jours).forEach(function (k) { jours[k].classList.toggle("est-choisi", +k === j); });
      bocks.forEach(function (b, i) { b.setAttribute("aria-pressed", String(ORDRE[i] === j)); });
      titre.textContent = libelle(j);
      if (formule) formule.hidden = !(j >= 2 && j <= 5);
      choisi = j;
    }

    function montrer(j) {
      if (j === choisi || occupe) return;
      if (reduit || !Element.prototype.animate) { appliquer(j); return; }
      occupe = true;
      var eponge = d.createElement("div");
      eponge.className = "eponge";
      eponge.setAttribute("aria-hidden", "true");
      cadre.appendChild(eponge);
      eponge.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(" + (cadre.clientWidth * 1.2) + "px)" }], { duration: 560, easing: "ease-in-out" });
      var efface = [{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(4px)" }];
      var reglage = { duration: 300, delay: 140, easing: "ease-in", fill: "forwards" };
      var a1 = semaine.animate(efface, reglage), a2 = titre.animate(efface, reglage), fait = false;
      function reecrire() {
        if (fait) return;
        fait = true;
        d.documentElement.classList.add("ardoise-reecrite");
        appliquer(j);
        a1.cancel();
        a2.cancel();
        eponge.remove();
        /* les lignes du jour réapparaissent : l'animation CSS « ecrire » repart d'elle-même */
        titre.animate([{ clipPath: "inset(-40% 100% -40% 0)" }, { clipPath: "inset(-40% 0 -40% 0)" }], { duration: 700, easing: "cubic-bezier(.35,.1,.35,1)" });
        occupe = false;
      }
      a1.onfinish = reecrire;
      /* au cas où l'animation n'irait pas au bout (onglet en arrière-plan) */
      setTimeout(reecrire, 800);
    }

    d.documentElement.classList.add("ardoise-prete");
    appliquer(t.jour);
  }

  /* ---- La carte : filtrer selon ses allergies, voir la photo d'un plat ---- */
  var filtres = d.querySelector("[data-filtres]");
  if (filtres) {
    var NOMS = {
      gluten: "gluten", lait: "lait", oeufs: "œufs", poisson: "poisson", crustaces: "crustacés", mollusques: "mollusques",
      "fruits-a-coque": "fruits à coque", celeri: "céleri", moutarde: "moutarde", sulfites: "sulfites"
    };
    var plats = [].slice.call(d.querySelectorAll(".plat"));
    var ouvrir = filtres.querySelector("[data-filtres-ouvrir]");
    var panneau = d.getElementById(ouvrir.getAttribute("aria-controls"));
    var puces = [].slice.call(filtres.querySelectorAll(".puce"));
    var bilan = filtres.querySelector("[data-bilan]");
    var compte = ouvrir.querySelector("[data-compte]");
    var tout = filtres.querySelector("[data-filtres-vider]");

    ouvrir.addEventListener("click", function () {
      var o = ouvrir.getAttribute("aria-expanded") !== "true";
      ouvrir.setAttribute("aria-expanded", String(o));
      panneau.hidden = !o;
    });
    puces.forEach(function (p) {
      p.addEventListener("click", function () {
        p.setAttribute("aria-pressed", String(p.getAttribute("aria-pressed") !== "true"));
        filtrer();
      });
    });
    tout.addEventListener("click", function () {
      puces.forEach(function (p) { p.setAttribute("aria-pressed", "false"); });
      filtrer();
    });

    function filtrer() {
      var actives = puces.filter(function (p) { return p.getAttribute("aria-pressed") === "true"; });
      var evites = actives.map(function (p) { return p.getAttribute("data-allergene"); }).filter(Boolean);
      var vege = actives.some(function (p) { return p.hasAttribute("data-vege"); });
      var bons = 0;
      plats.forEach(function (pl) {
        var contient = (pl.getAttribute("data-allergenes") || "").split(" ").filter(function (a) { return evites.indexOf(a) > -1; });
        var raison = contient.length ? "Contient : " + contient.map(function (a) { return NOMS[a]; }).join(", ")
          : vege && pl.getAttribute("data-vege") !== "oui" ? "Viande ou poisson" : "";
        var r = pl.querySelector(".plat__raison");
        if (!r) {
          r = d.createElement("p");
          r.className = "plat__raison";
          pl.querySelector(".plat__ligne").after(r);
        }
        r.textContent = raison;
        r.hidden = !raison;
        pl.classList.toggle("plat--ecarte", !!raison);
        if (!raison) bons++;
      });
      var n = actives.length;
      compte.textContent = n ? " (" + n + ")" : "";
      tout.hidden = !n;
      bilan.textContent = n ? (bons ? bons + (bons > 1 ? " plats sur " : " plat sur ") + plats.length + " vous " + (bons > 1 ? "conviennent." : "convient.") : "Aucun plat ne convient : parlez-en au service, on trouvera une solution.") : "";
    }
  }

  d.querySelectorAll("[data-voir-photo]").forEach(function (b) {
    var fig = d.getElementById(b.getAttribute("aria-controls"));
    var mot = b.querySelector("[data-libelle]");
    b.hidden = false;
    b.addEventListener("click", function () {
      var o = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(o));
      fig.classList.toggle("est-ouverte", o);
      mot.textContent = o ? "Cacher la photo" : "Voir le plat";
    });
  });

  /* ---- Les photos : la visionneuse ---- */
  var visionneuse = d.querySelector("[data-visionneuse]");
  if (visionneuse && typeof visionneuse.showModal === "function") {
    var liens = [].slice.call(d.querySelectorAll("[data-agrandir]"));
    var grande = visionneuse.querySelector("img");
    var legende = visionneuse.querySelector("figcaption");
    var position = visionneuse.querySelector("[data-position]");
    var courant = 0;

    function afficher(i) {
      courant = (i + liens.length) % liens.length;
      var lien = liens[courant], vignette = lien.querySelector("img");
      grande.src = lien.getAttribute("href");
      grande.alt = vignette.alt;
      legende.textContent = lien.querySelector("figcaption").textContent;
      position.textContent = (courant + 1) + " / " + liens.length;
    }
    liens.forEach(function (lien, i) {
      lien.addEventListener("click", function (e) {
        e.preventDefault();
        afficher(i);
        visionneuse.showModal();
      });
    });
    visionneuse.querySelector("[data-precedente]").addEventListener("click", function () { afficher(courant - 1); });
    visionneuse.querySelector("[data-suivante]").addEventListener("click", function () { afficher(courant + 1); });
    visionneuse.querySelector("[data-fermer]").addEventListener("click", function () { visionneuse.close(); });
    visionneuse.addEventListener("click", function (e) { if (e.target === visionneuse) visionneuse.close(); });
    visionneuse.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") afficher(courant - 1);
      if (e.key === "ArrowRight") afficher(courant + 1);
    });
    var x0 = null;
    visionneuse.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    visionneuse.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) afficher(courant + (dx < 0 ? 1 : -1));
    });
  }

  /* ---- Venir : le plan Google ne se charge que si on le demande ---- */
  var boutonPlan = d.querySelector("[data-plan]");
  if (boutonPlan) {
    boutonPlan.addEventListener("click", function () {
      var zone = d.querySelector("[data-plan-zone]");
      var cadrePlan = d.createElement("iframe");
      cadrePlan.src = "https://www.google.com/maps?q=Vieux-Lille%2C%2059800%20Lille&z=15&output=embed";
      cadrePlan.title = "Plan Google Maps : le Vieux-Lille";
      cadrePlan.loading = "lazy";
      cadrePlan.referrerPolicy = "no-referrer-when-downgrade";
      zone.appendChild(cadrePlan);
      zone.hidden = false;
      boutonPlan.hidden = true;
      d.querySelector("[data-plan-note]").hidden = true;
    });
  }

  /* ---- Groupes : le formulaire (ici, rien n'est envoyé) ---- */
  var groupe = d.querySelector("[data-groupe]");
  if (groupe) {
    var merci = d.querySelector("[data-merci]");
    var champDate = groupe.elements.date;
    var aujourdhui = t.date.toISOString().slice(0, 10);
    champDate.min = aujourdhui;

    groupe.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!groupe.checkValidity()) {
        groupe.reportValidity();
        return;
      }
      var prenom = groupe.elements.nom.value.trim().split(/\s+/)[0];
      var quand = dateFr(new Date(champDate.value + "T12:00:00Z"));
      merci.querySelector("[data-merci-nom]").textContent = prenom;
      merci.querySelector("[data-merci-detail]").textContent = groupe.elements.couverts.value + " personnes, le " + quand + " (" + groupe.elements.occasion.value.toLowerCase() + ")";
      groupe.hidden = true;
      merci.hidden = false;
      merci.focus();
    });
    merci.querySelector("[data-merci-autre]").addEventListener("click", function () {
      groupe.reset();
      merci.hidden = true;
      groupe.hidden = false;
      groupe.elements.nom.focus();
    });
  }
})();
