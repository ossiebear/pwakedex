// detail-render.js
// Description: Dynamically fill pokemon_detail.html page with data using fetched Pokémon info from Dexie DB or API
// Author: Oscar Collins
// AI usage: displayWeaknesses(), Highlight current Pokémon in evolution chain, improved bootsrap classes

// Full description:
// This script fetches detailed information about a specific Pokémon using its ID or name from the URL parameters.
// It retrieves the data from a Dexie IndexedDB cache or the PokeAPI if not cached via getPokemonDataFromDexieOrAPI().
// Species data (description, evolutions, variants) is fetched once and passed to rendering functions.
// Shows data: image, name, ID, description, types with popovers, abilities with popovers, height, weight, stats chart using D3.js, evolutions, variants, and weaknesses with popovers.






import { getPokemonDataFromDexieOrAPI } from './fetch-and-db.js';
import { sharePokemon, initShareComponents, getShareCapabilities } from './share-manager.js';
import { displayStats } from './detail-render-chart.js';





// CONSTANTS______________________________________________________________________________
const EL_IMAGE = document.getElementById('pokemon-detail-image');
const EL_NAME = document.getElementById('pokemon-detail-name');
const EL_ID = document.getElementById('pokemon-detail-id');
const EL_DESCRIPTION = document.getElementById('pokemon-detail-description');
const EL_TYPE1 = document.getElementById('pokemon-detail-type1-img');
const EL_TYPE2 = document.getElementById('pokemon-detail-type2-img');
const EL_ABILITY1 = document.getElementById('pokemon-detail-ability1');
const EL_ABILITY2 = document.getElementById('pokemon-detail-ability2');
const EL_ABILITY1_ICON = document.getElementById('pokemon-detail-ability1-icon');
const EL_ABILITY2_ICON = document.getElementById('pokemon-detail-ability2-icon');
const EL_ABILITY1_CONTAINER = document.getElementById('pokemon-detail-ability1-container');
const EL_ABILITY2_CONTAINER = document.getElementById('pokemon-detail-ability2-container');
const EL_HEIGHT = document.getElementById('pokemon-detail-height');
const EL_WEIGHT = document.getElementById('pokemon-detail-weight');
const EL_WEAKNESSES_CONTAINER = document.getElementById('pokemon-weaknesses');
const EL_EVOLUTIONS = document.getElementById('pokemon-evolutions');
const EL_SHARE_BUTTON = document.getElementById('share-pokemon-btn');


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
//________________________________________________________________________________________




// Get id from URL________________________________________________________________________ 
const POKEMON_ID = new URLSearchParams(window.location.search).get('id');
//________________________________________________________________________________________



// Get full pokemon data  ________________________________________________________________
const FULL_POKEMON_DATA = await getPokemonDataFromDexieOrAPI(POKEMON_ID);

// Get species data (already fetched and cached by getPokemonDataFromDexieOrAPI)
const SPECIES_DATA = FULL_POKEMON_DATA.species_data || null;

// divide response into all its parts
const POKE_SPRITE = FULL_POKEMON_DATA.sprites?.front_default;
const POKE_NAME = FULL_POKEMON_DATA.name;
const POKE_DESCRIPTION = FULL_POKEMON_DATA.full_json_data?.description || 'no description available';
const POKE_ID = FULL_POKEMON_DATA.id;
const POKE_TYPES = FULL_POKEMON_DATA.types;
const POKE_ABILITIES = FULL_POKEMON_DATA.abilities;
const POKEABILITY1 = POKE_ABILITIES.length > 0 ? POKE_ABILITIES[0].ability.name : null; // check if ability exists, chose 1st, else null
const POKEABILITY2 = POKE_ABILITIES.length > 1 ? POKE_ABILITIES[1].ability.name : null; // check if ability exists, chose 2nd, else null
const POKEABILITY_ICON1 =null;
const POKEABILITY_ICON2 =null;
const POKE_HEIGHT = FULL_POKEMON_DATA.height;
const POKE_WEIGHT = FULL_POKEMON_DATA.weight;
const POKE_STATS = FULL_POKEMON_DATA.stats;
//________________________________________________________________________________________



// Render data to page ___________________________________________________________________

    // Basic data ----------------------------------
    EL_IMAGE.src = POKE_SPRITE;
    EL_NAME.innerHTML = `<strong>${POKE_NAME}</strong>`;
    EL_ID.innerHTML = `<span>ID: #${POKE_ID}</span>`;
    EL_DESCRIPTION.innerHTML = `<p>${POKE_DESCRIPTION}</p>`;
    EL_HEIGHT.innerHTML = `<span>Height: ${(POKE_HEIGHT / 10).toFixed(1)}m</span>`; //convert decimetres to metres
    EL_WEIGHT.innerHTML = `<span>Weight: ${(POKE_WEIGHT / 10).toFixed(1)}kg</span>`; //convert hectograms to kilograms
    //-----------------------------------------------



    // Set element images ---------------------------
    if (POKE_TYPES.length > 0) {
        EL_TYPE1.src = `./IMG/elements/${POKE_TYPES[0].type.name}.png`;
    }
    if (POKE_TYPES.length > 1) {
        EL_TYPE2.src = `./IMG/elements/${POKE_TYPES[1].type.name}.png`;
    }
    //------------------------------------------------



    // Set abilities---------------------------------
    // Using main type icon and color for ability decoration
    const primaryType = POKE_TYPES.length > 0 ? POKE_TYPES[0].type.name.toUpperCase() : 'NORMAL';
    const primaryTypeIcon = POKE_TYPES.length > 0 ? `./IMG/elements/${POKE_TYPES[0].type.name}.png` : './IMG/elements/normal.png';
    
    // Helper to Convert Hex to RGBA
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const typeColor = TYPE_COLORS[primaryType] || TYPE_COLORS.NORMAL;
    const itemBgColor = hexToRgba(typeColor, 0.25);
    const itemBorderColor = hexToRgba(typeColor, 0.5);

    if (POKEABILITY1) {
        EL_ABILITY1.textContent = POKEABILITY1;
        EL_ABILITY1_ICON.src = primaryTypeIcon;
        
        // Remove standard Bootstrap styling that conflicts
        EL_ABILITY1_CONTAINER.classList.remove('bg-secondary', 'border-secondary', 'bg-opacity-25', 'border-opacity-25', 'd-none');
        
        // Apply dynamic colors
        EL_ABILITY1_CONTAINER.style.backgroundColor = itemBgColor;
        EL_ABILITY1_CONTAINER.style.borderColor = itemBorderColor;
    } else {
        EL_ABILITY1_CONTAINER.classList.add('d-none');
    }

    if (POKEABILITY2) {
        EL_ABILITY2.textContent = POKEABILITY2;
        EL_ABILITY2_ICON.src = primaryTypeIcon;
        
        // Remove standard Bootstrap styling that conflicts
        EL_ABILITY2_CONTAINER.classList.remove('bg-secondary', 'border-secondary', 'bg-opacity-25', 'border-opacity-25', 'd-none');
        
        // Apply dynamic colors
        EL_ABILITY2_CONTAINER.style.backgroundColor = itemBgColor;
        EL_ABILITY2_CONTAINER.style.borderColor = itemBorderColor;
    } else {
        EL_ABILITY2_CONTAINER.classList.add('d-none');
    }
    //-----------------------------------------------



    /** ----------------------------------------------
     * FULLY AI GENERATED FUNCTION
     * Display Pokémon weaknesses based on type effectiveness from API
     * @param {Array} types - Array of type objects from Pokemon data (pokemonData.types)
     * Calculates combined type effectiveness using damage multipliers
     * Shows only 2x and 4x weaknesses with type icons (4x gets red border)
     */
    async function displayWeaknesses(types) {
        console.debug("displayWeaknesses()");
        
        if (!types || types.length === 0) {
            EL_WEAKNESSES_CONTAINER.innerHTML = '<p class="text-muted mb-0">No weaknesses data available</p>';
            return;
        }
        
        try {
            // Fetch type data for each type to get damage relations
            const typeDataPromises = types.map(async function(typeObj) {
                const response = await fetch(typeObj.type.url);
                if (!response.ok) {
                    throw new Error(`Type API request failed: ${response.status}`);
                }
                return await response.json();
            });
            const typeDataArray = await Promise.all(typeDataPromises);
            
            // Calculate combined weaknesses
            const weaknessMultipliers = {};
            
            typeDataArray.forEach(function(typeData) {
                // double_damage_from = types this Pokémon is weak to
                typeData.damage_relations.double_damage_from.forEach(function(weakness) {
                    const weaknessName = weakness.name;
                    if (!weaknessMultipliers[weaknessName]) {
                        weaknessMultipliers[weaknessName] = 1;
                    }
                    weaknessMultipliers[weaknessName] *= 2;
                });
                
                // half_damage_from = types this Pokémon resists
                typeData.damage_relations.half_damage_from.forEach(function(resistance) {
                    const resistanceName = resistance.name;
                    if (!weaknessMultipliers[resistanceName]) {
                        weaknessMultipliers[resistanceName] = 1;
                    }
                    weaknessMultipliers[resistanceName] *= 0.5;
                });
                
                // no_damage_from = types this Pokémon is immune to
                typeData.damage_relations.no_damage_from.forEach(function(immunity) {
                    weaknessMultipliers[immunity.name] = 0;
                });
            });
            
            // Filter for actual weaknesses (2x or 4x damage)
            const weaknesses = Object.keys(weaknessMultipliers).filter(function(type) {
                return weaknessMultipliers[type] >= 2;
            });
            
            // Display weakness icons
            const weaknessesContainer = document.querySelector('#pokemon-weaknesses .d-flex');
            weaknessesContainer.innerHTML = '';
            
            if (weaknesses.length === 0) {
                weaknessesContainer.innerHTML = '<p class="text-muted mb-0">No major weaknesses</p>';
            } else {
                weaknesses.forEach(function(weaknessType) {
                    const img = document.createElement('img');
                    img.src = `./IMG/elements/${weaknessType}.png`;
                    img.alt = weaknessType;
                    img.className = 'type-icon type-icon-small';
                    img.style.width = '3em';
                    img.style.maxWidth = '60px';
                    
                    // Add red border for 4x damage weaknesses
                    if (weaknessMultipliers[weaknessType] === 4) {
                        img.style.border = '3px solid #dc3545';
                        img.style.borderRadius = '8px';
                    }
                    
                    weaknessesContainer.appendChild(img);
                });
            }
            
            console.log(`✅ Displayed ${weaknesses.length} weaknesses`);
            
        } catch (error) {
            console.error('❌ Failed to fetch weakness data:', error);
            const weaknessesContainer = document.querySelector('#pokemon-weaknesses .d-flex');
            weaknessesContainer.innerHTML = '<p class="text-muted mb-0">Weakness data unavailable</p>';
        }
    }
    //-------------------------------------------------



    /** ----------------------------------------------
     * Display Pokémon evolution chain
     * @param {Object|null} speciesData - Species data object from API (already fetched)
     * Useful doc: https://pokeapi.co/docs/v2#evolution-section
     */
    async function displayEvolutions(speciesData, currentId) {
        // Generate evolution chain array ------------------------------------
        console.debug(`displayEvolutions(speciesData, ${currentId})`);
        
        if (!speciesData) {
            EL_EVOLUTIONS.innerHTML = '<p class="text-muted mb-0">Evolution data unavailable</p>';
            console.error('❌ No species data provided for evolutions');
        } else {
            try {
                // Get evolution chain URL from species data
                const evolutionChainUrl = speciesData.evolution_chain.url;
                // Fetch chain data from URL
                const evolutionResponse = await fetch(evolutionChainUrl);
                // Convert response stream to json object
                const evolutionData = await evolutionResponse.json();
                // Parse evolution chain
                const evolutionChain = [];
                // Start with base form
                let current = evolutionData.chain;
                // Traverse the evolution chain
                do {
                    const speciesName = current.species.name;
                    // grabbing ID from species URL since evolution data doesnt include it directly
                    const speciesId = current.species.url.split('/').filter(Boolean).pop(); // extract ID from URL (https://pokeapi.co/api/v2/pokemon-species/1/)
                    
                    evolutionChain.push({ // add to evolution array
                        name: speciesName,
                        id: speciesId
                    });
                    
                    // Move to next evolution (taking first evolution path if multiple)
                    current = current.evolves_to.length > 0 ? current.evolves_to[0] : null; // if no further evolutions, set to null to end loop
                } while (current);
                //--------------------------------------------------------------------------



                // Render evolution chain -----------------------------------------------
                const fragment = document.createDocumentFragment();
                
                if (evolutionChain.length === 1) { // If current Pokémon is the only one in its chain (no evolutions)
                    const noEvoP = document.createElement('p');
                    noEvoP.className = 'text-muted mb-0';
                    noEvoP.textContent = 'No evolutions';
                    fragment.appendChild(noEvoP);
                } else {
                    evolutionChain.forEach(function(evolution, index) {
                        // Create evolution card
                        const EL_EVOLUTION_CARD = document.createElement('div');
                        EL_EVOLUTION_CARD.className = 'd-flex flex-column align-items-center';
                        
                        // Add image
                        const EVO_IMG = document.createElement('img');
                        EVO_IMG.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`;
                        EVO_IMG.alt = evolution.name;
                        EVO_IMG.className = 'mb-2';
                        EVO_IMG.style.width = '80px';
                        EVO_IMG.style.height = '80px';
                        EVO_IMG.style.cursor = 'pointer';
                        
                        // Highlight current Pokémon
                        if (evolution.id === currentId.toString()) {
                            EL_EVOLUTION_CARD.style.border = '2px solid #fac000';
                            EL_EVOLUTION_CARD.style.borderRadius = '12px';
                            EL_EVOLUTION_CARD.style.padding = '8px';
                            EL_EVOLUTION_CARD.style.backgroundColor = 'rgba(250, 192, 0, 0.1)';
                        }
                        
                        // Add click handler to navigate to evolution
                        EVO_IMG.addEventListener('click', function() {
                            window.location.href = `pokemon-detail.html?id=${evolution.id}`;
                        });
                        
                        // Add name
                        const nameElement = document.createElement('p');
                        nameElement.className = 'mb-0 text-center text-capitalize';
                        nameElement.style.fontSize = '12px';
                        nameElement.textContent = evolution.name;
                        
                        EL_EVOLUTION_CARD.appendChild(EVO_IMG);
                        EL_EVOLUTION_CARD.appendChild(nameElement);
                        fragment.appendChild(EL_EVOLUTION_CARD);
                        
                        // Add arrow between evolutions
                        if (index < evolutionChain.length - 1) {
                            const arrow = document.createElement('div');
                            arrow.className = 'evolution-arrow';
                            fragment.appendChild(arrow);
                        }
                    });
                }
                
                EL_EVOLUTIONS.appendChild(fragment); // Append all at once as fragment
                console.log(`✅ Displayed ${evolutionChain.length} evolutions`);

            } catch (error) {
                console.error('❌ Error during evolution data fetch/render:', error);
                EL_EVOLUTIONS.innerHTML = '<p class="text-muted mb-0">Evolution data unavailable</p>';
            }
            //----------------------------------------------------------------------        
        }
    }
    //-------------------------------------------------

    displayEvolutions(SPECIES_DATA, POKE_ID); // Render evolutions
    displayWeaknesses(POKE_TYPES); // Render weaknesses
    displayStats(POKE_STATS); // Render stats chart using D3.js
