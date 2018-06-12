{
	const pokemon = [];
	const apiUrl = 'https://pokeapi.co/api/v2/';
	const team = new Array(6).fill(null);
	const weakArray = [[], [], [], [], [], []];
	const strongArray = [[], [], [], [], [], []];
	let teamPosition = 0;
	let currPokemon = {};
	
	//functions
	function capturePokemon(url){
		return fetch(url);
	}

	function updateQuickview(url){
		//show loader
		pokemonQuickView.innerHTML = '<img class="loader" src="images/loader.gif">';
		
		//TODO: change to promises, apparently you can't cancel fetch :c
		capturePokemon(url)
			.then(results => results.json())
			.then(data => renderQuickview(data));
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
			<img src="images/pokemon/sugimori/compressed/${pokemon.id}.png" />
			<ul>
				${pokemon.types.map(type => `<li><span class="type ${type.type.name}">${type.type.name}</span></li>`).join('')}
			</ul>
			</div>
			<div id="pokemonStatsInfo"></div>
			<div id="pokemonAdd">
			<button>Add to team</button>
			</div>
		`;

		currPokemon = pokemon;

		pokemonQuickView.innerHTML = html;

		//attach event listener to add button on render of qv
		const addBtn = document.getElementById('pokemonAdd').querySelector('button');
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
		const imgUrl = 'images/pokemon/icons/';

		const html = pokemon.map(mon=>{
			return `<tr>
			<td>${mon.id}</td>
			<td><img height='40' src=${
				imgUrl + mon.name
					.toLowerCase()
					.replace(/ /g, '-')
					.replace(/\.|\(|\)|\:|\'|/g, '')
					.replace(/é/g,'e')
					.replace(/♀/g,'-f')
					.replace(/♂/g,'-m')
					.replace('shaymin-s','shaymin-sky')
					.replace('meloetta-a','meloetta')
					.replace('wormadam-p','wormadam')
					.replace('wormadam-s','wormadam-sandy')
					.replace('wormadam-t','wormadam-trash')
					.replace('giratina-o','giratina-origin')
					.replace('darmanitan-z','darmanitan-zen')
					.replace('hoopa-c','hoopa')
					.replace('-spin','-fan')
					.replace('-cut','-mow')
					.replace(/-n\b/,'')
					.replace(/-s\b/,'-speed')
					.replace('-a','-attack')
					.replace('-d','-defense')
					.replace('-p','-pirouette')
					.replace('-u','-unbound')
			}.png></td>
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
				const id = this.querySelector("td:nth-child(1)");
				updateQuickview(apiUrl+'pokemon/'+parseInt(id.innerText)+'/');
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
			!result.name.match(/-mega|chu-/)?pokemon.push(result) : ''
		});

		renderPokemonTable(pokemon);
	}

	function addToTeam(){
		team.splice(teamPosition, 1, currPokemon);
		let componentToUpdate = document.querySelector('.stage-component:nth-child('+(Number(teamPosition) + 1)+')');
		componentToUpdate.innerHTML = `<img src="images/pokemon/sprites/pokemon/${currPokemon.id+'.png'}" />`;

		renderTeamStage(team);
		closeModal();
		const currTypes = currPokemon.types.map(type => type.type.name);
		calcWeaknesses(currTypes);
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

	function fetchTypeData(type){
		return capturePokemon(apiUrl+'type/'+type);
	}
	
	function calcWeaknesses(types) {
		weaknessStageEl.innerHTML = 'calculating weaknesses...';
		const weaknesses = types.map(type => fetchTypeData(type));
		weakArray[teamPosition].length = 0;
		strongArray[teamPosition].length = 0;

		Promise.all(weaknesses)
			.then(results => Promise.all(results.map(x => x.json())))
			.then(results => results.map(x => {
				x.damage_relations.double_damage_from.map(type => weakArray[teamPosition].push(type.name));
				x.damage_relations.double_damage_to.map(type => strongArray[teamPosition].push(type.name));
			}))
			.then(() => {
				const w = [].concat(...weakArray);
				const s = [].concat(...strongArray);
				const filteredTypes = w.filter(type => {
					if (!s.includes(type)) {
						return type
					}
				});
				renderTypeWeaknesses([...new Set(filteredTypes)]);
			});
	}

	function renderPokemonStats(){
		const pokemonStatsGraph = document.getElementById('pokemonStatsInfo');
		let html = '';

		//find highest number in stats array to use as base for 100%
		const baseStatValues = [];
		currPokemon.stats.map(stat => baseStatValues.push(stat.base_stat));
		const baseStatMax = Math.max(...baseStatValues);

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
		function addStageComponents(){
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

		if (document.querySelector('#teamStage')){
			teamStage.innerHTML = '';
		} else {
			document.body.appendChild(teamStage);
		}

		addStageComponents(team);

	}

	function defaultTypes(){
		return ['NORMAL','FIRE','WATER','ELECTRIC','GRASS','ICE','FIGHTING','POISON','GROUND','FLYING','PSYCHIC','BUG','ROCK','GHOST','DRAGON','DARK','STEEL','FAIRY'].map((val)=> val.toLowerCase());
	}

	function renderTypeWeaknesses(types = defaultTypes()){
		const list = types.sort().map((val)=>`<li class="type ${val}">${val}</li>`).join('');
		let html;

		if (types.length === 0) {
			html = `
			<img src="images/confetti.png">
			<h2>Your team has full coverage!!</h2>
			<p>now get out there and battle!</p>`;
		} else {
			html = `
			<h2>Your team is still weak to:</h2>
			<ul class="type-list">
			`+ list + `
			</ul>`;
		}

		weaknessStageEl.innerHTML = html;
		document.body.appendChild(weaknessStageEl);
	}

	function startOver() {	
		console.log('やり直します！')
		if (!team.every( x => x === null)) {
			if (confirm('This will clear your stage of all pokémon. Are you sure?')) {
				weakArray.map(x=>x.length=0);
				strongArray.map(x => x.length = 0);
				renderTypeWeaknesses();
				team.fill(null);
				Array.from(document.body.querySelectorAll('.stage-component')).map(x => x.innerHTML = '');
			}
		}
	}

	const header = document.createElement('header');
				document.body.appendChild(header);
				header.innerHTML = '<img src="images/mainlogo.png">'
	const startOverButton = document.createElement('button');
				startOverButton.setAttribute('class', 'clear-stage');
				startOverButton.innerText = 'start over';
				header.appendChild(startOverButton);

	//build DOM -> modal
	const pokemonAddModal = document.createElement('div');
				pokemonAddModal.setAttribute('id','pokemon-add-modal');
				pokemonAddModal.classList.add('hide');
	const pokemonQuickView = document.createElement('div');
				pokemonQuickView.setAttribute('id','pokemon-quickview')
	const pokemonListNode = document.createElement('div');
				pokemonListNode.setAttribute('id','pokemon-list');
	const weaknessStageEl = document.createElement('div');
				weaknessStageEl.setAttribute('id', 'teamWeaknesses');
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
	startOverButton.addEventListener('click', startOver);

	//go
	getPokemonList('pokedex.json');
	updateQuickview(apiUrl+'pokemon/1/');
	renderTeamStage(team);
	renderTypeWeaknesses();
}
