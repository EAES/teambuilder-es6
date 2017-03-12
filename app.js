let mon;
let pokemon = [];
const apiUrl = 'http://pokeapi.co/api/v2/pokemon/';
const apiLimit = 900;
const apiOffset = 0;

//functions
function renderQuickViewPokemon(url){
  pokemonQuickView.innerHTML = 'farfetching data...';

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
    <h1>${pokemon.name}</h1>
    <div id="pokemonImage">
      <img src="${pokemon.sprites.front_default}" />
    </div>
    <div id="pokemonQuickInfo">
      <p>Natl Dex No. ${pokemon.id}</p>
      <ul>
        ${pokemon.types.map(type => `<li>${type.type.name}</li>`).join('')}
      </ul>
      ${pokemon.stats.map(stat => `${stat.base_stat}`).join(' | ')}
    </div>
  `;

  pokemonQuickView.innerHTML = html;
}

function findPokemonMatch(matchWord, pokemon){
  return pokemon.filter(mon=>{
    const regex = new RegExp(matchWord, 'gi');
    return mon.name.match(regex);
  });
}

function renderPokemonTable(pokemon){
  const imgUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  
  const html = pokemon.map(mon=>{
    return `<tr>
    <td>${mon.id}</td>
    <td>${mon.id < 722 ? `<img height="60" src="${imgUrl+parseInt(mon.id)+'.png'}">` : `<img height="60" src="images/noimage.png">` }</td>
    <td>${mon.name}</td>
    <td>${mon.type_i}</td>
    <td>${mon.type_ii}</td>
    </tr>`
  }).join('');
  if (html !== '') {
    suggestions.innerHTML = `
      <div id="pokemonListWrapper">
      <table>
      <th>ID</th>
      <th>Sprite</th>
      <th>Name</th>
      <th>Type I</th>
      <th>Type II</th>
      </th>`
      + html +
      `</table></div>`;

      //attach event listeners at build
      const table = document.querySelector("table");
      const tableRows = table.querySelectorAll("tr");
      
      tableRows.forEach(function(row){
        function prepareQuickView(){
          const name = this.querySelector("td:nth-child(3)");
          renderQuickViewPokemon(apiUrl+name.innerText.toLowerCase()+'/');
        }
        row.addEventListener('click', prepareQuickView);
      })

  } else {
    suggestions.innerHTML = `<p>No results found</p>`;
  }
}

function displayPokemonMatches(){
  const matchArray = findPokemonMatch(this.value, pokemon);
  renderPokemonTable(matchArray);
}

function buildPokemonList(data){
  data.map(result => {
    !result.name.match(/-mega|chu-/)  ?  pokemon.push(result) : ''
  });

  renderPokemonTable(pokemon);
}

//build DOM
const pokemonAddModal = document.createElement('div');
      pokemonAddModal.classList.add('pokemon-add-modal');
const pokemonQuickView = document.createElement('div');
      pokemonQuickView.classList.add('pokemon-quickview')
const pokemonListNode = document.createElement('div');
      pokemonListNode.classList.add('pokemon-list');

document.body.appendChild(pokemonAddModal);
pokemonAddModal.appendChild(pokemonListNode);
pokemonAddModal.insertBefore(pokemonQuickView, pokemonListNode);

const pokemonListInput = 
  `<input type="text" class="search-pokemon" placeholder="Filter by name...">
    <div class="suggestions">
      <p>fetching list...</p>
    </div>`;

pokemonListNode.innerHTML = pokemonListInput;

const suggestions = document.querySelector('.suggestions');

//event listeners
const searchInput = document.querySelector('.search-pokemon');
searchInput.addEventListener('keyup', displayPokemonMatches);

//go
getPokemonList('pokedex.json');
renderQuickViewPokemon(apiUrl+'1/');
