let pokemon = [];

function getPokemon(url){
  fetch(url)
    .then(res => res.json())
    .then(data => {
      data.results.map(datum=>{
        if (!datum.name.match(/-mega|pikachu-/,'gi')) {
          pokemon.push(datum);
        }
      })
      // pokemon.push(...data.results);
      buildPokemonList();
    });
}

function findPokemonMatch(matchWord, cities){
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
  // console.log(html);
  if (html !== '') {
    suggestions.innerHTML = html;
  } else {
    suggestions.innerHTML = `<li>No results found</li>`;
  }
}

function buildPokemonList(){
  //console.log("building list...")
  const html = pokemon.map(mon=>{
    return `<li>${mon.name}</li>`;
  }).join('');

  suggestions.innerHTML = html;
}

getPokemon('http://pokeapi.co/api/v2/pokemon/?limit=900');

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


