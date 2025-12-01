// find-and-cache.js
// Author: Oscar Collins
// Last Modified: 2025






// 1-Find pokemon json data from either cache or the API___________________________________
    export async function getPokemonDataFromCacheOrAPI(nameOrId) {
        console.debug("getPokemonDataFromCacheOrAPI()");
        let result;

        // Check cache first--------------------------
            let foundInCache = getCachedPokemon(nameOrId);
            if (foundInCache) {
                console.log(`🟢🐲Retrieved ${nameOrId} from cache.`);
                console.log(foundInCache);
                result = foundInCache;
        //--------------------------------------------

        // Fetch from API if not in cache-------------
            } else {
                
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
                    const data = await response.json();
                    console.log(data);
                    // Store in cache for future use
                    setCachedPokemon(data.name, data.id, data);
                    console.log(`🔵🐲Fetched ${nameOrId} from API and cached it.`);
                    result = data;
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        //--------------------------------------------
        return result;
    }
//________________________________________________________________________________________










// 2-Caching helper functions________________________________________________________________
// Key format: "name-id"

    // Store pokemon data in cache----------------
        export function setCachedPokemon(name, id, data) {
            console.debug("setCachedPokemon()");
            console.log(`Caching Pokémon: ${name} (ID: ${id})`);
            localStorage.setItem(`${name}:${id}`, JSON.stringify(data));
        }
    //--------------------------------------------

    // Retrieve pokemon data from cache-----------
        export function getCachedPokemon(nameOrId) {
            console.debug("getCachedPokemon()");

            // Normalize the search value (turn into string and trim whitespace)
            let query = String(nameOrId).trim();

            // Loop through all keys in localStorage
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);

                // Only process keys that follow the "name:id" pattern
                let parts = key.split(":");
                if (parts.length !== 2) {
                    // If key follows the ':'rule, its one of our Pokémon cache entries, otherwise skip it
                } else {
                    // Extract name and ID from the key
                    let name = parts[0];
                    let id = parts[1];

                    // Match by name OR by id
                    if (name === query || id === query) {
                        let cached = localStorage.getItem(key);
                        if (cached) {
                            return JSON.parse(cached);
                        }
                        return null;
                    }
                }
            }

            // Nothing matched
            return null;
        }
    //--------------------------------------------

    // Clear the entire Pokémon cache-------------
        export function clearPokemonCache() {
            console.debug("clearPokemonCache()");
            console.log("Clearing Pokémon cache");
            localStorage.clear();
        }
    //--------------------------------------------
//________________________________________________________________________________________