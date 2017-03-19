{
'use strict';

let mon;
const pokemon = [];
const apiUrl = 'http://pokeapi.co/api/v2/pokemon/';
const apiLimit = 900;
const apiOffset = 0;
const team = [null,null,null,null,null,null]
let teamPosition = 0;
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
    <td>${mon.id < 722 ? `<img height="40" src="${imgUrl+parseInt(mon.id)+'.png'}">` : `<img height="30" src="images/noimage-unown.png">` }</td>
    <td>${mon.name}</td>
    <td><span class="type ${mon.type_i.toLowerCase()}">${mon.type_i}</span></td>
    <td><span class="type ${mon.type_ii.toLowerCase()}">${mon.type_ii}</span></td>
    </tr>`
  }).join('');
  if (html !== '') {
    suggestions.innerHTML = `
      <div id="pokemonListWrapper">
        <table>`
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
  team.splice(teamPosition, 1, currPokemon);
  componentToUpdate = document.querySelector('.stage-component:nth-child('+(Number(teamPosition) + 1)+')');
  componentToUpdate.innerHTML = `<img src="images/pokemon/${currPokemon.id}.png" />`;
  renderTeamStage(team);

  closeModal();  
}

function closeModal(){
  pokemonAddModal.classList.remove('show');
  pokemonAddModal.classList.add('hide');
}

function openModal(){
  teamPosition = this.dataset.position;
  pokemonAddModal.classList.remove('hide');
  pokemonAddModal.classList.add('show');
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
      return Math.round(percent - (percent * .20));
    }
    
  }
  
  baseStatValues.map(stat => {
    html += `<div style="height:${calculatePercent(stat, baseStatMax)}%;"><span>${stat}</span></div>`;
  });

  pokemonStatsGraph.innerHTML = html;
}

function renderTeamStage(team){

  //build DOM -> team stage
  function addStageComponents(team){
    for (var i = 0; i < 6; i++) {
      const teamStageComponent = document.createElement('div');
            teamStageComponent.classList.add('stage-component');
            teamStageComponent.setAttribute('data-position', i)
      teamStage.appendChild(teamStageComponent);
    }

    const teamAddBtn = document.querySelector('#teamStage').querySelectorAll('.stage-component');
      teamAddBtn.forEach(function(btn){
        btn.addEventListener('click', openModal);
    })
  }

  const teamStage = document.createElement('div');
        teamStage.setAttribute('id','teamStage');
  
  if (!!document.querySelector('#teamStage')){
    teamStage.innerHTML = '';
  } else {
    document.body.appendChild(teamStage);
  }

  addStageComponents(team);

}

const header = document.createElement('header');
        document.body.appendChild(header);

//build DOM -> modal
const pokemonAddModal = document.createElement('div');
      pokemonAddModal.setAttribute('id','pokemon-add-modal');
      pokemonAddModal.classList.add('hide');
const pokemonQuickView = document.createElement('div');
      pokemonQuickView.setAttribute('id','pokemon-quickview')
const pokemonListNode = document.createElement('div');
      pokemonListNode.setAttribute('id','pokemon-list');
const pokemonModalCloseBtn = document.createElement('div');
      pokemonModalCloseBtn.setAttribute('id','modal-close-button');
      pokemonModalCloseBtn.innerHTML = '<img width="13" src="images/close.png">'

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
renderTeamStage(team)
}
