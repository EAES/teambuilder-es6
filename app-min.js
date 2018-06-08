'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

{

	//functions
	var capturePokemon = function capturePokemon(url) {
		return fetch(url);
	};

	var updateQuickview = function updateQuickview(url) {
		//show loader
		pokemonQuickView.innerHTML = '<img class="loader" src="images/loader.gif">';

		//TODO: change to promises, apparently you can't cancel fetch :c
		capturePokemon(url).then(function (results) {
			return results.json();
		}).then(function (data) {
			return renderQuickview(data);
		});
	};

	var getPokemonList = function getPokemonList(url) {
		fetch(url).then(function (results) {
			return results.json();
		}).then(function (data) {
			return buildPokemonList(data);
		});
	};

	var renderQuickview = function renderQuickview(pokemon) {
		var html = '\n\t\t\t<h1>' + pokemon.name + '</h1>\n\t\t\t<div id="pokemonInfo">\n\t\t\t<img src="images/pokemon/' + pokemon.id + '.png" />\n\t\t\t<ul>\n\t\t\t\t' + pokemon.types.map(function (type) {
			return '<li><span class="type ' + type.type.name + '">' + type.type.name + '</span></li>';
		}).join('') + '\n\t\t\t</ul>\n\t\t\t</div>\n\t\t\t<div id="pokemonStatsInfo"></div>\n\t\t\t<div id="pokemonAdd">\n\t\t\t<a href="#">Add to team</a>\n\t\t\t</div>\n\t\t';

		currPokemon = pokemon;

		pokemonQuickView.innerHTML = html;

		//attach event listener to add button on render of qv
		var addBtn = document.getElementById('pokemonAdd').querySelector('a');
		addBtn.addEventListener('click', addToTeam);

		renderPokemonStats(pokemon);
	};

	var findPokemonMatch = function findPokemonMatch(matchWord, pokemon) {
		return pokemon.filter(function (mon) {
			var regex = new RegExp(matchWord, 'gi');
			return mon.name.match(regex);
		});
	};

	var renderPokemonTable = function renderPokemonTable(pokemon) {
		var imgUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

		var html = pokemon.map(function (mon) {
			return '<tr>\n\t\t\t<td>' + mon.id + '</td>\n\t\t\t<td>' + (mon.id < 722 ? '<img height="40" src="' + (imgUrl + parseInt(mon.id) + '.png') + '">' : '<img height="30" src="images/noimage-unown.png">') + '</td>\n\t\t\t<td>' + mon.name + '</td>\n\t\t\t<td><span class="type ' + mon.type_i.toLowerCase() + '">' + mon.type_i + '</span></td>\n\t\t\t<td><span class="type ' + mon.type_ii.toLowerCase() + '">' + mon.type_ii + '</span></td>\n\t\t\t</tr>';
		}).join('');
		if (html !== '') {
			suggestions.innerHTML = '\n\t\t\t<div id="pokemonListWrapper">\n\t\t\t\t<table>' + html + '</table>\n\t\t\t</div>';

			//attach event listeners at build
			var table = document.querySelector("table");
			var tableRows = table.querySelectorAll("tr");

			tableRows.forEach(function (row) {
				function prepareQuickView() {
					var name = this.querySelector("td:nth-child(3)");
					updateQuickview(apiUrl + 'pokemon/' + name.innerText.toLowerCase() + '/');
				}
				row.addEventListener('click', prepareQuickView);
			});
		} else {
			suggestions.innerHTML = '<p>No results found</p>';
		}
	};

	var displayPokemonMatches = function displayPokemonMatches() {
		var matchArray = findPokemonMatch(this.value, pokemon);
		renderPokemonTable(matchArray);
	};

	var buildPokemonList = function buildPokemonList(data) {
		data.map(function (result) {
			!result.name.match(/-mega|chu-/) ? pokemon.push(result) : '';
		});

		renderPokemonTable(pokemon);
	};

	var addToTeam = function addToTeam() {
		team.splice(teamPosition, 1, currPokemon);
		var componentToUpdate = document.querySelector('.stage-component:nth-child(' + (Number(teamPosition) + 1) + ')');
		componentToUpdate.innerHTML = '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + (currPokemon.id + '.png') + '" />';
		renderTeamStage(team);

		closeModal();
		renderPokemonStats(determineWeaknesses(currPokemon.types));
	};

	var closeModal = function closeModal() {
		pokemonAddModal.classList.remove('show');
		pokemonAddModal.classList.add('hide');
	};

	var openModal = function openModal() {
		teamPosition = this.dataset.position;
		pokemonAddModal.classList.remove('hide');
		pokemonAddModal.classList.add('show');
	};

	var fetchTypeData = function fetchTypeData(type) {
		return capturePokemon(apiUrl + 'type/' + type);
	};

	var removeStrengths = function removeStrengths(weaks) {
		console.log(weaks);
	};

	var buildWeakArray = function buildWeakArray(name) {
		weakArray.push(name);
		var newWeakArray = [].concat(_toConsumableArray(new Set(weakArray)));
		removeStrengths(newWeakArray);
	};

	var determineWeaknesses = function determineWeaknesses(types) {
		weaknessStageEl.innerHTML = 'Calculating weaknesses...';

		var weaknesses = types.map(function (type) {
			return fetchTypeData(type.type.name);
		});

		Promise.all(weaknesses).then(function (results) {
			return results.map(function (result) {
				return result.json().then(function (data) {
					return data.damage_relations.double_damage_from.map(function (type) {
						return buildWeakArray(type.name);
					});
				});
			});
		});
	};

	var renderPokemonStats = function renderPokemonStats() {
		var pokemonStatsGraph = document.getElementById('pokemonStatsInfo');
		var html = '';

		//find highest number in stats array to use as base for 100%
		var baseStatValues = [];
		currPokemon.stats.map(function (stat) {
			return baseStatValues.push(stat.base_stat);
		});
		var baseStatMax = Math.max.apply(Math, baseStatValues);

		function calculatePercent(stat, baseStatMax) {
			var percent = stat / baseStatMax * 100;
			if (baseStatMax < 50) {
				return Math.round(percent - percent * .75);
			} else if (baseStatMax > 50 && baseStatMax < 110) {
				return Math.round(percent - percent * .4);
			} else if (baseStatMax >= 110) {
				return Math.round(percent - percent * .20);
			}
		}

		baseStatValues.map(function (stat) {
			html += '<div style="height:' + calculatePercent(stat, baseStatMax) + '%;"><span>' + stat + '</span></div>';
		});

		pokemonStatsGraph.innerHTML = html;
	};

	var renderTeamStage = function renderTeamStage(team) {

		//build DOM -> team stage
		function addStageComponents() {
			for (var i = 0; i < 6; i++) {
				var teamStageComponent = document.createElement('div');
				teamStageComponent.classList.add('stage-component');
				teamStageComponent.setAttribute('data-position', i);
				teamStage.appendChild(teamStageComponent);
			}

			var teamAddBtn = document.querySelector('#teamStage').querySelectorAll('.stage-component');
			teamAddBtn.forEach(function (btn) {
				btn.addEventListener('click', openModal);
			});
		}

		var teamStage = document.createElement('div');
		teamStage.setAttribute('id', 'teamStage');

		if (document.querySelector('#teamStage')) {
			teamStage.innerHTML = '';
		} else {
			document.body.appendChild(teamStage);
		}

		addStageComponents(team);
	};

	var defaultTypes = function defaultTypes() {
		return ['NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY'].map(function (val) {
			return val.toLowerCase();
		});
	};

	var renderTypeWeaknesses = function renderTypeWeaknesses() {
		var types = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultTypes();

		var list = types.sort().map(function (val) {
			return '<li class="type ' + val + '">' + val + '</li>';
		}).join('');

		var html = '\n\t\t\t<h2>Your team is still weak to:</h2>\n\t\t\t<ul class="type-list">\n\t\t\t' + list + '\n\t\t\t</ul>';

		weaknessStageEl.innerHTML = html;

		document.body.appendChild(weaknessStageEl);
	};

	var pokemon = [];
	var apiUrl = 'https://pokeapi.co/api/v2/';
	var team = new Array(6).fill(null);
	var teamPosition = 0;
	var currPokemon = {};
	var weakArray = [];

	var header = document.createElement('header');
	document.body.appendChild(header);
	header.innerHTML = '<img src="images/mainlogo.png">';

	//build DOM -> modal
	var pokemonAddModal = document.createElement('div');
	pokemonAddModal.setAttribute('id', 'pokemon-add-modal');
	pokemonAddModal.classList.add('hide');
	var pokemonQuickView = document.createElement('div');
	pokemonQuickView.setAttribute('id', 'pokemon-quickview');
	var pokemonListNode = document.createElement('div');
	pokemonListNode.setAttribute('id', 'pokemon-list');
	var weaknessStageEl = document.createElement('div');
	weaknessStageEl.setAttribute('id', 'teamWeaknesses');
	var pokemonModalCloseBtn = document.createElement('div');
	pokemonModalCloseBtn.setAttribute('id', 'modal-close-button');
	pokemonModalCloseBtn.innerHTML = '<img width="13" src="images/close.png">';

	document.body.appendChild(pokemonAddModal);
	pokemonAddModal.appendChild(pokemonListNode);
	pokemonAddModal.insertBefore(pokemonQuickView, pokemonListNode);
	pokemonAddModal.insertBefore(pokemonModalCloseBtn, pokemonQuickView);

	var pokemonListInput = '<input type="search" placeholder="Filter by name..." class="search-pokemon" >\n\t\t\t<div class="suggestions">\n\t\t\t<p>fetching list...</p>\n\t\t\t</div>';

	pokemonListNode.innerHTML = pokemonListInput;

	var suggestions = document.querySelector('.suggestions');

	//event listeners
	var searchInput = document.querySelector('.search-pokemon');
	searchInput.addEventListener('keyup', displayPokemonMatches);
	pokemonModalCloseBtn.addEventListener('click', closeModal);

	//go
	getPokemonList('pokedex.json');
	updateQuickview(apiUrl + 'pokemon/1/');
	renderTeamStage(team);
	renderTypeWeaknesses();
}
