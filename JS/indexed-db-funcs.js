// indexed_db.js
// Author: Oscar Collins
// Description: Manages IndexedDB for storing Pokémon data

// Code skeleton taken and adapted from Mozilla Developer Network 
// (https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

// Last Modified: 2025





// DATABASE CONFIGURATIONS _______________________________________________________________
    // Import dexie js library
    import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.2/dist/dexie.mjs';

    const DB_NAME = 'PWAkedexDB';
    const DB_VERSION = 1; //since this is client side, we shouldn't actually need to change this
    //const STORE_NAME = 'pokemon'; // Table name
//________________________________________________________________________________________







// INITIALIZE DEXIE ______________________________________________________________________
// dexie checks itself if db already exists

    // Create database (if it doesnt exist)
    export const db = new Dexie(DB_NAME);

    // and table
    db.version(DB_VERSION).stores({
        pokemon: 'id, name, type1, type2, weight, height, full_json_data'
    });
//________________________________________________________________________________________










// HELPER FUNCTIONS ________________________________________________________________________
    
    // stole this off stackoverflow...
    function sanitizeString(value) {
        if (typeof value !== 'string') return value;
        return value.replace(/[<>'"&]/g, char => {
            const entities = {'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;','&':'&amp;'};
            return entities[char];
        }).trim();
    }

    // not too happy with this one, remember to learn how to throw errors at some point
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
                full_json_data: pokeAPI_json.full_json_data ?? null
            };
            result =  formattedApiResponse;
        }
        return result; 
    }


    export async function addPokemonToDB(formattedApiResponse) {
        console.debug("addPokemonToDB(formattedApiResponse)");
        let result;
        try {
            // formattedApiResponse should already be sanitized and formatted like this: id, name, type1, type2, weight, height, full_json_data
            result = await db.pokemon.put(formattedApiResponse);
            console.log("🗃️Saved API response to DB");
        } 
        
        catch (error) {
            console.error("addPokemonToDB() error:", error);
            result = null;
        }

        return result; // returns primary key
    }



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



    export async function clearPokemonDB() {
        try {
            await db.pokemon.clear();
            console.log("Cleared all Pokemon data");
        } catch (error) {
            console.error("clearPokemonDB() error:", error);
        }
    }

//________________________________________________________________________________________



































/*********************************/
/*           OLD CODE            */
/*********************************/







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

