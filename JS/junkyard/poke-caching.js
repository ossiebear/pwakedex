// Old Pokémon caching script, was written mostly by AI then used only in a couple tests.



// Shared Pokémon caching helpers for reuse across scripts
(function(global) {
	const CACHE_PREFIX = 'pokemon:';

	function buildKey(name, id) {
		if (!name || !id) return null;
		return CACHE_PREFIX + name.toLowerCase() + ':' + id;
	}

	function setCachedPokemon(name, id, data) {
		console.debug('PokeCache.setCachedPokemon()', name, id);
		const key = buildKey(name, id);
		if (!key) return;
		try {
			localStorage.setItem(key, JSON.stringify(data));
		} catch (error) {
			console.warn('Failed to cache Pokémon data', error);
		}
	}

	function getCachedPokemon(nameOrId) {
		console.debug('PokeCache.getCachedPokemon()', nameOrId);
		if (nameOrId === undefined || nameOrId === null) return null;
		const target = nameOrId.toString().toLowerCase();
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (!key || !key.startsWith(CACHE_PREFIX)) continue;
			const [, name, id] = key.split(':');
			if (name === target || id === target) {
				try {
					const cached = localStorage.getItem(key);
					return cached ? JSON.parse(cached) : null;
				} catch (error) {
					console.warn('Failed to parse cached Pokémon data', error);
					return null;
				}
			}
		}
		return null;
	}

	function clearPokemonCache() {
		console.debug('PokeCache.clearPokemonCache()');
		const keysToRemove = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(CACHE_PREFIX)) {
				keysToRemove.push(key);
			}
		}
		keysToRemove.forEach(function(key) { localStorage.removeItem(key); });
	}

	async function fetchPokemonFromAPI(nameOrId) {
		const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + nameOrId);
		if (!response.ok) {
			throw new Error('Failed to fetch Pokémon: ' + nameOrId);
		}
		return response.json();
	}

	async function getPokemonFromCacheOrAPI(nameOrId) {
		console.debug('PokeCache.getPokemonFromCacheOrAPI()', nameOrId);
		const cached = getCachedPokemon(nameOrId);
		if (cached) return cached;
		const data = await fetchPokemonFromAPI(nameOrId);
		setCachedPokemon(data.name, data.id, data);
		return data;
	}

	global.PokeCache = {
		setCachedPokemon: setCachedPokemon,
		getCachedPokemon: getCachedPokemon,
		clearPokemonCache: clearPokemonCache,
		getPokemonFromCacheOrAPI: getPokemonFromCacheOrAPI
	};
})(window);
