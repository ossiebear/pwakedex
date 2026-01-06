// fetch-and-DB.js
// Description: Fetch Pokémon data from cache (Dexie DB) or API
// Author: Oscar Collins
// AI usage: Description and docstrings assisted by AI, told AI to capitilize the consts cuz i forgor

// Full description:
// This module provides functions to retrieve Pokémon data either from a Dexie IndexedDB cache or by fetching from the PokeAPI.
// If the data is not found in the cache, it fetches from the API, stores it in the Dexie DB for future use, and returns the data.
// It includes helper functions to set, get, and clear cached Pokémon data in the Dexie DB.

import { 
    db, 
    formatApiResponseForDB, 
    addPokemonToDB, 
    getPokemonDataFromDb_Name, 
    getPokemonDataFromDb_ID,
    clearPokemonDB,
    updateCacheCount
} from './indexed-db-funcs.js';


// CONSTANTS_________________________________________________________ 
    // Name or ID search bar----------------------
    const POKEMON_SEARCH_INPUT = document.getElementById('pokemon-search-bar');
    //--------------------------------------------

    // Send API request button--------------------
    const SEND_API_REQUEST_BUTTON = document.getElementById('pokemon-search-button');
    if (SEND_API_REQUEST_BUTTON) {
        SEND_API_REQUEST_BUTTON.addEventListener('click', handleSearchClick);
    }
    //--------------------------------------------

    // Cache all Pokémon button-------------------
    const CACHE_ALL_CONFIRM_BUTTON = document.getElementById('cache-all-confirm');
    if (CACHE_ALL_CONFIRM_BUTTON) {
        CACHE_ALL_CONFIRM_BUTTON.addEventListener('click', handleCacheAllClick);
    }
    //--------------------------------------------

    // Cache all Pokémon modal--------------------
    const CACHE_ALL_MODAL_EL = document.getElementById('cache-all-pokemon-modal');
    const CACHE_ALL_MODAL_BOOT = CACHE_ALL_MODAL_EL ? bootstrap.Modal.getInstance(CACHE_ALL_MODAL_EL) : null; // stole this line from overflow
    //--------------------------------------------

    // Bulk fetch configuration-------------------
    const BATCH_SIZE = 20; // Only fetch 20 at a time
    const DELAY_BETWEEN_BATCHES = 100; // Wait 100ms between batches
    //--------------------------------------------s

//________________________________________________________________________________________










// EVENT HANDLERS_________________________________________________________________________


    // Search button click handler ---------------------------------------------------
    async function handleSearchClick() {
            let result;
            console.debug("handleSearchClick()");
            console.log("User searched for:", POKEMON_SEARCH_INPUT.value);
            result = await getPokemonDataFromDexieOrAPI(POKEMON_SEARCH_INPUT.value);
            //redirect to detail page if result found
            if(result && result.id) {
                window.location.href = `pokemon-detail.html?id=${result.id}`;
            } else {
                alert("Pokémon not found. Please check the name or ID and try again.");
            }
        }
    // -------------------------------------------------------------------------------

    // Cache all Pokémon button click handler ----------------------------------------
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    export async function handleCacheAllClick() {
        console.time("Bulk Download");
        try {


            // Disable download button ------------------------------
            CACHE_ALL_CONFIRM_BUTTON.disabled = true;
            CACHE_ALL_CONFIRM_BUTTON.textContent = 'Initializing...';
            //--------------------------------------------------------





            // Fetch the master list, count total Pokémon ------------
            console.log('🔵🐲 Fetching Pokémon list from API...');
            const LIST_RESPONSE = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');
            const LIST_DATA = await LIST_RESPONSE.json();
            const POKEMON_LIST = LIST_DATA.results;
            const total = POKEMON_LIST.length;
            console.log(`Processing ${total} Pokémon...`);
            //--------------------------------------------------------





            // Process in batches ------------------------------------
            for (let i = 0; i < total; i += BATCH_SIZE) {

                // Get array slice (batch)
                const batch = POKEMON_LIST.slice(i, i + BATCH_SIZE);
                

                // Update UI with progress
                const progress = Math.min(i + BATCH_SIZE, total);
                CACHE_ALL_CONFIRM_BUTTON.textContent = `Downloading... (${progress}/${total})`;
                await updateCacheCount();                                                                       //REMOVE AWAIT AFTER TESTING


                // Process the current batch in parallel
                await Promise.all(batch.map(async (pokemon) => {
                    try {
                        const RESPONSE = await fetch(pokemon.url);
                        if (!RESPONSE.ok) throw new Error(`Status ${RESPONSE.status}`);
                        
                        const DATA = await RESPONSE.json();
                        await cachePokemonData(DATA);
                    } catch (error) {
                        console.warn(`❌ Failed ${pokemon.name}:`, error);
                    }
                }));



                await delay(DELAY_BETWEEN_BATCHES);
            }
            //--------------------------------------------------------





            // Finalize
            console.log(`✅ Download complete! ${total} Pokémon processed.`);
            console.timeEnd("Bulk Download");

            // UI Cleanup
            document.activeElement?.blur();
            CACHE_ALL_MODAL_BOOT?.hide();
            CACHE_ALL_CONFIRM_BUTTON.textContent = 'Download Complete';
            
            setTimeout(() => {
                alert(`Download complete! ${total} Pokémon processed.`);
                CACHE_ALL_CONFIRM_BUTTON.disabled = false;
                CACHE_ALL_CONFIRM_BUTTON.textContent = 'download';
            }, 500);

        } catch (error) {
            console.error('❌ Error downloading Pokémon:', error);
            console.timeEnd("Bulk Download");

            document.activeElement?.blur();
            CACHE_ALL_MODAL_BOOT?.hide();
            CACHE_ALL_CONFIRM_BUTTON.disabled = false;
            CACHE_ALL_CONFIRM_BUTTON.textContent = 'download';
            
            setTimeout(() => alert('Error downloading Pokémon. Please try again.'), 300);
        }
    }
    // -------------------------------------------------------------------------------
//________________________________________________________________________________________











// MAIN FUNCTION: Get Pokémon from DB or API____________________________________________
/**
 * Retrieves Pokémon data from Dexie DB cache or fetches from API if and chaches if not already cached
 * @param {string|number} nameOrId - Pokémon name or ID
 * @returns {Promise<Object>} - Full Pokémon data from PokeAPI
 */
export async function getPokemonDataFromDexieOrAPI(nameOrId) {
    console.debug(`getPokemonDataFromDexieOrAPI(${nameOrId})`);
    let result;

    // Normalize input
    const QUERY = String(nameOrId).trim().toLowerCase();
    const IS_NUMERIC = !isNaN(QUERY);

    // Check DB first--------------------------
    try {
        let foundInDB;
        console.debug("Checking Dexie DB for: ", QUERY);
        
        if (IS_NUMERIC) {
            foundInDB = await getPokemonDataFromDb_ID(Number(QUERY));
        } else {
            foundInDB = await getPokemonDataFromDb_Name(QUERY);
        }

        if (foundInDB && foundInDB.full_json_data) {
            console.log(`🟢🐲 Retrieved pokemon #${nameOrId} from Dexie DB.`);
            result = foundInDB.full_json_data;
            // Attach cached species data if available
            if (foundInDB.species_json_data) {
                result.species_data = foundInDB.species_json_data;
            }
            return result;
        }
        else {
            console.debug(`Pokémon #${nameOrId} not found in Dexie DB.`);
        }
    } catch (error) {
        console.warn("Error checking DB cache:", error);
    }
    //--------------------------------------------

    // Fetch from API if not in DB---------------
    try {
        console.log(`🔵🐲 Fetching pokemon #${nameOrId} from API...`);
        console.debug(`Fetching URL: https://pokeapi.co/api/v2/pokemon/${QUERY}`);
        const RESPONSE = await fetch(`https://pokeapi.co/api/v2/pokemon/${QUERY}`);
        
        if (!RESPONSE.ok) {
            throw new Error(`API request failed: ${RESPONSE.status}`);
        }
        
        const DATA = await RESPONSE.json();
        console.log(`✅ API success`);
        
        // Fetch species data
        let speciesData = null;
        if (DATA.species?.url) {
            try {
                console.log(`🔵🐲 Fetching species data for ${DATA.name}`);
                const speciesResponse = await fetch(DATA.species.url);
                speciesData = await speciesResponse.json();
                console.log('✅ Species data fetched');
            } catch (error) {
                console.error('❌ Error fetching species data:', error);
            }
        }
        
        // Attach species data to result
        DATA.species_data = speciesData;
        
        // Store in DB for future use
        await cachePokemonData(DATA, speciesData);
        
        result = DATA;
    } catch (error) {
        console.error('❌ API error:', error);
        result = null;
    }
    //--------------------------------------------

    return result; // returns data as json object
}
//________________________________________________________________________________________











// HELPER FUNCTIONS_______________________________________________________________________

/**
 * Cache Pokémon data in Dexie DB
 * @param {Object} apiData - Full Pokémon data from PokeAPI
 * @param {Object} speciesData - Species data from PokeAPI (optional, will fetch if not provided)
 */
async function cachePokemonData(apiData, speciesData = null) {
    console.debug("cachePokemonData()", apiData.name);
    
    try {
        // Fetch species data if not already provided
        if (!speciesData && apiData.species?.url) {
            try {
                console.log(`🔵🐲 Fetching species data for ${apiData.name}`);
                const speciesResponse = await fetch(apiData.species.url);
                speciesData = await speciesResponse.json();
                console.log('✅ Species data fetched');
            } catch (error) {
                console.error('❌ Error fetching species data:', error);
            }
        }
        
        // Extract relevant fields for indexing
        const FORMATTED_DATA = {
            id: apiData.id,
            name: apiData.name.toLowerCase(),
            type1: apiData.types[0]?.type?.name || null,
            type2: apiData.types[1]?.type?.name || null,
            weight: apiData.weight,
            height: apiData.height,
            full_json_data: apiData, // Store complete API response
            species_json_data: speciesData // Store species data
        };

        // Format and add to DB
        const FORMATTED = formatApiResponseForDB(FORMATTED_DATA);
        if (FORMATTED) {
            await addPokemonToDB(FORMATTED);
        }
    } catch (error) {
        console.error("Error caching Pokémon data:", error);
    }
}


/**
 * Retrieve cached Pokémon data from DB
 * @param {string|number} nameOrId - Pokémon name or ID
 * @returns {Promise<Object|null>} - Full Pokémon data or null if not found
 */
export async function getCachedPokemon(nameOrId) {
    console.debug("getCachedPokemon()", nameOrId);
    
    const QUERY = String(nameOrId).trim().toLowerCase();
    const IS_NUMERIC = !isNaN(QUERY);
    
    try {
        let foundInDB;
        
        if (IS_NUMERIC) {
            foundInDB = await getPokemonDataFromDb_ID(Number(QUERY));
        } else {
            foundInDB = await getPokemonDataFromDb_Name(QUERY);
        }
        
        if (foundInDB && foundInDB.full_json_data) {
            return foundInDB.full_json_data;
        }
        
        return null;
    } catch (error) {
        console.error("Error retrieving cached Pokémon:", error);
        return null;
    }
}


/**
 * Clear all Pokémon data from Dexie DB
 */
export async function clearPokemonCache() {
    console.debug("clearPokemonCache()");
    await clearPokemonDB();
    console.log("🧹 Cleared Pokémon cache from Dexie DB");
}

//________________________________________________________________________________________
