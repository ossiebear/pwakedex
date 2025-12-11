# PWAkedex - AI Coding Assistant Instructions

## Project Overview
PWAkedex is a Progressive Web App (PWA) that displays Pokémon data from the PokeAPI. It features offline-first architecture with IndexedDB caching using Dexie.js, service worker-based asset caching, and Bootstrap 5 UI components.

## Architecture

### Data Flow: Cache-First Strategy
1. **User requests Pokémon** → `pokemon-grid.js` calls `getPokemonDataFromDexieOrAPI()`
2. **Check IndexedDB first** → `indexed-db-funcs.js` queries Dexie DB (`PWAkedexDB`)
3. **If cache miss** → Fetch from `https://pokeapi.co/api/v2/pokemon/{id}` 
4. **Store in DB** → Full JSON stored in `full_json_data` field with indexed metadata (id, name, type1, type2, weight, height)
5. **Return data** → UI renders Pokémon cards

### Key Modules
- **`fetch-and-DB.js`**: Main data orchestration - handles API requests and DB coordination
- **`indexed-db-funcs.js`**: Dexie wrapper - DB initialization, CRUD operations, sanitization
- **`pokemon-grid.js`**: UI generation - sequential grid rendering with type-based color coding
- **`version-manager.js`**: PWA lifecycle - handles install prompts, service worker registration, update notifications
- **`service_worker.js`**: Asset caching - manages static file caching with version-based invalidation
- **`share-manager.js`**: Web Share API integration - native sharing with progressive fallbacks (clipboard/modal)

### PWA-Specific Patterns

#### Service Worker Versioning
Increment `VERSION` constant in `service_worker.js` to force cache refresh:
```javascript
const VERSION = '0.2'; // Bump this to invalidate client caches
```

#### Bootstrap Component Initialization
Always use the safe initialization pattern from `version-manager.js`:
```javascript
function initBootstrapComponent(element, factory, label) {
    if(!element) {
        console.warn(`${label} skipped: element missing`);
        return null;
    }
    try {
        return factory(element);
    } catch(error) {
        console.error(`Failed to init ${label}:`, error);
        return null;
    }
}
```

#### PWA Installation Flow
1. Capture `beforeinstallprompt` event → Store in global variable
2. Show custom Bootstrap modal → User clicks install
3. Call `event.prompt()` → Browser shows native install prompt
4. Register service worker after installation

## Conventions

### Module System
- All JavaScript uses **ES6 modules** (`import`/`export`)
- External CDN libraries imported via ESM: `import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.2/dist/dexie.mjs'`
- Scripts loaded with `defer` and `type="module"` in HTML

### Logging Standards
Use emoji prefixes for visibility:
- `🟢🐲` - Data retrieved from IndexedDB cache
- `🔵🐲` - Fetching from PokeAPI
- `✅` - API success
- `❌` - API error
- `🗃️` - Database write operation
- `📤` - Share action (Web Share API)

### Pokémon Type Colors
`TYPE_COLORS` object in `pokemon-grid.js` defines brand colors. Always use uppercase keys:
```javascript
TYPE_COLORS.FIRE // '#e62829'
TYPE_COLORS.WATER // '#2980ef'
```

### HTML Comments
Use structured banner comments to mark sections:
```javascript
// SECTION NAME___________________________________________________________
    // code here
//________________________________________________________________________________________
```

### Input Sanitization
All user-provided strings must pass through `sanitizeString()` before DB storage:
```javascript
function sanitizeString(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[<>'"&]/g, char => {
        const entities = {'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','&':'&amp;'};
        return entities[char];
    }).trim();
}
```

## Development Notes

### Deployment Paths
Hardcoded absolute paths for university server deployment at `/collinso/pwakedex/`:
- Manifest: `/collinso/pwakedex/favicon/site.webmanifest`
- Assets: `/collinso/pwakedex/favicon/*`

When developing locally, these paths may need adjustment.

### Junkyard Pattern
Old/experimental code lives in `JS/junkyard/` - don't delete, kept for reference:
- `fetch-and-cache.js` (old caching approach)
- `advanced-search.js` (feature in progress)
- `version-manager-old.js` (previous PWA implementation)
- `share-test.html` (Web Share API testing page)

### Sequential vs Parallel Loading
Pokémon grid loads **sequentially** to avoid API rate limits:
```javascript
function addPokemon(i) {
    if (i <= end) {
        getPokemonDataFromDexieOrAPI(i)
        .then(function(pokemon) {
            // ... render card ...
            addPokemon(i + 1); // Recursive call after completion
        });
    }
}
```

### Bootstrap Integration
- Using Bootstrap 5.3.8 (local copy in `lib/`)
- Components initialized via JavaScript API, not data attributes alone
- Toast notifications for PWA updates have 10-second delay

## Common Tasks

**Add a new Pokémon attribute to DB schema:**
1. Update `db.version(1).stores()` in `indexed-db-funcs.js`
2. Modify `formatApiResponseForDB()` to extract new field
3. Update `cachePokemonData()` in `fetch-and-DB.js`

**Force client cache refresh:**
Increment `VERSION` in `service_worker.js` - triggers full re-cache on next visit

**Debug data flow:**
Check console for emoji-prefixed logs showing cache hits/misses and API calls

**Add new type color:**
Add to `TYPE_COLORS` in `pokemon-grid.js` with uppercase key matching PokeAPI type name

**Code formatting:**
follow and copy existing code style for consistency
use capitals in constants
do not use var, use let/const
do not use arrow functions 
avoid using promises directly, use async/await where possible
