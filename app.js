let mon;
let pokemon = [];

function getInitialPokemon(url){
  fetch(url)
    .then(results => results.json())
    .then(data => renderPokeStats(data));
    //to do: catch error
}

function getPokemonList(url){
  fetch(url)
    .then(results => results.json())
    .then(data => buildPokemonList(data));
}

function renderPokeStats(pokemon){
  const html = `
    <img src="${pokemon.sprites.front_default}" />
    Natl Dex No. ${pokemon.id}
    ${pokemon.name}
    ${pokemon.types.map(type => `${type.type.name}`)}
    ${pokemon.stats.map(stat => `${stat.stat.name}`)}
    ${pokemon.stats.map(stat => `${stat.base_stat}`)}
  `;

  const pokemonQuickView = document.createElement('pokemon-quickview');
  document.body.insertBefore(pokemonQuickView, pokemonListElement);

  pokemonQuickView.innerHTML = html;
}

function findPokemonMatch(matchWord, pokemon){
  return pokemon.filter(mon=>{
    const regex = new RegExp(matchWord, 'gi');
    return mon.name.match(regex);
  });
}

function displayPokemonMatches(){
  const matchArray = findPokemonMatch(this.value, pokemon);
  const html = matchArray.map(mon=>{
    return `<li>${mon.name}</li>`;
  }).join('');
  if (html !== '') {
    suggestions.innerHTML = html;
  } else {
    suggestions.innerHTML = `<li>No results found</li>`;
  }
}

function buildPokemonList(data){
  data.results.map(result => pokemon.push(result));

  const html = pokemon.map(mon=>{
    return `
      <li>${mon.name}</li>
    `;
  }).join('');

  suggestions.innerHTML = html;
}

const apiUrl = 'http://pokeapi.co/api/v2/pokemon/'
const apiLimit = 20
const apiOffset = 0;

getPokemonList(apiUrl+'?'+'offset='+apiOffset+'&limit='+apiLimit);
getInitialPokemon(apiUrl+'1/');

//create custom element
const pokemonListElement = document.createElement('pokemon-list');
document.body.appendChild(pokemonListElement);

const pokemonList = 
  `<form>
    <input type="text" class="search-pokemon" placeholder="Filter by name...">
    <ul class="suggestions">
      <p>fetching list...</p>
    </ul>
  </form>`;

pokemonListElement.innerHTML = pokemonList;

const searchInput = document.querySelector('.search-pokemon');
const suggestions = document.querySelector('.suggestions');

// searchInput.addEventListener('change', findPokemonMatch)
searchInput.addEventListener('keyup', displayPokemonMatches)
