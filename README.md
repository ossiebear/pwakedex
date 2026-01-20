# PWAkedex 🐲

A modern Progressive Web App (PWA) Pokédex powered by the PokeAPI, featuring offline-first architecture, IndexedDB caching, and a responsive Bootstrap 5 interface.

[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen)](https://web.dev/progressive-web-apps/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-purple)](https://getbootstrap.com/)
[![Dexie.js](https://img.shields.io/badge/Dexie.js-3.2.2-blue)](https://dexie.org/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-orange)](https://d3js.org/)

## 🌟 Features

### Core Functionality
- **1000+ Pokémon Database** - Browse and search through all Pokémon from generations 1-9.
- **Detailed Pokémon Views** - View comprehensive stats, abilities, types, descriptions, evolutions, and variants.
- **Offline-First Architecture** - Works without internet connection after initial load using Dexie.js (IndexedDB).
- **Sequential Loading** - Smart data fetching that respects API rate limits.
- **Advanced Search** - Filter by name and ID.
- **Type-Based UI** - Color-coded cards and elements based on Pokémon types (e.g., Fire = Red, Water = Blue).
- **Stats Visualization** - Dynamic bar charts for base stats using D3.js.
- **Web Share API** - Native sharing capabilities with progressive fallbacks.

### PWA Capabilities
- **Installable** - Native-like experience on desktop and mobile.
- **Service Worker Caching** - Pre-caches app shell and assets for instant loading.
- **Update Management** - Versioned cache management with update notifications (toast alerts).
- **Responsive Design** - Fully optimized for all screen sizes using Bootstrap 5.

## 🛠️ Technology Stack

### Frontend & UI
- **HTML5** & **CSS3** (Custom + Bootstrap)
- **Bootstrap 5.3.8** - Layout and components.
- **Google Fonts** - Poppins font family.

### JavaScript & Data
- **ES6 Modules** - Structured, modular code architecture.
- **Dexie.js** - Wrapper for IndexedDB to handle offline data storage.
- **D3.js** - Data visualization for Pokémon stats.
- **Howler.js** - Audio library integration (cries).
- **Service Worker API** - Advanced caching strategies (Stale-While-Revalidate pattern).

## 📂 Project Structure

```
z:/pwakedex/
├── CSS/                # Stylesheets (base, components, specific pages)
├── JS/                 # Application logic
│   ├── fetch-and-db.js     # Data fetching and DB coordination
│   ├── indexed-db-funcs.js # Dexie.js database operations
│   ├── grid-render.js      # Main grid rendering logic
│   ├── detail-render.js    # Detail page rendering logic
│   ├── detail-render-chart.js # D3.js chart generation
│   ├── share-manager.js    # Web Share API functionality
│   └── version-manager.js  # PWA updates and installation
├── lib/                # Third-party libraries (Bootstrap, Dexie, Howler)
├── favicon/            # PWA icons and manifest
├── templates/          # HTML templates
├── index.html          # Main entry point (Grid view)
├── pokemon-detail.html # Detail view
├── service_worker.js   # PWA Service Worker
└── README.md           # Project documentation
```

## 🚀 Deployment & Usage

### Live Demo
Visit the university deployment: [PWAkedex](https://srv-peda2.iut-acy.univ-smb.fr/collinso/pwakedex/)

### Local Development
1. Clone the repository.
2. Serve the directory using a local web server (e.g., Live Server in VS Code, Python `http.server`, or Node `http-server`).
   *Note: PWA features (Service Worker) require HTTPS or `localhost` context.*

```bash
# Example using Python
python -m http.server 8000
```

## 📝 Development Notes

- **Caching Strategy**: The app uses a cache-first strategy. It checks IndexedDB (via Dexie) before hitting the PokeAPI.
- **Versioning**: Increment the `VERSION` constant in `service_worker.js` to force clients to update their cache.
- **Sanitization**: All inputs are sanitized before being stored in IndexedDB to prevent XSS.

---
*Created by Oscar Collins for a University Project.*
