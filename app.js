{
'use strict';

let mon;
const pokemon = [];
const apiUrl = 'http://pokeapi.co/api/v2/pokemon/';
const apiLimit = 900;
const apiOffset = 0;
const team = [];
let currPokemon = {};

//functions
function updateQuickview(url){
  pokemonQuickView.innerHTML = '<img class="loader" src="images/loader.gif">';

  //TODO: change to promises, apparently you can't cancel fetch :c
  fetch(url)
    .then(results => results.json())
    .then(data => renderQuickview(data));
    //TODO: catch error
}

function getPokemonList(url){
  fetch(url)
    .then(results => results.json())
    .then(data => buildPokemonList(data));
}

function renderQuickview(pokemon){

  const html = `
    <h1>${pokemon.name}</h1>
    <div id="pokemonInfo">
      <img src="images/pokemon/${pokemon.id}.png" />
      <ul>
        ${pokemon.types.map(type => `<li><span class="type ${type.type.name}">${type.type.name}</span></li>`).join('')}
      </ul>
    </div>
    <div id="pokemonStatsInfo"></div>
    <div id="pokemonAdd">
      <a href="#">Add to team</a>
    </div>
  `;

  currPokemon = pokemon;

  pokemonQuickView.innerHTML = html;

  //attach event listener to add button on render of qv
  const addBtn = document.getElementById('pokemonAdd').querySelector('a');
  addBtn.addEventListener('click', addToTeam);

  renderPokemonStats(pokemon);
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
    <td>${mon.id < 722 ? `<img height="40" src="${imgUrl+parseInt(mon.id)+'.png'}">` : `<img height="60" src="images/noimage.png">` }</td>
    <td>${mon.name}</td>
    <td><span class="type ${mon.type_i.toLowerCase()}">${mon.type_i}</span></td>
    <td><span class="type ${mon.type_ii.toLowerCase()}">${mon.type_ii}</span></td>
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
          <th>Type II</th>`
          + html +
        `</table>
      </div>`;

      //attach event listeners at build
      const table = document.querySelector("table");
      const tableRows = table.querySelectorAll("tr");
      
      tableRows.forEach(function(row){
        function prepareQuickView(){
          const name = this.querySelector("td:nth-child(3)");
          updateQuickview(apiUrl+name.innerText.toLowerCase()+'/');
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

function addToTeam(){
  if (team.length <= 5) {
    team.push(currPokemon);
  } else {
    alert("too many pokemon, please clear one from your team");
  }
  team.map(function(member, key) {
      console.log(`${team[key].name}`);
  })
}

function closeModal(){
  pokemonAddModal.classList.add('hidden');
}

function renderPokemonStats(pokemon){
  const pokemonStatsGraph = document.getElementById('pokemonStatsInfo');
  let html = '';

  //find highest number in stats array to use as base for 100%
  const baseStatValues = [];
  currPokemon.stats.map(stat => baseStatValues.push(stat.base_stat));
  const baseStatMax = Math.max(...baseStatValues);
  const statPercentages = [];

  function calculatePercent(stat,baseStatMax){
    const percent = stat/baseStatMax*100;
    if (baseStatMax < 50) {
      return Math.round(percent - (percent * .75));
    } else if (baseStatMax > 50 && baseStatMax < 110) {
      return Math.round(percent - (percent * .4));
    } else if (baseStatMax >= 110) {
      return Math.round(percent - (percent * .15));
    }
    
  }
  
  baseStatValues.map(stat => {
    html += `<div style="height:${calculatePercent(stat, baseStatMax)}%;"><span>${stat}</span></div>`;
  });

  pokemonStatsGraph.innerHTML = html;
}

//build DOM
const pokemonAddModal = document.createElement('div');
      pokemonAddModal.classList.add('pokemon-add-modal');
const pokemonQuickView = document.createElement('div');
      pokemonQuickView.classList.add('pokemon-quickview')
const pokemonListNode = document.createElement('div');
      pokemonListNode.classList.add('pokemon-list');
const pokemonModalCloseBtn = document.createElement('div');
      pokemonModalCloseBtn.classList.add('modal-close-button');
      pokemonModalCloseBtn.innerHTML = '<img width="15" src="images/close.png">'

document.body.appendChild(pokemonAddModal);
pokemonAddModal.appendChild(pokemonListNode);
pokemonAddModal.insertBefore(pokemonQuickView, pokemonListNode);
pokemonAddModal.insertBefore(pokemonModalCloseBtn, pokemonQuickView);

const pokemonListInput = 
  `<input type="search" placeholder="Filter by name..." class="search-pokemon" >
    <div class="suggestions">
      <p>fetching list...</p>
    </div>`;

pokemonListNode.innerHTML = pokemonListInput;

const suggestions = document.querySelector('.suggestions');

//event listeners
const searchInput = document.querySelector('.search-pokemon');
searchInput.addEventListener('keyup', displayPokemonMatches);
pokemonModalCloseBtn.addEventListener('click', closeModal);

//go
getPokemonList('pokedex.json');
updateQuickview(apiUrl+'1/');
}
