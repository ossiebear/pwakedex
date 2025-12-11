// pokemon-grid.js
// Description: Generates a grid of Pokémon cards using indexedDB data or API calls
// Author: Oscar Collins
// AI usage: 3D card effect


import {getPokemonDataFromDexieOrAPI} from './fetch-and-DB.js';


//input fields and event listeners_________________________________________________________ 
    // Name or ID search bar----------------------
        //moved to fetch-and-DB.js
    //--------------------------------------------
    
    // Send API request button--------------------
        //moved to fetch-and-DB.js
    //--------------------------------------------

    // Weight range------------------------------- 
        const weight_min_input = document.getElementById('weight-min');
        const weight_max_input = document.getElementById('weight-max');
        //weight_min_input.addEventListener('input', updateApiPreview);
        //weight_max_input.addEventListener('input', updateApiPreview);
    //--------------------------------------------

    // Height range------------------------------- 
        const height_min_input = document.getElementById('height-min');
        const height_max_input = document.getElementById('height-max');
        //height_min_input.addEventListener('input', updateApiPreview);
        // height_max_input.addEventListener('input', updateApiPreview);
    //--------------------------------------------

    // ID range-----------------------------------   
        const id_min_input = document.getElementById('id-min');
        const id_max_input = document.getElementById('id-max');
        //id_min_input.addEventListener('input', updateApiPreview);
        //id_max_input.addEventListener('input', updateApiPreview);
    // Abilities dropdown
        const abilities_dropdown = document.getElementById('abilities-dropdown');
        //abilities_dropdown.addEventListener('change', updateApiPreview);
    // Elemental type buttons container
        const ELEMENTAL_CONTAINER_EL = document.getElementById('elements-container');
    // Load more button
        const LOAD_MORE_BUTTON_EL = document.getElementById('load-more-pokemon');
        LOAD_MORE_BUTTON_EL.addEventListener('click', function() {
            loadMorePokemon(8); //load 8 more pokemon on each click
        });
//________________________________________________________________________________________



// POKEMON TYPES__________________________________________________________________________
    const TYPES = [
        "Normal", "Fighting", "Flying", "Poison", "Ground",
        "Rock", "Bug", "Ghost", "Steel", "Fire", "Water",
        "Grass", "Electric", "Psychic", "Ice", "Dragon",
        "Dark", "Fairy" //, "Stellar" (removed for simplicity)
    ];
//________________________________________________________________________________________



// COLORS_________________________________________________________________________________
    // Shaded color scheme-----
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
    //--------------------------

    /* Matched color scheme-----
    const TYPE_COLORS = {
        NORMAL: '#6c6d6c',
        FIRE: '#cc6600',
        WATER: '#2064bc',
        ELECTRIC: '#c69800',
        GRASS: '#2b6d1c',
        ICE: '#96D9D6',
        FIGHTING: '#cc6600',
        POISON: '#6c3097',
        GROUND: '#5d3415',
        FLYING: '#6591bc',
        PSYCHIC: '#bc335f',
        BUG: '#91a119',
        ROCK: '#7b775b',
        GHOST: '#704170',
        DRAGON: '#5060e1',
        DARK: '#50413f',
        STEEL: '#60a1b8',
        FAIRY: '#ef70ef',
    };*/
    //--------------------------
//________________________________________________________________________________________










// Generate the grid sequentially_________________________________________________________________________________
function generatePokemonGrid(start, end) {
    console.groupCollapsed("Generating Pokemon Grid");
    console.debug(`generatePokemonGrid() from #${start} to #${end}`);
    // Grab container element and clear it's content
    let container = document.getElementById('pokemon-grid');
    //container.innerHTML = '';

    function addPokemon(i) {
        if (i <= end) {
            console.groupCollapsed(`Adding Pokémon #${i}`);
            console.debug(`addPokemon(${i})`);

            getPokemonDataFromDexieOrAPI(i)
            .then(function(pokemon) {
                console.debug(`generatePokemonGrid() says:  received data for (${pokemon.name}), adding to grid...`);
                let col = document.createElement('div');
                col.className = 'col';

                let mainType = pokemon.types[0].type.name.toUpperCase();
                let borderColor = TYPE_COLORS[mainType] || '#777';

                col.innerHTML = `
                <!-- Pokémon Card for ${pokemon.name} -->
                <a href="pokemon-detail.html?id=${pokemon.id}" class="text-decoration-none">
                    <div class="card shadow-lg border-0 card-hover pokemon-card" style="border-top:5px solid ${borderColor}; transition: transform 0.2s;">
                        
                        <!-- Image Section -->
                        <div class="pokemon-card-img-container bg-dark">
                            <img src="${pokemon.sprites.front_default}" class="pokemon-card-img" alt="${pokemon.name}">
                        </div>

                        <!-- Details Section -->
                        <div class="card-body pokemon-card-body" style="background: linear-gradient(145deg, #505050ff, #272727ff);">

                            <!-- Name, ID, exp-->
                            <h5 class="card-title text-capitalize fw-bold mb-2 pokemon-card-title" style="color: white">${pokemon.name}</h5>
                            <div class="d-flex justify-content-center mb-2 gap-2 flex-wrap pokemon-card-badges">
                                <span class="badge bg-primary">ID: ${pokemon.id}</span>
                            
                            </div>

                            <!-- Types -->
                            <div class="pokemon-card-types">
                                <div class="d-flex justify-content-center gap-2 align-items-center flex-wrap">
                                    ${pokemon.types.map(function(t) {
                                        let typeName = t.type.name.toUpperCase();
                                        let color = TYPE_COLORS[typeName] || '#333';
                                        return `
                                            <div class="d-flex align-items-center gap-1 pokemon-type-badge">
                                                <img src="./IMG/elements/${t.type.name}.png" alt="${t.type.name}" width="32" height="32" class="pokemon-type-icon">
                                                <span class="text-capitalize fw-semibold pokemon-type-text" style="color:${color};">${t.type.name}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </a>            `;

                container.appendChild(col);

                // 3D card effect on mouse move (AI GENERATED)
                let cardElement = col.querySelector('.pokemon-card');
                
                cardElement.addEventListener('mousemove', function(event) {
                    const rect = cardElement.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / centerY * -20;
                    const rotateY = (x - centerX) / centerX * 20;
                    
                    cardElement.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(10px)`;
                });
                
                cardElement.addEventListener('mouseleave', function() {
                    cardElement.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
                });
                
                // Touch-friendly interaction
                cardElement.addEventListener('touchstart', function() { 
                    cardElement.classList.add('touch-active'); 
                });
                cardElement.addEventListener('touchend', function() { 
                    setTimeout(function() {
                        cardElement.classList.remove('touch-active');
                    }, 150);
                });
                
                console.groupEnd(); // 

                
                // Load next Pokémon
                addPokemon(i + 1);
            });

        // when finished genrating grid
        } else {
            console.log("All Pokémon added to grid.");
            console.groupEnd(); // Close "Generating Pokemon Grid"
        }
    }

    addPokemon(start);
}




function loadMorePokemon(numToLoad) {
    const currentCount = document.getElementById('pokemon-grid').childElementCount;
    const newEnd = currentCount + numToLoad;
    generatePokemonGrid(currentCount + 1, newEnd);
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
                BTN.type = "button";                          // set type="button" to prevent form submission
                BTN.className = "element-card";               // set class name
                BTN.style.backgroundColor = TYPE_COLORS[KEY];// set background color based on type
                BTN.innerHTML = `<img src="./IMG/elements/${SLUG}.png" alt="${NAME} type icon"><span>${NAME}</span>`;
            //--------------------------------------------

            // add button's event listener----------------
                BTN.addEventListener("click", function () {
                    const ACTIVE = BTN.classList.toggle("active");
                    const STATE = ACTIVE ? "true" : "false";

                    BTN.setAttribute("aria-pressed", STATE);
                    BTN.dataset.active = STATE;
                });
            //--------------------------------------------

            FRAGMENT.appendChild(BTN); // add button to fragment
            i++; // iterate
        }

        // When all buttons are created, render them to the container
        ELEMENTAL_CONTAINER_EL.replaceChildren(FRAGMENT);
    }
//________________________________________________________________________________________










// WEIGHT / HEIGHT unit dropdowns (written by AI)________________________________________
    document.querySelectorAll('.dropdown-item').forEach(function(item) {
        item.addEventListener('click', function () {
            this.closest('.input-group')
                .querySelector('.dropdown-toggle')
                .textContent = this.textContent;
        });
    });
//________________________________________________________________________________________












// Generate Pokémon cards
generatePokemonGrid(1, 12);





