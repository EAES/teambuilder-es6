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
			return preparePokemonList(data);
		});
	};

	var renderQuickview = function renderQuickview(pokemon) {
		var html = '\n\t\t\t<h1>' + pokemon.name + '</h1>\n\t\t\t<div id="pokemonInfo">\n\t\t\t<img src="images/pokemon/sugimori/compressed/' + pokemon.id + '.png" />\n\t\t\t<ul>\n\t\t\t\t' + pokemon.types.map(function (type) {
			return '<li><span class="type ' + type.type.name + '">' + type.type.name + '</span></li>';
		}).join('') + '\n\t\t\t</ul>\n\t\t\t</div>\n\t\t\t<div id="pokemonStatsInfo"></div>\n\t\t\t<div id="pokemonAdd">\n\t\t\t<button>Add to team</button>\n\t\t\t</div>\n\t\t';

		currPokemon = pokemon;

		pokemonQuickView.innerHTML = html;

		//attach event listener to add button on render of qv
		var addBtn = document.getElementById('pokemonAdd').querySelector('button');
		addBtn.addEventListener('click', addToTeam);

		renderPokemonStats(pokemon);
	};

	var matchPokemon = function matchPokemon(match, pokemon, trigger) {
		var regex = new RegExp(match, 'gi');

		if (trigger === 'gen') {
			return pokemon.filter(function (mon) {
				if (match === '1') {
					return mon.id >= 0 && mon.id <= 151;
				} else if (match === '2') {
					return mon.id >= 152 && mon.id <= 251;
				} else if (match === '3') {
					return mon.id >= 252 && mon.id <= 386;
				} else if (match === '4') {
					return mon.id >= 387 && mon.id <= 493;
				} else if (match === '5') {
					return mon.id >= 494 && mon.id <= 649;
				} else if (match === '6') {
					return mon.id >= 650 && mon.id <= 721;
				} else if (match === '7') {
					return mon.id >= 722 && mon.id <= 807;
				}
			});
		} else if (trigger === 'type') {
			return pokemon.filter(function (mon) {
				return mon.type_i.match(regex) || mon.type_ii.match(regex);
			});
		} else {
			return pokemon.filter(function (mon) {
				return mon.name.match(regex);
			});
		}
	};

	var renderPokemonTable = function renderPokemonTable(pokemon) {
		var imgUrl = 'images/pokemon/icons/';

		var html = pokemon.map(function (mon) {
			return '<tr>\n\t\t\t<td>' + mon.id + '</td>\n\t\t\t<td><img height=\'40\' src=' + (imgUrl + mon.name.toLowerCase().replace(/ /g, '-').replace(/\.|\(|\)|\:|\'|/g, '').replace(/é/g, 'e').replace(/♀/g, '-f').replace(/♂/g, '-m').replace('shaymin-s', 'shaymin-sky').replace('meloetta-a', 'meloetta').replace('wormadam-p', 'wormadam').replace('wormadam-s', 'wormadam-sandy').replace('wormadam-t', 'wormadam-trash').replace('giratina-o', 'giratina-origin').replace('darmanitan-z', 'darmanitan-zen').replace('hoopa-c', 'hoopa').replace('-spin', '-fan').replace('-cut', '-mow').replace(/-n\b/, '').replace(/-s\b/, '-speed').replace('-a', '-attack').replace('-d', '-defense').replace('-p', '-pirouette').replace('-u', '-unbound')) + '.png></td>\n\t\t\t<td>' + mon.name + '</td>\n\t\t\t<td><span class="type ' + mon.type_i.toLowerCase() + '">' + mon.type_i + '</span></td>\n\t\t\t<td><span class="type ' + mon.type_ii.toLowerCase() + '">' + mon.type_ii + '</span></td>\n\t\t\t</tr>';
		}).join('');
		if (html !== '') {
			suggestions.innerHTML = '\n\t\t\t<div id="pokemonListWrapper">\n\t\t\t\t<table>' + html + '</table>\n\t\t\t</div>';

			//attach event listeners at build
			var table = document.querySelector("table");
			var tableRows = table.querySelectorAll("tr");

			tableRows.forEach(function (row) {
				function prepareQuickView() {
					var id = this.querySelector("td:nth-child(1)");
					updateQuickview(apiUrl + 'pokemon/' + parseInt(id.innerText) + '/');
				}
				row.addEventListener('click', prepareQuickView);
			});
		} else {
			suggestions.innerHTML = '<p>No results found</p>';
		}
	};

	var filterPokemon = function filterPokemon(event, trigger) {
		var value = event.target.value;
		renderPokemonTable(matchPokemon(value, pokemon, trigger));
	};

	var preparePokemonList = function preparePokemonList(data) {
		data.map(function (result) {
			!result.name.match(/-mega|chu-/) ? pokemon.push(result) : '';
		});

		renderPokemonTable(pokemon);
	};

	var addToTeam = function addToTeam() {
		team.splice(teamPosition, 1, currPokemon);
		var componentToUpdate = document.querySelector('.stage-component:nth-child(' + (Number(teamPosition) + 1) + ')');
		componentToUpdate.innerHTML = '<img src="images/pokemon/sprites/pokemon/' + (currPokemon.id + '.png') + '" />';

		renderTeamStage(team);
		closeModal();
		var currTypes = currPokemon.types.map(function (type) {
			return type.type.name;
		});
		calcWeaknesses(currTypes);
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

	var calcWeaknesses = function calcWeaknesses(types) {
		weaknessStageEl.innerHTML = 'calculating weaknesses...';
		var weaknesses = types.map(function (type) {
			return fetchTypeData(type);
		});
		weakArray[teamPosition].length = 0;
		strongArray[teamPosition].length = 0;

		Promise.all(weaknesses).then(function (results) {
			return Promise.all(results.map(function (x) {
				return x.json();
			}));
		}).then(function (results) {
			return results.map(function (x) {
				x.damage_relations.double_damage_from.map(function (type) {
					return weakArray[teamPosition].push(type.name);
				});
				x.damage_relations.double_damage_to.map(function (type) {
					return strongArray[teamPosition].push(type.name);
				});
			});
		}).then(function () {
			var _ref, _ref2;

			var w = (_ref = []).concat.apply(_ref, weakArray);
			var s = (_ref2 = []).concat.apply(_ref2, strongArray);
			var filteredTypes = w.filter(function (type) {
				if (!s.includes(type)) {
					return type;
				}
			});
			renderTypeWeaknesses([].concat(_toConsumableArray(new Set(filteredTypes))));
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
		function renderStageComponents() {
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

		renderStageComponents(team);
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
		var html = void 0;

		if (types.length === 0) {
			html = '\n\t\t\t<img src="images/confetti.png">\n\t\t\t<h2>Your team has full coverage!!</h2>\n\t\t\t<p>now get out there and battle!</p>';
		} else {
			html = '\n\t\t\t<h2>Your team is still weak to:</h2>\n\t\t\t<ul class="type-list">\n\t\t\t' + list + '\n\t\t\t</ul>';
		}

		weaknessStageEl.innerHTML = html;
		document.body.appendChild(weaknessStageEl);
	};

	var startOver = function startOver() {
		console.log('やり直します！');
		if (!team.every(function (x) {
			return x === null;
		})) {
			if (confirm('This will clear your stage of all pokémon. Are you sure?')) {
				weakArray.map(function (x) {
					return x.length = 0;
				});
				strongArray.map(function (x) {
					return x.length = 0;
				});
				renderTypeWeaknesses();
				team.fill(null);
				Array.from(document.body.querySelectorAll('.stage-component')).map(function (x) {
					return x.innerHTML = '';
				});
			}
		}
	};

	var pokemon = [];
	var apiUrl = 'https://pokeapi.co/api/v2/';
	var team = new Array(6).fill(null);
	var weakArray = [[], [], [], [], [], []];
	var strongArray = [[], [], [], [], [], []];
	var teamPosition = 0;
	var currPokemon = {};

	var header = document.createElement('header');
	document.body.appendChild(header);
	header.innerHTML = '<img src="images/mainlogo.png">';
	var startOverButton = document.createElement('button');
	startOverButton.setAttribute('class', 'clear-stage');
	startOverButton.innerText = 'start over';
	header.appendChild(startOverButton);

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

	var pokemonListInput = '<input type="search" placeholder="Filter by name..." class="search-pokemon" >\n\t\t\t<select name="typefilter">\n\t\t\t\t<option selected>Or filter by type...</option>\n\t\t\t\t' + defaultTypes().sort().map(function (type) {
		return '<option value="' + type + '">' + (type[0].toUpperCase() + type.substring(1)) + '</option>';
	}) + '\n\t\t\t</select>\n\t\t\t<select name="genfilter">\n\t\t\t\t<option selected>Or filter by Gen...</option>\n\t\t\t\t' + Array(7).fill().map(function (_, i) {
		return '<option value="' + (i + 1) + '">Gen ' + (i + 1) + '</option>';
	}) + '\n\t\t\t</select>\n\t\t\t<div class="suggestions">\n\t\t\t\t<p>fetching list...</p>\n\t\t\t</div>';

	pokemonListNode.innerHTML = pokemonListInput;

	var suggestions = document.querySelector('.suggestions');

	//event listeners
	var searchInput = document.querySelector('.search-pokemon');
	searchInput.addEventListener('keyup', function (event) {
		return filterPokemon(event);
	});
	pokemonModalCloseBtn.addEventListener('click', closeModal);
	startOverButton.addEventListener('click', startOver);
	var typefilter = document.querySelector('select[name="typefilter"]');
	typefilter.addEventListener('change', function (event) {
		return filterPokemon(event, 'type');
	});
	var genfilter = document.querySelector('select[name="genfilter"]');
	genfilter.addEventListener('change', function (event) {
		return filterPokemon(event, 'gen');
	});

	//go
	getPokemonList('pokedex.json');
	updateQuickview(apiUrl + 'pokemon/1/');
	renderTeamStage(team);
	renderTypeWeaknesses();
}
