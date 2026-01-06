// detail-render.js
// Description: Dynamically fill pokemon_detail.html page with data using fetched Pokémon info from Dexie DB or API
// Author: Oscar Collins
// AI usage: Heavy AI assistance, made many manual corrections and improvements

// Full description:
// This script fetches detailed information about a specific Pokémon using its ID or name from the URL parameters.
// It retrieves the data from a Dexie IndexedDB cache or the PokeAPI if not cached via getPokemonDataFromDexieOrAPI().
// Species data (description, evolutions, variants) is fetched once and passed to rendering functions.
// Shows data: image, name, ID, description, types with popovers, abilities with popovers, height, weight, stats chart using D3.js, evolutions, variants, and weaknesses with popovers.

import { getPokemonDataFromDexieOrAPI } from './fetch-and-db.js';
import { sharePokemon, initShareComponents, getShareCapabilities } from './share-manager.js';


// CONSTANTS______________________________________________________________________________
const EL_IMAGE = document.getElementById('pokemon-detail-image');
const EL_NAME = document.getElementById('pokemon-detail-name');
const EL_ID = document.getElementById('pokemon-detail-id');
const EL_DESCRIPTION = document.getElementById('pokemon-detail-description');
const EL_TYPE1 = document.getElementById('pokemon-detail-type1-img');
const EL_TYPE2 = document.getElementById('pokemon-detail-type2-img');
const EL_ABILITIES = document.getElementById('pokemon-detail-abilities');
const EL_HEIGHT = document.getElementById('pokemon-detail-height');
const EL_WEIGHT = document.getElementById('pokemon-detail-weight');
const EL_WEAKNESSES_CONTAINER = document.getElementById('pokemon-weaknesses');
const EL_STATS_CHART = document.getElementById('pokemon-stats-chart');
const EL_EVOLUTIONS = document.getElementById('pokemon-evolutions');
const EL_VARIANTS = document.getElementById('pokemon-variants');
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


// MAIN___________________________________________________________________________________
const POKEMON_ID = new URLSearchParams(window.location.search).get('id');
let CURRENT_POKEMON_DATA = null; // Store current Pokemon data for sharing

// Initialize share components after DOM is ready
initShareComponents();
console.log('📤 Share capabilities:', getShareCapabilities());

// Wire up share button
if (EL_SHARE_BUTTON) {
    EL_SHARE_BUTTON.addEventListener('click', function() {
        if (CURRENT_POKEMON_DATA) {
            sharePokemon(CURRENT_POKEMON_DATA);
        } else {
            console.warn('📤 No Pokémon data available to share');
        }
    });
}

if (POKEMON_ID) {
    displayPokemonDetails(POKEMON_ID);
} else {
    console.error("No Pokémon ID provided in URL");
    alert("No Pokémon ID specified. Returning to home page.");
    window.location.href = 'index.html';
}
//________________________________________________________________________________________


// FUNCTIONS______________________________________________________________________________
/**
 * Fetch and display Pokémon details
 * Uses getPokemonDataFromDexieOrAPI for cached Pokemon data, fetches species data once
 * @param {string|number} id - Pokémon ID or name
 */
async function displayPokemonDetails(id) {
    console.debug(`displayPokemonDetails(${id})`);
    console.log("Fetching details for Pokémon ID:", id);
    
    // Fetch main Pokemon data from Dexie cache or API
    const POKEMON_DATA = await getPokemonDataFromDexieOrAPI(id);
    
    if (!POKEMON_DATA) {
        console.error("❌ aborting displayPokemonDetails() - no data returned from getPokemonDataFromDexieOrAPI");
        alert("Failed to load Pokémon data. Please try again.");
        return;
    }
    
    // Store data globally for sharing
    CURRENT_POKEMON_DATA = POKEMON_DATA;
    
    // Basic info
    EL_IMAGE.src = POKEMON_DATA.sprites.front_default || '/collinso/pwakedex/IMG/default-pokemon-img.jpg';
    EL_IMAGE.alt = POKEMON_DATA.name;
    EL_NAME.textContent = POKEMON_DATA.name;
    EL_ID.textContent = `#${POKEMON_DATA.id.toString().padStart(3, '0')}`;
    
    // Height and Weight (convert from decimeters/hectograms)
    const heightMeters = (POKEMON_DATA.height / 10).toFixed(1);
    const weightKg = (POKEMON_DATA.weight / 10).toFixed(1);
    EL_HEIGHT.textContent = `Height: ${heightMeters} m`;
    EL_WEIGHT.textContent = `Weight: ${weightKg} kg`;
    
    // Fetch species data ONCE for description, evolutions, and variants
    let speciesData = null;
    try {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${POKEMON_DATA.id}`);
        if (speciesResponse.ok) {
            speciesData = await speciesResponse.json();
            console.log("✅ Species data fetched successfully");
        } else {
            console.warn(`⚠️ Species API request failed: ${speciesResponse.status}`);
        }
    } catch (error) {
        console.error('❌ Failed to fetch species data:', error);
    }
    
    // Display description from species data
    if (speciesData) {
        const englishEntry = speciesData.flavor_text_entries.find(function(entry) {
            return entry.language.name === 'en';
        });
        
        if (englishEntry) {
            const cleanText = englishEntry.flavor_text
                .replace(/\f/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            EL_DESCRIPTION.textContent = cleanText;
        } else {
            EL_DESCRIPTION.textContent = 'No description available.';
            console.warn("No English description found");
        }
    } else {
        EL_DESCRIPTION.textContent = 'Description unavailable.';
    }
    
    // Populate other sections using fetched data
    displayTypes(POKEMON_DATA.types);
    displayAbilities(POKEMON_DATA.abilities);
    displayStats(POKEMON_DATA.stats);
    displayEvolutions(speciesData, POKEMON_DATA.id);
    displayVariants(speciesData, POKEMON_DATA.name);
    displayWeaknesses(POKEMON_DATA.types);
    
    console.log("✅ Pokémon details displayed successfully");
}

/**
 * Display Pokémon types with appropriate icons and popovers
 * @param {Array} types - Array of type objects from Pokemon data (pokemonData.types)
 */
function displayTypes(types) {
    console.debug("displayTypes()");
    
    if (types && types.length > 0) {
        const type1Name = types[0].type.name.toLowerCase();
        EL_TYPE1.src = `./IMG/elements/${type1Name}.png`;
        EL_TYPE1.alt = type1Name;
        EL_TYPE1.style.display = 'block';
        EL_TYPE1.style.cursor = 'pointer';
        
        // Add popover for type 1
        addTypePopover(EL_TYPE1, types[0].type.url, type1Name);
        
        if (types.length > 1) {
            const type2Name = types[1].type.name.toLowerCase();
            EL_TYPE2.src = `./IMG/elements/${type2Name}.png`;
            EL_TYPE2.alt = type2Name;
            EL_TYPE2.style.display = 'block';
            EL_TYPE2.style.cursor = 'pointer';
            
            // Add popover for type 2
            addTypePopover(EL_TYPE2, types[1].type.url, type2Name);
        } else {
            EL_TYPE2.style.display = 'none';
        }
    }
}

/**
 * Display Pokémon abilities with popovers
 * @param {Array} abilities - Array of ability objects from Pokemon data (pokemonData.abilities)
 */
function displayAbilities(abilities) {
    console.debug("displayAbilities()");
    
    EL_ABILITIES.innerHTML = '';
    
    if (abilities && abilities.length > 0) {
        for (let i = 0; i < abilities.length; i++) {
            const abilityObj = abilities[i];
            const abilityName = abilityObj.ability.name.replace('-', ' ');
            
            // Create span for each ability
            const abilitySpan = document.createElement('span');
            abilitySpan.className = 'text-capitalize';
            abilitySpan.style.cursor = 'pointer';
            abilitySpan.style.textDecoration = 'underline dotted';
            abilitySpan.style.textUnderlineOffset = '3px';
            abilitySpan.textContent = abilityName;
            
            // Add popover to ability (async, fire-and-forget)
            addAbilityPopover(abilitySpan, abilityObj.ability.url, abilityName);
            
            EL_ABILITIES.appendChild(abilitySpan);
            
            // Add comma separator if not last ability
            if (i < abilities.length - 1) {
                EL_ABILITIES.appendChild(document.createTextNode(', '));
            }
        }
    } else {
        EL_ABILITIES.textContent = 'No abilities listed';
    }
}

/**
 * Display Pokémon stats with D3.js bar chart
 * @param {Array} stats - Array of stat objects from API
 */
function displayStats(stats) {
    console.debug("displayStats()");
    
    if (!stats || stats.length === 0) {
        EL_STATS_CHART.innerHTML = '<p class="text-muted mb-0">No stats data available</p>';
        return;
    }
    
    // Clear previous chart
    EL_STATS_CHART.innerHTML = '';
    
    // Prepare data
    const statsData = stats.map(function(statObj) {
        return {
            name: statObj.stat.name.replace('-', ' ').toUpperCase(),
            value: statObj.base_stat
        };
    });
    
    // Chart dimensions
    const margin = {top: 20, right: 20, bottom: 50, left: 80};
    const width = 500 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#pokemon-stats-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('max-width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleBand()
        .domain(statsData.map(function(d) { return d.name; }))
        .range([0, width])
        .padding(0.2);
    
    // Fixed scale: Base stats typically range from 1-255, with most Pokemon under 200
    const MAX_STAT = 255;
    const yScale = d3.scaleLinear()
        .domain([0, MAX_STAT])
        .range([height, 0]);
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
        .domain(statsData.map(function(d) { return d.name; }))
        .range(['#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c']);
    
    // Add bars
    svg.selectAll('.bar')
        .data(statsData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return xScale(d.name); })
        .attr('width', xScale.bandwidth())
        .attr('y', function(d) { return yScale(d.value); })
        .attr('height', function(d) { return height - yScale(d.value); })
        .attr('fill', function(d) { return colorScale(d.name); })
        .attr('rx', 4);
    
    // Add value labels on top of bars
    svg.selectAll('.label')
        .data(statsData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2; })
        .attr('y', function(d) { return yScale(d.value) - 5; })
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(function(d) { return d.value; });
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('fill', '#fff')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('font-size', '10px');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll('text')
        .attr('fill', '#fff');
    
    // Style axis lines
    svg.selectAll('.domain, .tick line')
        .attr('stroke', '#fff')
        .attr('stroke-opacity', 0.3);
    
    console.log(`✅ Stats chart displayed with ${statsData.length} stats`);
}

/**
 * Display Pokémon evolution chain
 * @param {Object|null} speciesData - Species data object from API (already fetched)
 * @param {number} currentId - Current Pokémon ID for highlighting
 */
async function displayEvolutions(speciesData, currentId) {
    console.debug(`displayEvolutions(speciesData, ${currentId})`);
    
    if (!speciesData) {
        EL_EVOLUTIONS.innerHTML = '<p class="text-muted mb-0">Evolution data unavailable</p>';
        return;
    }
    
    try {
        const evolutionChainUrl = speciesData.evolution_chain.url;
        
        // Fetch evolution chain data
        const evolutionResponse = await fetch(evolutionChainUrl);
        
        if (!evolutionResponse.ok) {
            throw new Error(`Evolution chain API request failed: ${evolutionResponse.status}`);
        }
        
        const evolutionData = await evolutionResponse.json();
        
        // Parse evolution chain
        const evolutionChain = [];
        let current = evolutionData.chain;
        
        // Traverse the evolution chain
        while (current) {
            const speciesName = current.species.name;
            const speciesId = current.species.url.split('/').filter(Boolean).pop();
            
            evolutionChain.push({
                name: speciesName,
                id: speciesId
            });
            
            // Move to next evolution (taking first evolution path if multiple)
            current = current.evolves_to.length > 0 ? current.evolves_to[0] : null;
        }
        
        // Display evolution chain
        EL_EVOLUTIONS.innerHTML = '';
        
        if (evolutionChain.length === 1) {
            EL_EVOLUTIONS.innerHTML = '<p class="text-muted mb-0">No evolutions</p>';
        } else {
            evolutionChain.forEach(function(evolution, index) {
                // Create evolution card
                const evolutionCard = document.createElement('div');
                evolutionCard.className = 'd-flex flex-column align-items-center';
                
                // Add image
                const img = document.createElement('img');
                img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`;
                img.alt = evolution.name;
                img.className = 'mb-2';
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.cursor = 'pointer';
                
                // Highlight current Pokémon
                if (evolution.id === currentId.toString()) {
                    evolutionCard.style.border = '2px solid #fac000';
                    evolutionCard.style.borderRadius = '12px';
                    evolutionCard.style.padding = '8px';
                    evolutionCard.style.backgroundColor = 'rgba(250, 192, 0, 0.1)';
                }
                
                // Add click handler to navigate to evolution
                img.addEventListener('click', function() {
                    window.location.href = `pokemon-detail.html?id=${evolution.id}`;
                });
                
                // Add name
                const nameElement = document.createElement('p');
                nameElement.className = 'mb-0 text-center text-capitalize';
                nameElement.style.fontSize = '12px';
                nameElement.textContent = evolution.name;
                
                evolutionCard.appendChild(img);
                evolutionCard.appendChild(nameElement);
                EL_EVOLUTIONS.appendChild(evolutionCard);
                
                // Add arrow between evolutions
                if (index < evolutionChain.length - 1) {
                    const arrow = document.createElement('span');
                    arrow.className = 'fs-3 text-muted';
                    arrow.textContent = '→';
                    arrow.style.margin = '0 10px';
                    EL_EVOLUTIONS.appendChild(arrow);
                }
            });
        }
        
        console.log(`✅ Displayed ${evolutionChain.length} evolutions`);
    } catch (error) {
        console.error('❌ Failed to fetch evolution data:', error);
        EL_EVOLUTIONS.innerHTML = '<p class="text-muted mb-0">Evolution data unavailable</p>';
    }
}

/**
 * Display Pokémon variants (regional forms, mega evolutions, etc.)
 * @param {Object|null} speciesData - Species data object from API (already fetched)
 * @param {string} currentName - Current Pokémon name to exclude from variants
 */
async function displayVariants(speciesData, currentName) {
    console.debug(`displayVariants(speciesData, ${currentName})`);
    
    if (!speciesData) {
        EL_VARIANTS.innerHTML = '<p class="text-muted mb-0">Variant data unavailable</p>';
        return;
    }
    
    try {
        const varieties = speciesData.varieties;
        
        // Filter out the current variant and get details for others
        const variantsList = [];
        
        for (const variety of varieties) {
            if (variety.pokemon.name !== currentName) {
                try {
                    // Use getPokemonDataFromDexieOrAPI for variant data when possible
                    const variantData = await getPokemonDataFromDexieOrAPI(variety.pokemon.name);
                    
                    if (variantData) {
                        variantsList.push({
                            name: variantData.name,
                            id: variantData.id,
                            sprite: variantData.sprites.front_default
                        });
                    } else {
                        // Fallback to direct API fetch if not in cache
                        const variantResponse = await fetch(variety.pokemon.url);
                        const variantApiData = await variantResponse.json();
                        
                        variantsList.push({
                            name: variantApiData.name,
                            id: variantApiData.id,
                            sprite: variantApiData.sprites.front_default
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to fetch variant ${variety.pokemon.name}:`, error);
                }
            }
        }
        
        // Display variants
        EL_VARIANTS.innerHTML = '';
        
        if (variantsList.length === 0) {
            EL_VARIANTS.innerHTML = '<p class="text-muted mb-0">No variants available</p>';
        } else {
            variantsList.forEach(function(variant) {
                // Create variant card
                const variantCard = document.createElement('div');
                variantCard.className = 'd-flex flex-column align-items-center p-2';
                variantCard.style.cursor = 'pointer';
                variantCard.style.borderRadius = '12px';
                variantCard.style.transition = 'background-color 0.2s';
                
                // Hover effect
                variantCard.addEventListener('mouseenter', function() {
                    variantCard.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                });
                variantCard.addEventListener('mouseleave', function() {
                    variantCard.style.backgroundColor = 'transparent';
                });
                
                // Add image
                const img = document.createElement('img');
                img.src = variant.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${variant.id}.png`;
                img.alt = variant.name;
                img.className = 'mb-2';
                img.style.width = '80px';
                img.style.height = '80px';
                
                // Add name with formatting
                const nameElement = document.createElement('p');
                nameElement.className = 'mb-0 text-center text-capitalize';
                nameElement.style.fontSize = '11px';
                nameElement.style.maxWidth = '100px';
                
                // Format variant name (e.g., "pikachu-gmax" -> "Gmax")
                const baseName = speciesData?.name || currentName.split('-')[0];
                let displayName = variant.name.replace(baseName + '-', '');
                displayName = displayName.replace('-', ' ');
                nameElement.textContent = displayName;
                
                variantCard.appendChild(img);
                variantCard.appendChild(nameElement);
                
                // Click handler to navigate to variant
                variantCard.addEventListener('click', function() {
                    window.location.href = `pokemon-detail.html?id=${variant.id}`;
                });
                
                EL_VARIANTS.appendChild(variantCard);
            });
        }
        
        console.log(`✅ Displayed ${variantsList.length} variants`);
    } catch (error) {
        console.error('❌ Failed to fetch variant data:', error);
        EL_VARIANTS.innerHTML = '<p class="text-muted mb-0">Variant data unavailable</p>';
    }
}

/**
 * Add popover to ability element with fetched description
 * @param {HTMLElement} element - DOM element to attach popover to
 * @param {string} abilityUrl - API URL for ability data
 * @param {string} abilityName - Name of the ability
 */
async function addAbilityPopover(element, abilityUrl, abilityName) {
    console.debug(`addAbilityPopover(${abilityName})`);
    
    try {
        const response = await fetch(abilityUrl);
        
        if (!response.ok) {
            throw new Error(`Ability API request failed: ${response.status}`);
        }
        
        const abilityData = await response.json();
        
        // Find English effect entry
        const englishEffect = abilityData.effect_entries.find(function(entry) {
            return entry.language.name === 'en';
        });
        
        let description = 'No description available.';
        if (englishEffect) {
            description = englishEffect.short_effect || englishEffect.effect;
        }
        
        // Set popover attributes
        element.setAttribute('data-bs-toggle', 'popover');
        element.setAttribute('data-bs-trigger', 'hover focus');
        element.setAttribute('data-bs-placement', 'top');
        element.setAttribute('data-bs-title', abilityName.toUpperCase());
        element.setAttribute('data-bs-content', description);
        
        // Initialize Bootstrap popover with dark theme
        const popover = new bootstrap.Popover(element, {
            html: false,
            container: 'body',
            customClass: 'popover-dark ability-popover'
        });
        
        // Set header color dynamically using POISON type color
        element.addEventListener('inserted.bs.popover', function() {
            const popoverElement = document.querySelector('.popover-dark.ability-popover');
            if (popoverElement) {
                const header = popoverElement.querySelector('.popover-header');
                if (header) {
                    header.style.backgroundColor = TYPE_COLORS.POISON;
                    header.style.color = '#ffffff';
                    header.style.fontWeight = '600';
                    header.style.borderBottom = '1px solid #7a35a8';
                }
            }
        });
        
        console.log(`✅ Popover added for ability: ${abilityName}`);
    } catch (error) {
        console.error(`❌ Failed to fetch ability data for ${abilityName}:`, error);
    }
}

/**
 * Add popover to type element with type information
 * @param {HTMLElement} element - DOM element to attach popover to
 * @param {string} typeUrl - API URL for type data
 * @param {string} typeName - Name of the type
 */
async function addTypePopover(element, typeUrl, typeName) {
    console.debug(`addTypePopover(${typeName})`);
    
    try {
        const response = await fetch(typeUrl);
        
        if (!response.ok) {
            throw new Error(`Type API request failed: ${response.status}`);
        }
        
        const typeData = await response.json();
        
        // Build type effectiveness info
        const doubleDamageTo = typeData.damage_relations.double_damage_to.map(function(t) {
            return t.name;
        }).join(', ');
        
        const doubleDamageFrom = typeData.damage_relations.double_damage_from.map(function(t) {
            return t.name;
        }).join(', ');
        
        let content = `<strong>Super effective against:</strong> ${doubleDamageTo || 'None'}<br>`;
        content += `<strong>Weak to:</strong> ${doubleDamageFrom || 'None'}`;
        
        // Set popover attributes
        element.setAttribute('data-bs-toggle', 'popover');
        element.setAttribute('data-bs-trigger', 'hover focus');
        element.setAttribute('data-bs-placement', 'top');
        element.setAttribute('data-bs-html', 'true');
        element.setAttribute('data-bs-title', typeName.toUpperCase() + ' TYPE');
        element.setAttribute('data-bs-content', content);
        element.setAttribute('data-type-name', typeName);
        
        // Initialize Bootstrap popover with dark theme
        const popover = new bootstrap.Popover(element, {
            html: true,
            container: 'body',
            customClass: 'popover-dark type-popover'
        });
        
        // Set header color dynamically using TYPE_COLORS constant
        const typeColorKey = typeName.toUpperCase();
        const headerColor = TYPE_COLORS[typeColorKey] || '#666666';
        
        // Determine text color based on background brightness
        const lightTypes = ['ELECTRIC', 'ICE', 'ROCK', 'FLYING'];
        const textColor = lightTypes.includes(typeColorKey) ? '#000000' : '#ffffff';
        
        element.addEventListener('inserted.bs.popover', function() {
            const popoverElement = document.querySelector('.popover-dark.type-popover');
            if (popoverElement) {
                const header = popoverElement.querySelector('.popover-header');
                if (header) {
                    header.style.backgroundColor = headerColor;
                    header.style.color = textColor;
                    header.style.fontWeight = '600';
                }
            }
        });
        
        console.log(`✅ Popover added for type: ${typeName}`);
    } catch (error) {
        console.error(`❌ Failed to fetch type data for ${typeName}:`, error);
    }
}

/**
 * Display Pokémon weaknesses based on type effectiveness from API
 * @param {Array} types - Array of type objects from Pokemon data (pokemonData.types)
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
        EL_WEAKNESSES_CONTAINER.innerHTML = '';
        
        if (weaknesses.length === 0) {
            EL_WEAKNESSES_CONTAINER.innerHTML = '<p class="text-muted mb-0">No major weaknesses</p>';
        } else {
            weaknesses.forEach(function(weaknessType) {
                const img = document.createElement('img');
                img.src = `./IMG/elements/${weaknessType}.png`;
                img.alt = weaknessType;
                img.className = 'type-icon';
                img.style.width = '3em';
                img.style.maxWidth = '60px';
                
                // Add red border for 4x damage weaknesses
                if (weaknessMultipliers[weaknessType] === 4) {
                    img.style.border = '3px solid #dc3545';
                    img.style.borderRadius = '8px';
                }
                
                EL_WEAKNESSES_CONTAINER.appendChild(img);
            });
        }
        
    } catch (error) {
        console.error('❌ Failed to fetch weakness data:', error);
        EL_WEAKNESSES_CONTAINER.innerHTML = '<p class="text-muted mb-0">Weakness data unavailable</p>';
    }
}
//________________________________________________________________________________________

