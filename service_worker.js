// Service Worker for PWA app
// manages installation and caching of ressources for offline use
// intercepts network requests to serve cached ressources when offline




// app version: bump this string to force clients to refresh the cache
const VERSION = '0.3';
console.log("Service Worker version:", VERSION);

// List of files we want to pre-cache during install. These should be
// static assets required for the app shell to work offline.
const RESSOURCES = [
	/* off while testing
	// root
	"./",

	// HTML
	"./index.html",

	// service worker
	"./service_worker.js",

	// manifest
	"./favicon/site.webmanifest",

	// favicons
	"./favicon/apple-touch-icon.png",
	"./favicon/favicon-96x96.png",
	"./favicon/favicon.ico",
	"./favicon/favicon.svg",
	"./favicon/og-image-512x512.png",
	"./favicon/web-app-manifest-192x192.png",
	"./favicon/web-app-manifest-512x512.png",

	// IMG
	"./IMG/logo/jpg/logo-512x512.jpg",
	"./IMG/logo/png/logo-512x512.png",
	"./IMG/logo/png/logo-192x192.png",
	"./IMG/logo/png/logo-64x64.png",
	"./IMG/logo/webp/logo-64x64.webp",
	"./IMG/logo/webp/logo-192x192.webp",
	"./IMG/logo/webp/logo-512x512.webp",

	// element images
	"./IMG/elements/bug.png",
	"./IMG/elements/dark.png",
	"./IMG/elements/dragon.png",
	"./IMG/elements/electric.png",
	"./IMG/elements/fairy.png",
	"./IMG/elements/fighting.png",
	"./IMG/elements/fire.png",
	"./IMG/elements/flying.png",
	"./IMG/elements/ghost.png",
	"./IMG/elements/grass.png",
	"./IMG/elements/ground.png",
	"./IMG/elements/ice.png",
	"./IMG/elements/normal.png",
	"./IMG/elements/poison.png",
	"./IMG/elements/psychic.png",
	"./IMG/elements/rock.png",
	"./IMG/elements/steel.png",
	"./IMG/elements/water.png",

	// client side js (match case used in index.html)
	"./JS/version-manager.js",
	"./JS/pokemon-grid.js",
	"./JS/fetch-and-DB.js",
	"./JS/indexed-db-funcs.js",

	// style sheets & local bootstrap bundle (match case used in index.html)
	"./CSS/style.css",
	"./lib/bootstrap-5.3.8-dist/css/bootstrap.css",
	"./lib/bootstrap-5.3.8-dist/js/bootstrap.bundle.min.js",
	
	// Dexie library
	"./lib/dexie/dexie.mjs"
	*/
];





/******************************************************************************/
/* Listeners                                                                  */
/******************************************************************************/
self.addEventListener("install", onInstall);    //browser fires this when version increments
self.addEventListener("fetch", onFetch);        //browser fires this for every network request
/******************************************************************************/







/******************************************************************************/
/* Install                                                                    */
/******************************************************************************/
function onInstall(event)
{
	console.debug("onInstall()");
 
	event.waitUntil(caching()); //call the caching function and wait until its finished
	self.skipWaiting();         // activite worker immediately, it will replace the older version when page refreses
}
/******************************************************************************/
async function caching()
{
	console.debug("caching()");
 
	const KEYS = await caches.keys();  // look at the existing cache versions in the browser
 
	if( ! KEYS.includes(VERSION))      // if our current version is not already cached
	{
		console.log("Caching version:", VERSION);
		const CACHE = await caches.open(VERSION); // open a new cache for our current version

		// Try to add all resources at once; if one fails, fall back to
		// adding resources individually so we can log and skip failing ones.
		try
		{
			await CACHE.addAll(RESSOURCES);
		}
		catch(addAllErr)
		{
			console.error("CACHE.addAll failed:", addAllErr);
			for(const RES of RESSOURCES)
			{
				try
				{
					const resp = await fetch(RES, {cache: 'no-store'});
					if(!resp || !resp.ok)
					{
						throw new Error(`Fetch failed for ${RES}: ${resp && resp.status}`);
					}
					await CACHE.put(RES, resp.clone());
				}
				catch(indErr)
				{
					console.warn("Failed to cache resource", RES, indErr);
				}
			}
		}
 
        //delete all old versions
		for(const KEY of KEYS)
		{
			if(KEY !== VERSION)
			{
				console.log("Suppress old cache version:", KEY);
				await caches.delete(KEY);
			}
		}
	}
}
/******************************************************************************/








/******************************************************************************/
/* Fetch                                                                      */
/******************************************************************************/
function onFetch(event)
{
	//console.debug("onFetch(): ", event.request.url);
 
	event.respondWith(getResponse(event.request));  //intercept any fetch requests, ask getResponse() for the ressource
}
/******************************************************************************/
async function getResponse(request)
// given a request, look for it in the cache, if found return it, else fetch from server
{
	//console.debug("getResponse()");
    
    //look for the requested resource in the cache
	const RESPONSE = await caches.match(request);
    //if found in cache, return it, else fetch from server
	if(RESPONSE)
	{
		console.debug("🟢📁Fetching from cache", request.url);
		return RESPONSE;
	}
	else
	{
		console.debug("🔵📁Fetching from server", request.url);
		return fetch(request);
	}
}
/******************************************************************************/