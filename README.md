# Club Catalist

**Simulateur de gestion marketing d'un club de sport — by C'mon Sports.**

▶ **Jouer : [cmoncorporations-stack.github.io/club-catalist](https://cmoncorporations-stack.github.io/club-catalist/)**

Vous êtes recruté·e comme Responsable Marketing Digital d'un club de sport suisse.
Chaque semaine, répartissez vos points d'action entre contenu, campagnes, collecte de
données, sponsors et conformité. Faites progresser votre score DMOS, valorisez votre
fanbase, satisfaites vos sponsors et atteignez les objectifs du comité directeur…
sous peine de licenciement.

## Le jeu

- **4 clubs jouables** (hockey, football, basketball, volleyball), en 1re ou 2e division
- **3 niveaux de difficulté** — patience du comité directeur, fréquence des scénarios d'ego
- **Saison de 26 semaines** : 3 points d'action par semaine, un match simulé chaque semaine
- **Promotion / relégation / coupe d'Europe** : monter fait grimper les revenus, mais aussi
  les charges et les attentes des fans
- **Score DMOS** (6 piliers /60), **valorisation Fan Lab**, portefeuille sponsors,
  taux de pénétration du bassin CRM

### Le rôle de C'mon Sports

Sans accompagnement, le club pilote à l'aveugle : score DMOS affiché en fourchette,
valeur de la fanbase inconnue, qualité des données invisible. L'onglet **C'mon Sports**
donne accès aux vraies solutions — Audit DMOS, Fan Lab Insight & Pro, Data Factory,
Blue Penguin, Griddy Picks — qui révèlent ces indicateurs et transforment durablement
le tableau de bord.

## Technique

Application **single-file** en JavaScript vanilla : aucun build, aucune dépendance,
aucun framework. Le jeu tient dans `index.html` ; les polices Raleway sont
auto-hébergées dans `fonts/`.

```bash
# lancer en local
python3 -m http.server 4174
# puis ouvrir http://localhost:4174
```

Le fichier fonctionne aussi en ouverture directe (`file://`).

## Confidentialité (RGPD / nLPD)

Privacy by design : **aucune donnée ne quitte le navigateur** par défaut. Pas de serveur,
pas de cookie, pas de traceur, aucune requête externe. Comptes (e-mail), codes PIN
(hachés SHA-256 salés) et sauvegardes vivent dans le `localStorage` de l'appareil.

Seule exception, sur consentement explicite (case décochée par défaut) : l'inscription
aux actualités C'mon Sports transmet l'adresse e-mail à Brevo avec le marqueur
`CMON_SOLUTION_CLUBCATALIST`.

La clé API Brevo se configure via le lien **⚙️ Admin** du pied de page et reste stockée
localement dans le navigateur de l'opérateur — **elle n'est jamais présente dans ce dépôt**.
Un déploiement public ne permet donc aucune synchronisation Brevo tant qu'aucune clé n'a
été saisie sur le poste concerné.

Export et effacement des données en un clic depuis le pied de page.

---

© C'mon Corporations SàRL — La Chaux-de-Fonds, Suisse
