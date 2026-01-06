// grid-render.js
// Description: Generates a grid of Pokémon cards using indexedDB data or API calls
// Author: Oscar Collins
// AI usage: help on 3D card effect, docstrings

// Full description: 
// This script dynamically generates a grid of Pokémon cards on the webpage. Each card displays
// the Pokémon's image, name, ID, and type badges. The data is fetched either from IndexedDB
// (if cached) or from the PokeAPI. The grid supports loading more Pokémon on demand and
// includes interactive 3D hover effects on each card for enhanced user experience.






import {getPokemonDataFromDexieOrAPI} from './fetch-and-db.js';
import {updateCacheCount} from './indexed-db-funcs.js';






// CONSTANTS__________________________________________________________________________
const TYPES = [
    "Normal", "Fighting", "Flying", "Poison", "Ground",
    "Rock", "Bug", "Ghost", "Steel", "Fire", "Water",
    "Grass", "Electric", "Psychic", "Ice", "Dragon",
    "Dark", "Fairy" //, "Stellar" (removed for simplicity)
];

const TYPE_COLORS = {
    NORMAL: '#9fa19f',
    FIRE: '#e62829',
    WATER: '#2980ef',
    ELECTRIC: '#fac000',
    GRASS: '#3fa129',
    ICE: '#3fd8ff',
    FIGHTING: '#ff8000',
    POISON: '#9141cb',
    GROUND: '#915121',
    FLYING: '#81b9ef',
    PSYCHIC: '#ef4179',
    BUG: '#91a119',
    ROCK: '#afa981',
    GHOST: '#704170',
    DRAGON: '#5060e1',
    DARK: '#50413f',
    STEEL: '#60a1b8',
    FAIRY: '#ef70ef',
};

const INITIAL_LOAD_COUNT = 12;
const LOAD_MORE_INCREMENT = 8;

// Elemental type buttons container 
const ELEMENTAL_CONTAINER_EL = document.getElementById('elements-container');

// Load more button 
const LOAD_MORE_BUTTON_EL = document.getElementById('load-more-pokemon');
LOAD_MORE_BUTTON_EL.addEventListener('click', function() {
    loadMorePokemon(LOAD_MORE_INCREMENT);
});

// Pokemon grid container
const CONTAINER = document.getElementById('pokemon-grid');
//________________________________________________________________________________________











// Generate the grid sequentially_________________________________________________________________________________
/**
 * Generates a grid of Pokémon cards by fetching data sequentially from IndexedDB or PokeAPI via fetch-and-db.js
 * Creates Bootstrap cards with type badges, hover effects, and links to detail pages.
 * 
 * @param {number} start - The Pokémon ID to start loading from (1-based index)
 * @param {number} end - The Pokémon ID to stop loading at (inclusive)
 * @returns {void}
 */
function generatePokemonGrid(start, end) {
    console.groupCollapsed("Generating Pokemon Grid");
    console.debug(`generating from #${start} to #${end}`);
    
    /**
     * Recursively adds a single Pokémon card to the grid.
     * Fetches data via getPokemonDataFromDexieOrAPI(), generates HTML with type badges,
     * applies 3D hover effects, and recursively calls itself for the next Pokémon.
     * 
     * @param {number} i - The current Pokémon ID to process
     * @returns {Promise<void>} Resolves when this Pokémon and all subsequent ones are added
     */
    async function addPokemon(i) {
        if (i <= end) {
            console.groupCollapsed(`Adding Pokémon #${i}`);
            console.debug(`addPokemon(${i})`);


            // Fetch Pokémon data from Dexie or API ------------------------------------------------------------
            const POKEMON = await getPokemonDataFromDexieOrAPI(i);
            console.debug(`generatePokemonGrid() says:  received data for (${POKEMON.name}), adding to grid...`);
            //--------------------------------------------------------------------------------------------------


            
            // Create HTML for each type badge------------------------------------------------------------------
            let typesHtml = '';
            POKEMON.types.forEach(function(t) {
                let typeName = t.type.name;
                let upperName = typeName.toUpperCase();
                let color = TYPE_COLORS[upperName] || '#333';
                typesHtml += `
                    <div class="d-flex align-items-center gap-1 pokemon-type-badge">
                        <img src="./IMG/elements/${typeName}.png" alt="${typeName}" width="32" height="32" class="pokemon-type-icon">
                        <span class="text-capitalize fw-semibold pokemon-type-text" style="color:${color};">${typeName}</span>
                    </div>
                `;
            });
            //--------------------------------------------------------------------------------------------------




            // Create card element------------------------------------------------------------------------------
            let newcard = document.createElement('div');
            newcard.className = 'newcard';

            newcard.innerHTML = `
                <a href="pokemon-detail.html?id=${POKEMON.id}" class="text-decoration-none">
                    <div class="card shadow-lg border-0 card-hover pokemon-card">
                        
                        <div class="pokemon-card-img-container bg-dark">
                            <img src="${POKEMON.sprites.front_default}" class="pokemon-card-img" alt="${POKEMON.name} sprite">
                        </div>

                        <div class="card-body pokemon-card-body">
                            <h5 class="card-title text-capitalize fw-bold mb-2 pokemon-card-title">${POKEMON.name}</h5>
                            <div class="d-flex justify-content-center mb-2 gap-2 flex-wrap pokemon-card-badges">
                                <span class="badge bg-primary">ID: ${POKEMON.id}</span>
                            </div>

                            <div class="pokemon-card-types">
                                <div class="d-flex justify-content-center gap-2 align-items-center flex-wrap">
                                    
                                    
                                    ${ // Insert the type badges HTML we just made
                                        typesHtml
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            `;
            // Add card to container
            CONTAINER.appendChild(newcard);
            console.debug(`Added card for (${POKEMON.name}) to grid.`);
            //--------------------------------------------------------------------------------------------------




            // Now we add a 3D effect to the card for desktops (AI assisted)-------------------------------------------------
            let card = newcard.querySelector('.pokemon-card');
            
            card.addEventListener('mousemove', function(event) {
                const RECT = card.getBoundingClientRect(); // AI recommended using getBoundingClientRect()
                const X = event.clientX - RECT.left;
                const Y = event.clientY - RECT.top;
                
                const CENTER_X = RECT.width / 2;
                const CENTER_Y = RECT.height / 2;
                
                const rotateX = (Y - CENTER_Y) / CENTER_Y * -20;
                const rotateY = (X - CENTER_X) / CENTER_X * 20;
                
                // Apply transformation to card
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(10px)`;
            });
            
            // Reset transformation on mouse leave
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
            });
            //--------------------------------------------------------------------------------------------------
            
            // Update cache count display
            updateCacheCount();

            // Close "Adding Pokémon #i"
            console.groupEnd(); 

            // Load next Pokémon
            await addPokemon(i + 1); //await to insure sequential loading at cost of speed
            
        } 
        
        else {
            console.log("All Pokémon added to grid.");
            console.groupEnd(); // Close "Generating Pokemon Grid"
        }
    }

    addPokemon(start, end);
}
// How many Pokémon to load initially
generatePokemonGrid(1, INITIAL_LOAD_COUNT);
//________________________________________________________________________________________











// Load more Pokémon when user hits button________________________________________________
/**
 * Loads additional Pokémon cards when the "Load More" button is clicked.
 * Calculates the next range of Pokémon IDs based on current grid size and triggers
 * 
 * @param {number} numToLoad - The number of additional Pokémon to load
 * @returns {void}
 */
function loadMorePokemon(numToLoad) {
    const CURRENT_COUNT = document.getElementById('pokemon-grid').childElementCount;
    const NEW_END = CURRENT_COUNT + numToLoad;
    generatePokemonGrid(CURRENT_COUNT + 1, NEW_END);
}
//________________________________________________________________________________________











// DYNAMICALLY CREATE ELEMENTAL TYPE POKEMON BUTTONS______________________________________
if (ELEMENTAL_CONTAINER_EL) { //check container exists
    const FRAGMENT = document.createDocumentFragment(); //prerender in fragment
    
    // loop through every element type in TYPES[] and create a button for it
    let i = 0;
    while (i < TYPES.length) {
        const NAME = TYPES[i];      // get the element name
        const KEY = NAME.toUpperCase(); // get the element name in uppercase
        const SLUG = NAME.toLowerCase();    // get the element name in lowercase

        // create button element----------------------
            const BTN = document.createElement("button"); // create <button> element
            BTN.type = "button";                          // set type="button"
            BTN.className = "element-card";               // set class name
            BTN.style.backgroundColor = TYPE_COLORS[KEY]; // set background color
            BTN.innerHTML = `<img src="./IMG/elements/${SLUG}.png" alt="${NAME} type icon"><span>${NAME}</span>`;
            BTN.addEventListener('click', () => {
                window.open(`https://pokeapi.co/api/v2/type/${SLUG}`);
            });
        FRAGMENT.appendChild(BTN); // add button to fragment
        i++; // iterate
    }

    // When all buttons are created, render them to the container
    ELEMENTAL_CONTAINER_EL.replaceChildren(FRAGMENT);
}
//________________________________________________________________________________________