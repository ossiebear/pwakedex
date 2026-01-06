# PWAkedex 🐲

Une application web progressive (PWA) moderne de Pokédex alimentée par la PokeAPI, avec architecture offline-first, mise en cache IndexedDB et interface Bootstrap 5 responsive.

[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen)](https://web.dev/progressive-web-apps/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple)](https://getbootstrap.com/)
[![Dexie.js](https://img.shields.io/badge/Dexie.js-3.2.2-blue)](https://dexie.org/)

## 🌟 Fonctionnalités

### Fonctionnalités principales
- **Base de données 1000+ Pokémon** - Parcourez et recherchez tous les Pokémon des générations 1 à 9
- **Vues détaillées des Pokémon** - Consultez des statistiques complètes, capacités, types et descriptions
- **Partage natif** - Partagez des Pokémon avec l'API Web Share incluant les images (avec solutions de repli pour les navigateurs non compatibles)
- **Recherche avancée** - Filtrez par nom, ID, type, taille, poids et capacités
- **Coloration par type** - Cartes et badges colorés selon les types de Pokémon
- **Chaînes d'évolution** - Visualisation interactive des chaînes d'évolution
- **Visualisation des statistiques** - Graphiques radar alimentés par D3.js pour les statistiques de base

### Capacités PWA
- **Architecture Offline-First** - Fonctionne sans connexion internet après le chargement initial
- **Installable** - Installation en tant qu'application native sur bureau et mobile
- **Mise en cache Service Worker** - Mise en cache intelligente des ressources statiques et réponses API
- **Notifications de mise à jour** - Alertes toast lorsque de nouvelles versions sont disponibles
- **Design responsive** - Optimisé pour ordinateurs de bureau, tablettes et écrans mobiles

### Performance
- **Cache IndexedDB** - Récupération de données ultra-rapide avec Dexie.js
- **Chargement séquentiel** - Appels API respectueux des limites de débit pour éviter la limitation
- **Chargement paresseux** - Chargez plus de Pokémon à la demande avec le bouton "Charger plus"
- **Images optimisées** - Format WebP pour les icônes et logos

## 🚀 Démonstration en direct

Visitez l'application en direct : [PWAkedex](https://srv-peda2.iut-acy.univ-smb.fr/collinso/pwakedex/)

## 🛠️ Stack technologique

### Frontend
- **HTML5** - Balisage sémantique avec balises méta PWA
- **CSS3** - Styles personnalisés avec CSS Grid et Flexbox
- **Bootstrap 5.3.8** - Composants UI et mise en page responsive
- **Google Fonts** - Famille de polices Poppins

### JavaScript
- **Modules ES6** - Syntaxe import/export moderne
- **Dexie.js 3.2.2** - Wrapper IndexedDB pour la persistance des données
- **D3.js v7** - Visualisation de données pour les graphiques de statistiques
- **API Service Worker** - Mise en cache des ressources et support hors ligne

### Source de données
- **PokeAPI v2** - API Pokémon RESTful (https://pokeapi.co/api/v2/)

## 📁 Structure du projet

```
pwakedex/
├── index.html                 # Page principale de grille
├── pokemon-detail.html        # Page détaillée de Pokémon individuel
├── service_worker.js          # Service worker PWA avec mise en cache
├── CSS/
│   └── style.css             # Styles personnalisés et design responsive
├── JS/
│   ├── fetch-and-DB.js       # Orchestration API et coordination DB
│   ├── indexed-db-funcs.js   # Wrapper Dexie pour opérations IndexedDB
│   ├── pokemon-grid.js       # Rendu de grille séquentiel avec couleurs de type
│   ├── pokemon-detail.js     # Récupération de données page détaillée et graphiques D3
│   ├── version-manager.js    # Cycle de vie PWA et invites d'installation
│   ├── share-manager.js      # API Web Share avec solutions de repli progressives
│   └── junkyard/             # Code expérimental archivé
├── lib/
│   ├── bootstrap-5.3.8-dist/ # Bundle Bootstrap local
│   └── dexie/                # Module Dexie.js local
├── IMG/
│   ├── logo/                 # Logos de l'application (JPG, PNG, WebP)
│   ├── elements/             # Icônes de type (Feu, Eau, Plante, etc.)
│   └── backgrounds/          # Images d'arrière-plan
└── favicon/
    └── site.webmanifest      # Fichier manifeste PWA
```

## 🏗️ Architecture

### Flux de données : Stratégie Cache-First

```
Requête utilisateur → pokemon-grid.js
              ↓
      getPokemonDataFromDexieOrAPI()
              ↓
      Vérifier IndexedDB (Dexie)
         ↙          ↘
    Cache trouvé   Cache manquant
        ↓             ↓
   Retour données  Récupération PokeAPI
                      ↓
                 Stocker en DB
                      ↓
                 Retour données
```

### Modules clés

#### `fetch-and-DB.js`
Couche d'orchestration de données principale qui :
- Gère les requêtes API avec logique de repli
- Coordonne les opérations IndexedDB
- Gère l'entrée de recherche et l'aperçu API

#### `indexed-db-funcs.js`
Wrapper Dexie.js fournissant :
- Initialisation de la base de données (`PWAkedexDB`)
- Opérations CRUD avec nettoyage
- Schéma : `id, name, type1, type2, weight, height, full_json_data`

#### `pokemon-grid.js`
Module de génération d'interface qui :
- Rend la grille de cartes Pokémon séquentielle
- Applique la coloration basée sur le type depuis `TYPE_COLORS`
- Implémente la pagination "Charger plus"

#### `version-manager.js`
Gestionnaire du cycle de vie PWA qui :
- Capture les événements `beforeinstallprompt`
- Affiche une modal d'installation Bootstrap personnalisée
- Enregistre le service worker
- Affiche les notifications de mise à jour via toast

#### `share-manager.js`
Intégration de l'API Web Share fournissant :
- Dialogues de partage natifs sur les plateformes compatibles
- Partage d'images (sprites Pokémon) lorsque disponible
- Repli progressif : Web Share → API Clipboard → Modal manuel
- Notifications toast pour retour utilisateur
- Détection de fonctionnalités pour UX optimale
- Pré-mise en cache des ressources statiques lors de l'installation
- Intercepte les requêtes fetch
- Implémente l'invalidation du cache basée sur la version

## 🔧 Installation et configuration

### Développement local

1. **Cloner le dépôt**
```bash
git clone https://github.com/yourusername/pwakedex.git
cd pwakedex
```

2. **Ajuster les chemins de déploiement** (si nécessaire)
   
   Pour le développement local, mettez à jour les chemins codés en dur dans :
   - `index.html` - Chemins manifeste et icône
   - `pokemon-detail.html` - Chemins manifeste et icône
   - `favicon/site.webmanifest` - URL de démarrage et portée

   Changez `/collinso/pwakedex/` en `./` pour des chemins relatifs.

3. **Servir avec un serveur local**
```bash
# Utilisation de Python
python -m http.server 8000

# Utilisation de Node.js (http-server)
npx http-server -p 8000

# Utilisation de PHP
php -S localhost:8000
```

4. **Ouvrir dans le navigateur**
```
http://localhost:8000
```

### Déploiement en production

1. **Mettre à jour les chemins** dans les fichiers suivants :
   - `index.html` - Lignes 11, 24-28
   - `pokemon-detail.html` - Lignes 11, 24-28
   - `favicon/site.webmanifest` - `start_url` et `scope`

2. **Incrémenter la version du service worker**
   
   Dans `service_worker.js`, augmentez la constante `VERSION` :
   ```javascript
   const VERSION = '0.4'; // Force le rafraîchissement du cache client
   ```

3. **Déployer** sur votre serveur web
   - Assurez-vous que HTTPS est activé (requis pour PWA)
   - Configurez les types MIME appropriés pour `.webmanifest`

## 💻 Utilisation

### Recherche de base
1. Entrez le nom du Pokémon ou l'ID dans la barre de recherche
2. Cliquez sur "Rechercher" ou appuyez sur Entrée
3. Consultez les informations détaillées sur la page de détail

### Filtres avancés
1. Cliquez sur le bouton "Recherche avancée"
2. Définissez les filtres :
   - **Plage d'ID** - Filtrer par numéro de Pokédex
   - **Poids/Taille** - Définir les valeurs min/max
   - **Types** - Cliquez sur les cartes d'éléments pour filtrer
   - **Capacités** - Sélectionnez dans le menu déroulant
3. Cliquez sur "Appliquer les filtres"

### Installer en tant que PWA
1. Cliquez sur "Installer PWA ?" dans la barre de navigation
2. Confirmez l'installation dans la modal
3. L'application apparaît comme application autonome
4. Fonctionne hors ligne après le chargement initial des données

### Partager un Pokémon
1. Ouvrez n'importe quelle page de détail de Pokémon
2. Cliquez sur le bouton "Partager" sous le nom du Pokémon
3. Choisissez votre méthode de partage (messagerie, réseaux sociaux, etc.)
4. Sur les navigateurs non compatibles, le lien est copié automatiquement dans le presse-papiers

## 🎨 Personnalisation

### Ajouter de nouveaux attributs Pokémon à la DB

1. **Mettre à jour le schéma** dans `indexed-db-funcs.js` :
```javascript
db.version(1).stores({
    pokemon: 'id, name, type1, type2, weight, height, nouvelAttribut, full_json_data'
});
```

2. **Modifier le formateur** dans `indexed-db-funcs.js` :
```javascript
export function formatApiResponseForDB(pokeAPI_json) {
    return {
        // ...champs existants...
        nouvelAttribut: sanitizeString(pokeAPI_json.nouvelAttribut) || null,
        full_json_data: pokeAPI_json
    };
}
```

3. **Mettre à jour la mise en cache** dans `fetch-and-DB.js` :
```javascript
const formattedData = {
    // ...champs existants...
    nouvelAttribut: apiData.nouvelAttribut,
    full_json_data: apiData
};
```

### Ajouter de nouvelles couleurs de type

Dans `pokemon-grid.js`, ajoutez à l'objet `TYPE_COLORS` :
```javascript
const TYPE_COLORS = {
    // ...couleurs existantes...
    NOUVEAUTYPE: '#hexcode',
};
```

**Note :** Les clés doivent être en MAJUSCULES pour correspondre aux noms de types PokeAPI.

## 📝 Conventions de code

### Système de modules
- Modules ES6 (`import`/`export`)
- Pas de CommonJS ou AMD
- Scripts chargés avec `defer` et `type="module"`

### Style de code
- Utiliser `const` et `let`, jamais `var`
- Éviter les fonctions fléchées (convention du projet)
- Utiliser `async`/`await` plutôt que des Promises brutes
- SCREAMING_SNAKE_CASE pour les constantes
- camelCase pour les variables et fonctions

### Standards de journalisation
Utiliser des préfixes emoji pour la visibilité :
- `🟢🐲` - Cache trouvé (données depuis IndexedDB)
- `🔵🐲` - Appel API (récupération depuis PokeAPI)
- `✅` - Succès
- `❌` - Erreur
- `🗃️` - Écriture en base de données

### Commentaires HTML
Format de bannière structurée :
```javascript
// NOM DE SECTION___________________________________________________________
    // code ici
//________________________________________________________________________________________
```

### Nettoyage des entrées
Toutes les chaînes utilisateur doivent passer par `sanitizeString()` :
```javascript
function sanitizeString(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[<>'"&]/g, char => {
        const entities = {'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','&':'&amp;'};
        return entities[char];
    }).trim();
}
```

## 🐛 Dépannage

### Le Service Worker ne se met pas à jour
1. Incrémenter `VERSION` dans `service_worker.js`
2. Rafraîchir le navigateur en dur (`Ctrl+Shift+R` ou `Cmd+Shift+R`)
3. Vider manuellement le cache du navigateur
4. Désenregistrer le service worker dans DevTools → Application → Service Workers

### Les Pokémon ne se chargent pas
1. Vérifier la console pour les journaux préfixés emoji
2. Vérifier IndexedDB dans DevTools → Application → Storage
3. Tester l'API directement : `https://pokeapi.co/api/v2/pokemon/1`
4. Vider IndexedDB et recharger la page

### L'invite d'installation PWA ne s'affiche pas
- HTTPS requis (pas `http://`)
- `site.webmanifest` valide requis
- Le service worker doit être enregistré
- Les PWA déjà installées n'afficheront plus l'invite

### Les composants Bootstrap ne s'initialisent pas
Vérifier la console pour les avertissements. Assurez-vous que les éléments existent avant l'initialisation :
```javascript
if(element) {
    const component = new bootstrap.Component(element);
}
```

## 🔮 Améliorations futures

- [ ] Calculateur d'efficacité de type
- [ ] Base de données des attaques avec calculs de dégâts
- [ ] Constructeur d'équipe avec analyse de couverture
- [ ] Basculement de sprite chromatique
- [ ] Support multilingue
- [ ] Effets sonores et cris
- [ ] Filtrage par génération
- [ ] Vue de comparaison (côte à côte)
- [ ] Liste de Pokémon favoris
- [ ] Basculement thème sombre/clair

## 📄 Licence

Ce projet est à but éducatif. Pokémon et les noms de personnages Pokémon sont des marques déposées de Nintendo.

PokeAPI est utilisé dans le cadre de l'usage équitable. Visitez [PokeAPI](https://pokeapi.co/) pour les conditions.

## 👤 Auteur

**Oscar Collins**
- Email : oscar.collins@etu.univ-smb.fr
- Université : Université Savoie Mont Blanc

## 🙏 Remerciements

- [PokeAPI](https://pokeapi.co/) - Données Pokémon RESTful
- [Dexie.js](https://dexie.org/) - Wrapper IndexedDB
- [Bootstrap](https://getbootstrap.com/) - Framework UI
- [D3.js](https://d3js.org/) - Visualisation de données
- [Mozilla MDN](https://developer.mozilla.org/) - Documentation IndexedDB

## 📚 Documentation

Pour les directives de développement détaillées, voir :
- `.github/copilot-instructions.md` - Directives de codage pour assistant IA
- `JS/junkyard/` - Fonctionnalités expérimentales archivées

---

**Construit avec ❤️ et ☕ par Oscar Collins**
