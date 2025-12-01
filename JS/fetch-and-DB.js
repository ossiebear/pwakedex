// fetch-and-DB.js
// Author: Oscar Collins
// Description: Fetch Pokémon data from cache (Dexie DB) or API
// Last Modified: 2025


import { 
    db, 
    formatApiResponseForDB, 
    addPokemonToDB, 
    getPokemonDataFromDb_Name, 
    getPokemonDataFromDb_ID,
    clearPokemonDB 
} from './indexed-db-funcs.js';


// input fields and event listeners_________________________________________________________ 
    // Name or ID search bar----------------------
    const pokemonSearchInput = document.getElementById('pokemon-search-bar');
    pokemonSearchInput.addEventListener('input', updateApiPreview);
    //--------------------------------------------

    // Send API request button--------------------
    const sendApiRequestButton = document.getElementById('pokemon-search-button');
    sendApiRequestButton.addEventListener('click', handleSearchClick);
    async function handleSearchClick() {
        let result;
        console.debug("handleSearchClick()");
        console.log("User searched for:", pokemonSearchInput.value);
        result = await getPokemonDataFromDexieOrAPI(pokemonSearchInput.value);
        //redirect to detail page if result found
        if(result && result.id) {
            window.location.href = `pokemon-detail.html?id=${result.id}`;
        } else {
            alert("Pokémon not found. Please check the name or ID and try again.");
        }
    }
    //--------------------------------------------
    
    // API preview field--------------------------
        const apiPreviewInput = document.querySelector('#API-preview input');
    //--------------------------------------------
    
//________________________________________________________________________________________

// API request builder____________________________________________________________________
    function updateApiPreview() {  
        console.debug("updateApiPreview()");
        //base URL
        const BASE = "https://pokeapi.co/api/v2/pokemon/"
        // Name search
        if (pokemonSearchInput.value) {
            apiPreviewInput.value = BASE + `${pokemonSearchInput.value}`;
        }
    }
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
    const query = String(nameOrId).trim().toLowerCase();
    const isNumeric = !isNaN(query);

    // Check DB first--------------------------
    try {
        let foundInDB;
        console.debug("Checking Dexie DB for: ", query);
        
        if (isNumeric) {
            foundInDB = await getPokemonDataFromDb_ID(Number(query));
        } else {
            foundInDB = await getPokemonDataFromDb_Name(query);
        }

        if (foundInDB && foundInDB.full_json_data) {
            console.log(`🟢🐲 Retrieved pokemon #${nameOrId} from Dexie DB.`);
            result = foundInDB.full_json_data;
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
        console.debug(`Fetching URL: https://pokeapi.co/api/v2/pokemon/${query}`);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ API success`);
        
        // Store in DB for future use
        await cachePokemonData(data);
        
        result = data;
    } catch (error) {
        console.error('❌ API error:', error);
        result = null;
    }
    //--------------------------------------------

    return result;
}
//________________________________________________________________________________________









// HELPER FUNCTIONS_______________________________________________________________________

/**
 * Cache Pokémon data in Dexie DB
 * @param {Object} apiData - Full Pokémon data from PokeAPI
 */
async function cachePokemonData(apiData) {
    console.debug("cachePokemonData()", apiData.name);
    
    try {
        // Extract relevant fields for indexing
        const formattedData = {
            id: apiData.id,
            name: apiData.name.toLowerCase(),
            type1: apiData.types[0]?.type?.name || null,
            type2: apiData.types[1]?.type?.name || null,
            weight: apiData.weight,
            height: apiData.height,
            full_json_data: apiData // Store complete API response
        };

        // Format and add to DB
        const formatted = formatApiResponseForDB(formattedData);
        if (formatted) {
            await addPokemonToDB(formatted);
        }
    } catch (error) {
        console.error("Error caching Pokémon data:", error);
    }
}


/**
 * Manually cache Pokémon by name and ID
 * @param {string} name - Pokémon name
 * @param {number} id - Pokémon ID
 * @param {Object} data - Full Pokémon data
 */
export async function setCachedPokemon(name, id, data) {
    console.debug("setCachedPokemon()", name, id);
    await cachePokemonData(data);
}


/**
 * Retrieve cached Pokémon data from DB
 * @param {string|number} nameOrId - Pokémon name or ID
 * @returns {Promise<Object|null>} - Full Pokémon data or null if not found
 */
export async function getCachedPokemon(nameOrId) {
    console.debug("getCachedPokemon()", nameOrId);
    
    const query = String(nameOrId).trim().toLowerCase();
    const isNumeric = !isNaN(query);
    
    try {
        let foundInDB;
        
        if (isNumeric) {
            foundInDB = await getPokemonDataFromDb_ID(Number(query));
        } else {
            foundInDB = await getPokemonDataFromDb_Name(query);
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
