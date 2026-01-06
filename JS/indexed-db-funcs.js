// indexed_db.js
// Description: Manages IndexedDB for storing Pokémon data
// Author: Oscar Collins
// AI usage: Description and docstrings assisted by AI

// Full description:
// This module manages the IndexedDB database for storing Pokémon data using the Dexie.js library.
// It provides functions to format API responses, add Pokémon data to the database, and retrieve data by name or ID.
// It also includes functions to delete individual Pokémon entries and clear the entire database.



// Code skeleton taken and adapted from MDN
// (https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)







// DATABASE CONFIGURATIONS _______________________________________________________________
    // Import dexie js library
    import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.2/dist/dexie.mjs';

    const DB_NAME = 'PWAkedexDB';
    const DB_VERSION = 2; // Incremented to 2 for species_json_data field addition
    //const STORE_NAME = 'pokemon'; // Table name
//________________________________________________________________________________________







// INITIALIZE DEXIE ______________________________________________________________________
// dexie checks itself if db already exists

    // Create database (if it doesnt exist)
    export const db = new Dexie(DB_NAME);

    // Define schema versions
    db.version(1).stores({
        pokemon: 'id, name, type1, type2, weight, height, full_json_data'
    });
    
    db.version(2).stores({
        pokemon: 'id, name, type1, type2, weight, height, full_json_data, species_json_data'
    });
//________________________________________________________________________________________










// HELPER FUNCTIONS ________________________________________________________________________
    
    /**
     * Sanitizes a string value by escaping HTML entities to prevent XSS attacks.
     * @param {*} value - The value to sanitize (if not a string, returns as-is)
     * @returns {*} Sanitized and trimmed string, or original value if not a string
     */
    function sanitizeString(value) {
        if (typeof value !== 'string') return value;
        return value.replace(/[<>'"&]/g, function(char) {
            const ENTITIES = {'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','&':'&amp;'};
            return ENTITIES[char];
        }).trim();
    }

    /**
     * Formats a raw PokeAPI JSON response into a sanitized structure for IndexedDB storage.
     * Extracts id, name, types, weight, height, and stores the full JSON data.
     * @param {Object} pokeAPI_json - Raw JSON response from PokeAPI
     * @param {number} pokeAPI_json.id - Pokémon ID
     * @param {string} pokeAPI_json.name - Pokémon name
     * @param {string} [pokeAPI_json.type1] - Primary type
     * @param {string} [pokeAPI_json.type2] - Secondary type (optional)
     * @param {number} [pokeAPI_json.weight] - Weight in hectograms
     * @param {number} [pokeAPI_json.height] - Height in decimeters
     * @param {Object} [pokeAPI_json.full_json_data] - Complete API response object
     * @returns {Object|null} Formatted object with sanitized fields, or null if invalid input
     */
    export function formatApiResponseForDB(pokeAPI_json) {
        let result;
        if (!pokeAPI_json?.id || !pokeAPI_json?.name) {
            console.error("formatApiResponseForDB() error: Invalid pokeAPI_json data");
            result = null;
        }
        else {
            const formattedApiResponse = {
                id: Number(pokeAPI_json.id) || null,
                name: sanitizeString(pokeAPI_json.name) || null,
                type1: sanitizeString(pokeAPI_json.type1) || null,
                type2: sanitizeString(pokeAPI_json.type2) || null,
                weight: Number(pokeAPI_json.weight) || null,
                height: Number(pokeAPI_json.height) || null,
                full_json_data: pokeAPI_json.full_json_data ?? null,
                species_json_data: pokeAPI_json.species_json_data ?? null
            };
            result =  formattedApiResponse;
        }
        return result; 
    }


    /**
     * Adds or updates a Pokémon entry in the IndexedDB database.
     * Uses Dexie's put() method which performs upsert (insert or update).
     * @param {Object} formattedApiResponse - Formatted Pokémon data from formatApiResponseForDB()
     * @param {number} formattedApiResponse.id - Pokémon ID (primary key)
     * @param {string} formattedApiResponse.name - Pokémon name
     * @param {string} formattedApiResponse.type1 - Primary type
     * @param {string} [formattedApiResponse.type2] - Secondary type
     * @param {number} formattedApiResponse.weight - Weight in hectograms
     * @param {number} formattedApiResponse.height - Height in decimeters
     * @param {Object} formattedApiResponse.full_json_data - Complete API response
     * @returns {Promise<number|null>} Primary key of inserted/updated record, or null on error
     */
    export async function addPokemonToDB(formattedApiResponse) {
        console.debug("addPokemonToDB(formattedApiResponse)");
        let result;
        try {
            // formattedApiResponse should already be sanitized and formatted like this: id, name, type1, type2, weight, height, full_json_data
            result = await db.pokemon.put(formattedApiResponse);
            console.debug("addPokemonToDB() says: Saved API response to DB");
        } 
        
        catch (error) {
            console.error("addPokemonToDB() error:", error);
            result = null;
        }

        return result; // returns primary key
    }



    /**
     * Retrieves a Pokémon entry from the database by name.
     * @param {string} name - Pokémon name to search for (case-sensitive)
     * @returns {Promise<Object|null>} Full Pokémon data object if found, null on error, undefined if not found
     */
    export async function getPokemonDataFromDb_Name(name) {
        let result;
        console.debug(`getPokemonDataFromDb_Name(${name})`);
        try {
            result = await db.pokemon.where('name').equals(name).first();
        }
        
        catch (error) {
            console.error(`getPokemonDataFromDb_Name(${name}) error:`, error);
            result = null;
        }

        return result; // returns the full pokemon data object
    }



    /**
     * Retrieves a Pokémon entry from the database by ID.
     * @param {number|string} id - Pokémon ID (converted to number internally)
     * @returns {Promise<Object|null>} Full Pokémon data object if found, null on error, undefined if not found
     */
    export async function getPokemonDataFromDb_ID(id) {
        let result;
        console.debug("getPokemonDataFromDb_ID()");
        try {
            result = await db.pokemon.get(Number(id));
        }
        
        catch (error) {
            console.error("getPokemonDataFromDb_ID() error:", error);
            result = null;
        }

        return result; // returns the full pokemon data object
    }



    /**
     * Deletes a Pokémon entry from the database by ID.
     * @param {number|string} id - Pokémon ID to delete (converted to number internally)
     * @returns {Promise<void>} Logs success message or error
     */
    export async function deletePokemonFromDB(id) {
        console.debug("deletePokemonFromDB()");
        try {
            await db.pokemon.delete(Number(id));
            console.log("deletePokemonFromDB() says: Deleted Pokemon with ID:", id);
        } 
        
        catch (error) {
            console.error("deletePokemonFromDB() error:", error);
        }
    }



    /**
     * Clears all Pokémon entries from the database.
     * @returns {Promise<void>} Logs success message or error
     */
    export async function clearPokemonDB() {
        try {
            await db.pokemon.clear();
            console.log("Cleared all Pokemon data");
        } catch (error) {
            console.error("clearPokemonDB() error:", error);
        }
    }



    /**
     * Counts the total number of Pokémon entries in the database.
     * @returns {Promise<number>} Count of Pokémon in cache, or 0 on error
     */
    export async function countPokemonInCache() {
        let result;
        console.debug("countPokemonInCache()");
        try {
            result = await db.pokemon.count();
            console.debug(`🗃️ Total Pokémon in cache: ${result}`);
        }
        
        catch (error) {
            console.error("countPokemonInCache() error:", error);
            result = 0;
        }

        return result;
    }



    /**
     * Updates the displayed count of Pokémon stored in IndexedDB cache.
     * Queries the database and updates the UI element.
     */
    export async function updateCacheCount() {
        const POKEMON_IN_CACHE_EL = document.getElementById('pokemon-in-cache-count');
        const IN_MODAL_IN_CACHE_EL = document.getElementById('in-modal-pokemon-cache-count');
        const CACHE_PROGRESS_BAR = document.getElementById('cache-progress-bar');   
        if (POKEMON_IN_CACHE_EL) {
            const COUNT = await countPokemonInCache();
            POKEMON_IN_CACHE_EL.textContent = COUNT;
        }
        if (IN_MODAL_IN_CACHE_EL) {
            const COUNT = await countPokemonInCache();
            IN_MODAL_IN_CACHE_EL.textContent = COUNT;
        }
        if (CACHE_PROGRESS_BAR) {
            const COUNT = await countPokemonInCache();
            const PERCENT = Math.min((COUNT / 1010) * 100, 100);
            CACHE_PROGRESS_BAR.setAttribute('aria-valuenow', COUNT);
            CACHE_PROGRESS_BAR.querySelector('.progress-bar').style.width = `${PERCENT}%`;
        }
    }

//________________________________________________________________________________________



































/*********************************/
/*           OLD CODE            */
/*********************************/
// Dont delete yet, might need some of this later...






/* OPEN DATABASE (unnused, we upgraded to dexie)__________________________________________________________________________
    function openDatabase(DB_NAME, DB_VERSION) {
        console.debug("openDatabase()");
        let db_connex; // we'll return this, its the database connexion, cant be const cuz its assigned later right?
        
        // Open the database
        const CONNEX_REQUEST = window.indexedDB.open(DB_NAME, DB_VERSION);

        // Did it work?
        CONNEX_REQUEST.onerror = connexFailure;
        CONNEX_REQUEST.onsuccess = connexSuccess;

        // nope
        function connexSuccess(event) {
            console.error("openDatabase() says:Problem opening DB", event.target.error);
            db_connex = null; // return null on error (dont know if ill use this yet)
        }

        // ohyup
        function connexFailure(event) {
            console.log("openDatabase() says: DB opened");
            // store the result
            db_connex = event.target.result;
        }

        // Return the established database connection
        return db_connex;
    }
//________________________________________________________________________________________

// CREATE TABLE __________________________________________________________________________
    function createPokemonStore(db_connex) {
        console.debug("createPokemonStore()");
        // create pokemon store if it doesn't exist
        if (!db_connex.objectStoreNames.contains(STORE_NAME)) {
            const pokemonStore = db_connex.createObjectStore(STORE_NAME, { keyPath: 'id' });
            // Seems like we dont need to explicitly create collums? just add indexes I guess...
            //id, name, type1, type2, weight, height, json_data

            // Create indexes
            pokemonStore.createIndex('name', 'name', { unique: false });
            pokemonStore.createIndex('type1', 'type1', { unique: false });
            pokemonStore.createIndex('type2', 'type2', { unique: false });
            pokemonStore.createIndex('weight', 'weight', { unique: false });
            pokemonStore.createIndex('height', 'height', { unique: false });
            // no index for json_data, as its just a blob of data

        }
    }
*/

