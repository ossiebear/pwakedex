v# PWAkedex 🐲

A modern Progressive Web App (PWA) Pokédex powered by the PokeAPI, featuring offline-first architecture, IndexedDB caching, and a responsive Bootstrap 5 interface.

[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen)](https://web.dev/progressive-web-apps/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple)](https://getbootstrap.com/)
[![Dexie.js](https://img.shields.io/badge/Dexie.js-3.2.2-blue)](https://dexie.org/)

## 🌟 Features

### Core Functionality
- **1000+ Pokémon Database** - Browse and search through all Pokémon from generations 1-9
- **Detailed Pokémon Views** - View comprehensive stats, abilities, types, and descriptions
- **Native Sharing** - Share Pokémon with Web Share API including images (with fallbacks for unsupported browsers)
- **Advanced Search** - Filter by name, ID, type, height, weight, and abilities
- **Type-Based Coloring** - Color-coded cards and badges based on Pokémon types
- **Evolution Chains** - Interactive evolution chain visualization
- **Stats Visualization** - D3.js-powered radar charts for base stats

### PWA Capabilities
- **Offline-First Architecture** - Works without internet connection after initial load
- **Installable** - Install as native app on desktop and mobile devices
- **Service Worker Caching** - Smart caching of static assets and API responses
- **Update Notifications** - Toast alerts when new versions are available
- **Responsive Design** - Optimized for desktop, tablet, and mobile screens

### Performance
- **IndexedDB Cache** - Lightning-fast data retrieval using Dexie.js
- **Sequential Loading** - Rate-limit friendly API calls to prevent throttling
- **Lazy Loading** - Load more Pokémon on demand with "Load More" button
- **Optimized Images** - WebP format for icons and logos

## 🚀 Live Demo

Visit the live application: [PWAkedex](https://srv-peda2.iut-acy.univ-smb.fr/collinso/pwakedex/)

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup with PWA meta tags
- **CSS3** - Custom styles with CSS Grid and Flexbox
- **Bootstrap 5.3.8** - UI components and responsive layout
- **Google Fonts** - Poppins font family

### JavaScript
- **ES6 Modules** - Modern import/export syntax
- **Dexie.js 3.2.2** - IndexedDB wrapper for data persistence
- **D3.js v7** - Data visualization for stats charts
- **Service Worker API** - Asset caching and offline support

### Data Source
- **PokeAPI v2** - RESTful Pokémon API (https://pokeapi.co/api/v2/)

## 📁 Project Structure

```
pwakedex/
├── index.html                 # Main grid view page
├── pokemon-detail.html        # Individual Pokémon detail page
├── service_worker.js          # PWA service worker with caching
├── CSS/
│   └── style.css             # Custom styles and responsive design
├── JS/
│   ├── fetch-and-DB.js       # API orchestration and DB coordination
│   ├── indexed-db-funcs.js   # Dexie wrapper for IndexedDB operations
│   ├── pokemon-grid.js       # Sequential grid rendering with type colors
│   ├── pokemon-detail.js     # Detail page data fetching and D3 charts
│   ├── version-manager.js    # PWA lifecycle and install prompts
│   ├── share-manager.js      # Web Share API with progressive fallbacks
│   └── junkyard/             # Archived experimental code
├── lib/
│   ├── bootstrap-5.3.8-dist/ # Local Bootstrap bundle
│   └── dexie/                # Local Dexie.js module
├── IMG/
│   ├── logo/                 # App logos (JPG, PNG, WebP)
│   ├── elements/             # Type icons (Fire, Water, Grass, etc.)
│   └── backgrounds/          # Background images
└── favicon/
    └── site.webmanifest      # PWA manifest file
```

## 🏗️ Architecture

### Data Flow: Cache-First Strategy

```
User Request → pokemon-grid.js
              ↓
      getPokemonDataFromDexieOrAPI()
              ↓
      Check IndexedDB (Dexie)
         ↙          ↘
    Cache Hit    Cache Miss
        ↓             ↓
   Return Data   Fetch from PokeAPI
                      ↓
                 Store in DB
                      ↓
                 Return Data
```

### Key Modules

#### `fetch-and-DB.js`
Main data orchestration layer that:
- Handles API requests with fallback logic
- Coordinates IndexedDB operations
- Manages search input and API preview

#### `indexed-db-funcs.js`
Dexie.js wrapper providing:
- Database initialization (`PWAkedexDB`)
- CRUD operations with sanitization
- Schema: `id, name, type1, type2, weight, height, full_json_data`

#### `pokemon-grid.js`
UI generation module that:
- Renders sequential Pokémon card grid
- Applies type-based color coding from `TYPE_COLORS`
- Implements "Load More" pagination

#### `version-manager.js`
PWA lifecycle manager that:
- Captures `beforeinstallprompt` events
- Shows custom Bootstrap install modal
- Registers service worker
- Displays update notifications via toast

#### `share-manager.js`
Web Share API integration providing:
- Native share dialogs on supported platforms
- Image sharing (Pokémon sprites) when available
- Progressive fallback: Web Share → Clipboard API → Manual modal
- Toast notifications for user feedback
- Feature detection for optimal UX
- Pre-caches static resources on install
- Intercepts fetch requests
- Implements version-based cache invalidation

## 🔧 Installation & Setup

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/pwakedex.git
cd pwakedex
```

2. **Adjust deployment paths** (if needed)
   
   For local development, update hardcoded paths in:
   - `index.html` - Manifest and icon paths
   - `pokemon-detail.html` - Manifest and icon paths
   - `favicon/site.webmanifest` - Start URL and scope

   Change `/collinso/pwakedex/` to `./` for relative paths.

3. **Serve with a local server**
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

4. **Open in browser**
```
http://localhost:8000
```

### Production Deployment

1. **Update paths** in the following files:
   - `index.html` - Lines 11, 24-28
   - `pokemon-detail.html` - Lines 11, 24-28
   - `favicon/site.webmanifest` - `start_url` and `scope`

2. **Increment service worker version**
   
   In `service_worker.js`, bump the `VERSION` constant:
   ```javascript
   const VERSION = '0.4'; // Force client cache refresh
   ```

3. **Deploy** to your web server
   - Ensure HTTPS is enabled (required for PWA)
   - Configure proper MIME types for `.webmanifest`

## 💻 Usage

### Basic Search
1. Enter Pokémon name or ID in the search bar
2. Click "Search" or press Enter
3. View detailed information on the detail page

### Advanced Filters
1. Click "Advanced Search" toggle
2. Set filters:
   - **ID Range** - Filter by Pokédex number
   - **Weight/Height** - Set min/max values
   - **Types** - Click element cards to filter
   - **Abilities** - Select from dropdown
3. Click "Apply Filters"

### Install as PWA
1. Click "Install PWA?" in the navbar
2. Confirm installation in the modal
3. App appears as standalone application
4. Works offline after initial data load

### Share Pokémon
1. Open any Pokémon detail page
2. Click the "Share" button below the Pokémon name
3. Choose your sharing method (messaging, social media, etc.)
4. On unsupported browsers, link is copied to clipboard automatically

## 🎨 Customization

### Adding New Pokémon Attributes to DB

1. **Update schema** in `indexed-db-funcs.js`:
```javascript
db.version(1).stores({
    pokemon: 'id, name, type1, type2, weight, height, newAttribute, full_json_data'
});
```

2. **Modify formatter** in `indexed-db-funcs.js`:
```javascript
export function formatApiResponseForDB(pokeAPI_json) {
    return {
        // ...existing fields...
        newAttribute: sanitizeString(pokeAPI_json.newAttribute) || null,
        full_json_data: pokeAPI_json
    };
}
```

3. **Update caching** in `fetch-and-DB.js`:
```javascript
const formattedData = {
    // ...existing fields...
    newAttribute: apiData.newAttribute,
    full_json_data: apiData
};
```

### Adding New Type Colors

In `pokemon-grid.js`, add to `TYPE_COLORS` object:
```javascript
const TYPE_COLORS = {
    // ...existing colors...
    NEWTYPE: '#hexcode',
};
```

**Note:** Keys must be UPPERCASE to match PokeAPI type names.

## 📝 Code Conventions

### Module System
- ES6 modules (`import`/`export`)
- No CommonJS or AMD
- Scripts loaded with `defer` and `type="module"`

### Code Style
- Use `const` and `let`, never `var`
- Avoid arrow functions (project convention)
- Use `async`/`await` over raw Promises
- SCREAMING_SNAKE_CASE for constants
- camelCase for variables and functions

### Logging Standards
Use emoji prefixes for visibility:
- `🟢🐲` - Cache hit (data from IndexedDB)
- `🔵🐲` - API call (fetching from PokeAPI)
- `✅` - Success
- `❌` - Error
- `🗃️` - Database write

### HTML Comments
Structured banner format:
```javascript
// SECTION NAME___________________________________________________________
    // code here
//________________________________________________________________________________________
```

### Input Sanitization
All user strings must pass through `sanitizeString()`:
```javascript
function sanitizeString(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[<>'"&]/g, char => {
        const entities = {'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','&':'&amp;'};
        return entities[char];
    }).trim();
}
```

## 🐛 Troubleshooting

### Service Worker Not Updating
1. Increment `VERSION` in `service_worker.js`
2. Hard refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
3. Clear browser cache manually
4. Unregister service worker in DevTools → Application → Service Workers

### Pokémon Not Loading
1. Check console for emoji-prefixed logs
2. Verify IndexedDB in DevTools → Application → Storage
3. Test API directly: `https://pokeapi.co/api/v2/pokemon/1`
4. Clear IndexedDB and reload page

### PWA Install Prompt Not Showing
- HTTPS required (not `http://`)
- Valid `site.webmanifest` required
- Service worker must be registered
- Already installed PWAs won't show prompt again

### Bootstrap Components Not Initializing
Check console for warnings. Ensure elements exist before initialization:
```javascript
if(element) {
    const component = new bootstrap.Component(element);
}
```

## 🔮 Future Enhancements

- [ ] Type effectiveness calculator
- [ ] Move database with damage calculations
- [ ] Team builder with coverage analysis
- [ ] Shiny sprite toggle
- [ ] Multiple language support
- [ ] Sound effects and cries
- [ ] Generation-based filtering
- [ ] Comparison view (side-by-side)
- [ ] Favorite Pokémon list
- [ ] Dark/Light theme toggle

## 📄 License

This project is for educational purposes. Pokémon and Pokémon character names are trademarks of Nintendo.

PokeAPI is used under fair use. Visit [PokeAPI](https://pokeapi.co/) for terms.

## 👤 Author

**Oscar Collins**
- Email: oscar.collins@etu.univ-smb.fr
- University: Université Savoie Mont Blanc

## 🙏 Acknowledgments

- [PokeAPI](https://pokeapi.co/) - RESTful Pokémon data
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- [Bootstrap](https://getbootstrap.com/) - UI framework
- [D3.js](https://d3js.org/) - Data visualization
- [Mozilla MDN](https://developer.mozilla.org/) - IndexedDB documentation

## 📚 Documentation

For detailed development guidelines, see:
- `.github/copilot-instructions.md` - AI assistant coding guidelines
- `JS/junkyard/` - Archived experimental features

---

**Built with ❤️ and ☕ by Oscar Collins**
