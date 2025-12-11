// share-manager.js
// Description: Manages Web Share API integration with fallbacks for sharing Pokémon details
// Author: Oscar Collins
// AI usage: AI-assisted implementation following project conventions

// Full description:
// Provides sharing functionality for Pokémon details using the Web Share API.
// Implements progressive fallback: Web Share API → Clipboard API → Manual copy modal.
// Handles image sharing when supported, formats share data, and shows toast notifications.

// CONSTANTS______________________________________________________________________________
const SHARE_EMOJI = '📤';
const BASE_URL = window.location.origin + '/collinso/pwakedex/';

// Bootstrap components (initialized later)
let TOAST_BOOT = null;
let FALLBACK_MODAL_BOOT = null;
//________________________________________________________________________________________


// INITIALIZATION_________________________________________________________________________

/**
 * Initialize Bootstrap components for share feature
 * Must be called after DOM is ready
 */
export function initShareComponents() {
    console.debug("initShareComponents()");
    
    // Toast for feedback
    const TOAST_EL = document.getElementById('share-toast');
    if (TOAST_EL) {
        TOAST_BOOT = initBootstrapComponent(
            TOAST_EL,
            function(el) { return new bootstrap.Toast(el, { delay: 3000 }); },
            "bootstrap.Toast#share-toast"
        );
    }
    
    // Fallback modal for unsupported browsers
    const MODAL_EL = document.getElementById('share-fallback-modal');
    if (MODAL_EL) {
        FALLBACK_MODAL_BOOT = initBootstrapComponent(
            MODAL_EL,
            function(el) { return new bootstrap.Modal(el); },
            "bootstrap.Modal#share-fallback-modal"
        );
    }
    
    // Copy button in fallback modal
    const COPY_BTN = document.getElementById('share-copy-url-btn');
    if (COPY_BTN) {
        COPY_BTN.addEventListener('click', copyUrlFromModal);
    }
}

/**
 * Safely initialize Bootstrap component (copied from version-manager.js pattern)
 */
function initBootstrapComponent(element, factory, label) {
    if (!element) {
        console.warn(`${label} skipped: element missing`);
        return null;
    }
    
    try {
        return factory(element);
    } catch (error) {
        console.error(`Failed to init ${label}:`, error);
        return null;
    }
}
//________________________________________________________________________________________


// MAIN SHARE FUNCTION____________________________________________________________________

/**
 * Share Pokémon details using Web Share API with fallbacks
 * @param {Object} pokemonData - Pokémon data object from API
 * @returns {Promise<boolean>} - True if share was successful
 */
export async function sharePokemon(pokemonData) {
    console.log(`${SHARE_EMOJI} Initiating share for:`, pokemonData.name);
    
    try {
        const SHARE_DATA = formatShareData(pokemonData);
        
        // Try Web Share API with image (best experience)
        if (navigator.canShare && pokemonData.sprites && pokemonData.sprites.front_default) {
            try {
                const IMAGE_FILE = await fetchSpriteAsFile(pokemonData.sprites.front_default, pokemonData.name);
                if (IMAGE_FILE && navigator.canShare({ files: [IMAGE_FILE] })) {
                    await navigator.share({ ...SHARE_DATA, files: [IMAGE_FILE] });
                    console.log(`${SHARE_EMOJI} ✅ Shared with image via Web Share API`);
                    showShareFeedback('Shared successfully!', 'success');
                    return true;
                }
            } catch (error) {
                console.warn(`${SHARE_EMOJI} Image share failed, trying without image:`, error);
            }
        }
        
        // Try Web Share API without image
        if (navigator.share) {
            try {
                await navigator.share(SHARE_DATA);
                console.log(`${SHARE_EMOJI} ✅ Shared via Web Share API`);
                showShareFeedback('Shared successfully!', 'success');
                return true;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log(`${SHARE_EMOJI} Share cancelled by user`);
                    return false;
                }
                throw error;
            }
        }
        
        // Fallback to Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(SHARE_DATA.url);
            console.log(`${SHARE_EMOJI} ✅ Copied to clipboard`);
            showShareFeedback('Link copied to clipboard!', 'info');
            return true;
        }
        
        // Final fallback: Show modal with URL
        showFallbackModal(SHARE_DATA.url);
        console.log(`${SHARE_EMOJI} Showing fallback modal`);
        return true;
        
    } catch (error) {
        console.error(`${SHARE_EMOJI} ❌ Share failed:`, error);
        showShareFeedback('Share failed. Please try again.', 'error');
        return false;
    }
}
//________________________________________________________________________________________


// HELPER FUNCTIONS_______________________________________________________________________

/**
 * Format Pokémon data into Web Share API structure
 * @param {Object} pokemonData - Raw Pokémon data
 * @returns {Object} - Formatted share data
 */
function formatShareData(pokemonData) {
    const POKEMON_NAME = capitalizeFirstLetter(pokemonData.name);
    const POKEMON_ID = pokemonData.id.toString().padStart(3, '0');
    
    // Get types
    const TYPE1 = pokemonData.types[0].type.name;
    const TYPE2 = pokemonData.types[1] ? pokemonData.types[1].type.name : null;
    const TYPE_STRING = TYPE2 ? `${TYPE1}/${TYPE2}` : TYPE1;
    
    return {
        title: `${POKEMON_NAME} (#${POKEMON_ID}) - PWAkedex`,
        text: `Check out ${POKEMON_NAME}, a ${TYPE_STRING} type Pokémon! 🐲`,
        url: `${BASE_URL}pokemon-detail.html?id=${pokemonData.id}`
    };
}

/**
 * Fetch Pokémon sprite image and convert to shareable File object
 * @param {string} spriteUrl - URL of sprite image
 * @param {string} pokemonName - Name for filename
 * @returns {Promise<File|null>} - File object or null if failed
 */
async function fetchSpriteAsFile(spriteUrl, pokemonName) {
    try {
        const RESPONSE = await fetch(spriteUrl);
        if (!RESPONSE.ok) {
            throw new Error(`Failed to fetch sprite: ${RESPONSE.status}`);
        }
        
        const BLOB = await RESPONSE.blob();
        const FILENAME = `${sanitizeFilename(pokemonName)}.png`;
        const FILE = new File([BLOB], FILENAME, { type: 'image/png' });
        
        console.log(`${SHARE_EMOJI} Created shareable image file:`, FILENAME);
        return FILE;
        
    } catch (error) {
        console.warn(`${SHARE_EMOJI} Failed to fetch sprite as file:`, error);
        return null;
    }
}

/**
 * Sanitize filename for safe file creation
 * @param {string} name - Raw filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
}

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//________________________________________________________________________________________


// FALLBACK MODAL FUNCTIONS_______________________________________________________________

/**
 * Show fallback modal with shareable URL for manual copying
 * @param {string} url - URL to display
 */
function showFallbackModal(url) {
    const URL_INPUT = document.getElementById('share-url-input');
    if (URL_INPUT) {
        URL_INPUT.value = url;
        URL_INPUT.select();
    }
    
    if (FALLBACK_MODAL_BOOT) {
        FALLBACK_MODAL_BOOT.show();
    } else {
        console.warn(`${SHARE_EMOJI} Fallback modal not initialized`);
        alert(`Share this URL: ${url}`);
    }
}

/**
 * Copy URL from fallback modal input to clipboard
 */
async function copyUrlFromModal() {
    const URL_INPUT = document.getElementById('share-url-input');
    if (!URL_INPUT) return;
    
    try {
        URL_INPUT.select();
        
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(URL_INPUT.value);
        } else {
            // Fallback to document.execCommand
            document.execCommand('copy');
        }
        
        console.log(`${SHARE_EMOJI} ✅ Copied from modal`);
        
        // Update button text temporarily
        const COPY_BTN = document.getElementById('share-copy-url-btn');
        if (COPY_BTN) {
            const ORIGINAL_TEXT = COPY_BTN.textContent;
            COPY_BTN.textContent = 'Copied!';
            setTimeout(function() {
                COPY_BTN.textContent = ORIGINAL_TEXT;
            }, 2000);
        }
        
    } catch (error) {
        console.error(`${SHARE_EMOJI} ❌ Copy from modal failed:`, error);
        alert('Please manually copy the URL');
    }
}
//________________________________________________________________________________________


// FEEDBACK FUNCTIONS_____________________________________________________________________

/**
 * Show toast notification for share feedback
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info'
 */
function showShareFeedback(message, type) {
    const TOAST_EL = document.getElementById('share-toast');
    if (!TOAST_EL) {
        console.warn(`${SHARE_EMOJI} Toast element not found`);
        return;
    }
    
    const TOAST_BODY = TOAST_EL.querySelector('.toast-body');
    if (TOAST_BODY) {
        TOAST_BODY.textContent = message;
    }
    
    // Update toast styling based on type
    TOAST_EL.classList.remove('bg-success', 'bg-danger', 'bg-info');
    if (type === 'success') {
        TOAST_EL.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        TOAST_EL.classList.add('bg-danger', 'text-white');
    } else {
        TOAST_EL.classList.add('bg-info', 'text-white');
    }
    
    if (TOAST_BOOT) {
        TOAST_BOOT.show();
    } else {
        console.warn(`${SHARE_EMOJI} Toast not initialized`);
    }
}
//________________________________________________________________________________________


// FEATURE DETECTION______________________________________________________________________

/**
 * Check if Web Share API is available
 * @returns {boolean} - True if supported
 */
export function isShareSupported() {
    return typeof navigator.share === 'function';
}

/**
 * Check if Web Share API supports file sharing
 * @returns {boolean} - True if file sharing supported
 */
export function isFileShareSupported() {
    return typeof navigator.canShare === 'function' && 
           navigator.canShare({ files: [new File([], 'test.png', { type: 'image/png' })] });
}

/**
 * Get share capability description for debugging
 * @returns {string} - Description of share capabilities
 */
export function getShareCapabilities() {
    if (isFileShareSupported()) {
        return 'Full Web Share API with file support';
    } else if (isShareSupported()) {
        return 'Web Share API (no file support)';
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
        return 'Clipboard API only';
    } else {
        return 'Manual copy only';
    }
}
//________________________________________________________________________________________
