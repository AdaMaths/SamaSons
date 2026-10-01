# SamaSons

Bibliothèque musicale publique en lecture seule pour les visiteurs, administrable par un seul compte.

## Fonctions
- Recherche par titre, chanteur et catégorie
- Fiches artistes déduites du catalogue
- Lecteur audio web
- Ajout et suppression de morceaux réservés à l'administrateur
- Interface mobile et base PWA
- Firestore pour le catalogue, Firebase Storage pour les fichiers audio

## 1. Installer
```bash
npm install
npm run dev
```

## 2. Configurer Firebase
1. Crée un projet sur https://console.firebase.google.com/
2. Ajoute une application Web et copie sa configuration dans `src/firebase.js`.
3. Active Authentication > Sign-in method > Email/Password.
4. Crée ton utilisateur administrateur dans Authentication.
5. Copie son UID et remplace `ADMIN_UID` dans `firestore.rules` et `storage.rules`.
6. Crée la base Firestore et active Storage.
7. Publie les règles depuis la console Firebase (Firestore Database > Rules et Storage > Rules).

**Important :** ne déploie jamais les règles avec `ADMIN_UID` inchangé. Les règles ci-jointes permettent la lecture publique, mais réservent les modifications à l'UID configuré.

## 3. Lancer et déployer
```bash
npm run build
```
Pousse le dossier dans un dépôt GitHub, puis importe ce dépôt dans Vercel. Vercel détecte Vite automatiquement ; commande de build `npm run build`, dossier de sortie `dist`.

## 4. Installer sur Android
Une fois publié en HTTPS, ouvre le site dans Chrome puis menu ⋮ > Ajouter à l'écran d'accueil / Installer l'application.

## Notes
- Les sons ajoutés sont visibles par tous les visiteurs.
- Les fichiers audio sont publics en lecture : n'ajoute que des fichiers que tu as le droit de partager.
- Les exemples d'accueil sont uniquement un aperçu et ne sont pas stockés dans Firebase.
- Le service worker offre une mise en cache basique de l'interface ; la lecture des fichiers audio nécessite une connexion internet.
