let mon;
let pokemon = [];
const apiUrl = 'http://pokeapi.co/api/v2/pokemon/';
const imgUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
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
    return `<tr>
    <td>${mon.id}</td>
    <td>${mon.id < 722 ? `<img height="60" src="${imgUrl+parseInt(mon.id)+'.png'}">` : '' }</td>
    <td>${mon.name}</td>
    <td>${mon.type_i}</td>
    <td>${mon.type_ii}</td>
    </tr>`
  }).join('');
  if (html !== '') {
    suggestions.innerHTML = `
      <table>
      <th>
      <td>ID</td>
      <td>Sprite</td>
      <td>Name</td>
      <td>Type I</td>
      <td>Type II</td>
      </th>`
      + html +
      `</table>`;
  } else {
    suggestions.innerHTML = `<li>No results found</li>`;
  }
}

function buildPokemonList(data){
  data.map(result => {
    !result.name.match(/-mega|chu-/)  ?  pokemon.push(result) : ''
  });

  const html = pokemon.map(mon=>{
    //DRY up!
    return `<tr>
    <td>${mon.id}</td>
    <td>${mon.id < 722 ? `<img height="60" src="${imgUrl+parseInt(mon.id)+'.png'}">` : '' }</td>
    <td>${mon.name}</td>
    <td>${mon.type_i}</td>
    <td>${mon.type_ii}</td>
    </tr>`
  }).join('');

  suggestions.innerHTML = `
    <table>
    <th>
    <td>ID</td>
    <td>Sprite</td>
    <td>Name</td>
    <td>Type I</td>
    <td>Type II</td>
    </th>`
    + html +
    `</table>`;
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
getPokemonList('pokedex.json');
getInitialPokemon(apiUrl+'1/');
