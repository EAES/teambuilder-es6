let mon;
let pokemon = [];
const apiUrl = 'http://pokeapi.co/api/v2/pokemon/';
const apiLimit = 900;
const apiOffset = 0;

//functions
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
  data.results.map(result => {
    !result.name.match(/-mega|chu-/)  ?  pokemon.push(result) : undefined
  });

  const html = pokemon.map(mon=>{
    return `<li>${mon.name}</li>`;
  }).join('');

  suggestions.innerHTML = html;
}

//build DOM
const pokemonQuickView = document.createElement('pokemon-quickview');
const pokemonListNode = document.createElement('pokemon-list');
document.body.appendChild(pokemonListNode);
document.body.insertBefore(pokemonQuickView, pokemonListNode);

const pokemonListInput = 
  `<input type="text" class="search-pokemon" placeholder="Filter by name...">
    <ul class="suggestions">
      <p>fetching list...</p>
    </ul>`;

pokemonListNode.innerHTML = pokemonListInput;

const suggestions = document.querySelector('.suggestions');

//event listeners
const searchInput = document.querySelector('.search-pokemon');
searchInput.addEventListener('keyup', displayPokemonMatches)

//go
getPokemonList(apiUrl+'?'+'offset='+apiOffset+'&limit='+apiLimit);
getInitialPokemon(apiUrl+'1/');
