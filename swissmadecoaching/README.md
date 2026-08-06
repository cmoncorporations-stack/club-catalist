# Swiss-made Coaching — refonte du site

Site statique bilingue (FR/EN) pour l'association Swiss-made Coaching, à but non lucratif,
basée à Lausanne. Refonte complète : direction artistique « Swiss editorial », UX et UI
retravaillées, accessibilité et performance traitées dès la conception.

**Contenu original.** Le site de référence n'a pas pu être consulté depuis l'environnement de
développement (domaine bloqué par le proxy réseau). Tous les textes de ce dossier ont donc été
rédigés à neuf à partir des informations publiques sur l'association ; rien n'est repris de
l'existant. Les éléments qui ne pouvaient pas être vérifiés sont laissés en placeholder
explicite plutôt qu'inventés — voir « À compléter » plus bas.

## Lancer en local

```bash
python3 -m http.server 4174
# puis ouvrir http://localhost:4174/swissmadecoaching/
```

Aucun build, aucune dépendance, aucun framework. Les fichiers HTML sont autonomes.

## Structure

```
index.html            Accueil
association.html      Mission, cadre Jeunesse & Sport, fonctionnement, gouvernance
coachs.html           Annuaire des coachs
workshops.html        Agenda, filtres, éditions passées, proposer un workshop
blog.html             Index du blog + filtres par thème
blog/*.html           Trois articles au format long-form
membre.html           Adhésion : bénéfices, types, étapes, formulaire
contact.html          Coordonnées + formulaire
404.html
assets/site.css       Design system complet (tokens, grille, composants)
assets/site.js        i18n, navigation mobile, filtres, validation des formulaires
assets/i18n.js        Traductions anglaises uniquement
assets/img/*.svg      Motifs originaux + favicon
fonts/                Raleway auto-hébergée (woff2)
```

## Bilinguisme

Le **français est la langue source** : il vit directement dans le HTML, balisé par
`data-i18n="cle"` (contenu) et `data-i18n-attr="attribut:cle"` (attributs).
`assets/i18n.js` ne contient que les valeurs anglaises — il n'y a donc jamais deux copies du
français à maintenir.

Ajouter une chaîne traduisible :

1. baliser le nœud : `<p data-i18n="ma.cle">Mon texte</p>` ;
2. ajouter `"ma.cle": "My text"` dans `assets/i18n.js`.

La langue est résolue dans cet ordre : `?lang=en` → `localStorage` → langue du navigateur → `fr`.
Les titres et méta-descriptions anglais sont portés par `data-title-en` / `data-desc-en` sur `<html>`.

## En-tête et pied de page

Il n'y a pas de moteur de gabarits (contrainte « zéro build » du dépôt) : les blocs commun sont
dupliqués dans chaque fichier, encadrés par les commentaires
`<!-- ============ EN-TÊTE ... ============ -->` et `<!-- ============ PIED DE PAGE ... ============ -->`.
Une modification de la navigation doit être répercutée dans les onze fichiers HTML.

## Formulaires

Les formulaires d'adhésion et de contact sont validés côté client puis **ouvrent la messagerie de
l'utilisateur avec un message prérempli** (`mailto:`). Il n'y a ni serveur, ni base de données,
ni clé d'API dans ce dépôt, et aucune donnée n'est transmise sans action explicite de l'utilisateur.

Pour brancher un vrai backend plus tard, le point d'entrée unique est
`form[data-mailto]` dans `assets/site.js`.

## À compléter (volontairement laissé vide)

Ces éléments n'ont pas pu être vérifiés et sont marqués comme tels dans l'interface :

- **Coachs** — discipline, rôle et biographie de chaque fiche (`coachs.html`, cartes de l'accueil).
  Seuls les noms publiquement associés à l'association sont repris.
- **Workshops** — les dates réelles : les pastilles affichent « à venir » tant que le calendrier
  n'est pas fourni (`workshops.html`).
- **Adhésion** — les montants de cotisation, fixés par l'assemblée générale (`membre.html`).
- **Gouvernance** — composition du comité, statuts, date de la dernière AG (`association.html`).
- **Contact** — l'adresse `contact@swissmadecoaching.com` et les liens réseaux sociaux sont à
  confirmer (`contact.html`, pied de page, `assets/site.js` via `data-mailto`).
- **Photographies** — chaque emplacement photo est dimensionné et signalé par la mention
  « Emplacement photo ». Remplacer le `<img>` du `.photo-slot` par la vraie image (mêmes
  `width`/`height` pour éviter tout décalage de mise en page) et supprimer le `<span class="photo-slot__note">`.

## Accessibilité et performance

- Lien d'évitement, landmarks, `aria-current`, focus visible, tiroir mobile avec piège à focus
  et fermeture par `Échap`.
- Contrastes conformes AA ; le rouge de marque n'est jamais utilisé pour du petit texte sur fond coloré.
- `prefers-reduced-motion` désactive toutes les animations.
- Zéro requête externe : polices auto-hébergées, images SVG locales, aucun script tiers,
  aucun cookie, aucun traceur.

## Déploiement

Le dossier est autonome et n'utilise que des chemins relatifs : il peut être servi tel quel
depuis un sous-dossier (`/swissmadecoaching/`) ou déplacé à la racine de son propre domaine
sans modification. Dans ce dernier cas, mettre à jour les URL absolues des balises `canonical`,
`og:url` et du `sitemap.xml` si le domaine change.
