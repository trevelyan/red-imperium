var saito = require('../../lib/saito/saito');
var Game = require('../../lib/templates/game');
var util = require('util');


//////////////////
// CONSTRUCTOR  //
//////////////////
function Imperium(app) {

  if (!(this instanceof Imperium)) { return new Imperium(app); }

  Imperium.super_.call(this);

  this.app             = app;

  this.name            = "Imperium";
  this.description     = `Red Imperium is a multi-player space exploration and conquest simulator. Each player controls a unique faction vying for political control of the galaxy in the waning days of a dying Empire.`;
  this.browser_active  = 0;
  this.handlesEmail    = 1;
  this.emailAppName    = "Imperium";
  this.maxPlayers      = 4;

  //
  // HUD
  //
  this.useHUD = 1;
  this.addHUDMenu      = ['Planets','Tech','Trade','Laws'];

  //
  // this sets the ratio used for determining
  // the size of the original pieces
  //
  //this.gameboardWidth  = 2677;
  this.gameboardWidth  = 1900;

  this.moves           = [];
  this.rmoves          = [];
  this.totalPlayers    = 3;

  this.confirms_needed 	 = 0;
  this.confirms_received = 0;

  //
  // game-related
  //
  this.assigns = [];  // floating units needing assignment to ships
  this.tracker = {};  // track options in turn

  return this;

}
module.exports = Imperium;
util.inherits(Imperium, Game);








/////////////////
/// HUD MENUS ///
/////////////////
Imperium.prototype.triggerHUDMenu = function triggerHUDMenu(menuitem) {
  switch (menuitem) {
    case "planets":
      this.handlePlanetsMenuItem();
      break;
    case "tech":
      this.handleTechMenuItem();
      break;
    case "trade":
      this.handleTradeMenuItem();
      break;
    case "laws":
      this.handleLawsMenuItem();
      break;
    default:
      break;
  }
}

Imperium.prototype.handlePlanetsMenuItem = function handlePlanetsMenuItem() {

  let imperium_self = this;
  let factions = this.returnFactions();
  let html =
  `
    <div id="menu-container">
      <div style="margin-bottom: 1em">
        The Planetary Empires:
      </div>
      <ul>
   `;
  for (let i = 0; i < this.game.players.length; i++) {
    html += `  <li class="card" id="${i}">${factions[this.game.players[i].faction].name}</li>`;
  }
  html += `
      </ul>
    </div>
  `
  $('.hud_menu_overlay').html(html);

  //
  // leave action enabled on other panels
  //
  $('.card').on('click', function() {

    let player_action = $(this).attr("id");
    let array_of_cards = imperium_self.returnPlayerPlanetCards(player_action+1); // all

    let html  = "<ul>";
    for (let z = 0; z < array_of_cards.length; z++) {
      if (imperium_self.game.planets[array_of_cards[z]].exhausted == 1) {
        html += '<li class="cardchoice exhausted" id="cardchoice_'+array_of_cards[z]+'">' + imperium_self.returnPlanetCard(array_of_cards[z]) + '</li>';
      } else {
        html += '<li class="cardchoice" id="cardchoice_'+array_of_cards[z]+'">' + imperium_self.returnPlanetCard(array_of_cards[z]) + '</li>';
      }
    }
    html += '</ul>';

    $('.hud_menu_overlay').html(html);

  });

}

Imperium.prototype.handleTechMenuItem = function handleTechMenuItem() {

  let imperium_self = this;
  let factions = this.returnFactions();
  let html =
  `
    <div id="menu-container">
      <div style="margin-bottom: 1em">
        The Technological Empires:
      </div>
      <ul>
   `;
  for (let i = 0; i < this.game.players.length; i++) {
  html += `  <li class="card" id="${i}">${factions[this.game.players[i].faction].name}</li>`;
  }
  html += `
      </ul>
    </div>
  `
  $('.hud_menu_overlay').html(html);

  //
  // leave action enabled on other panels
  //
  $('.card').on('click', function() {

    let p = $(this).attr("id");
    let tech = imperium_self.game.players[p].tech;

    let html  = "<ul>";
    for (let z = 0; z < tech.length; z++) {
      html += '<li class="cardchoice" id="">' + tech[z] + '</li>';
    }
    html += '</ul>';

    $('.hud_menu_overlay').html(html);

  });
}

Imperium.prototype.handleTradeMenuItem = function handleTradeMenuItem() {

  let imperium_self = this;
  let factions = this.returnFactions();
  let html =
  `
    <div id="menu-container">
      <div style="margin-bottom: 1em">
        The Commercial Empires:
      </div>
      <ul>
   `;
  for (let i = 0; i < this.game.players.length; i++) {
  html += `  <li class="card" id="${i}">${factions[this.game.players[i].faction].name}</li>`;
  }
  html += `
      </ul>
    </div>
  `
  $('.hud_menu_overlay').html(html);

  //
  // leave action enabled on other panels
  //
  $('.card').on('click', function() {

    let p = $(this).attr("id");
    let commodities_total = imperium_self.game.players[p].commodities;
    let goods_total = imperium_self.game.players[p].goods;
    let fleet_total = imperium_self.game.players[p].fleet_supply;
    let command_total = imperium_self.game.players[p].command_tokens;
    let strategy_total = imperium_self.game.players[p].strategy_tokens;

    let html  = "Total Faction Resources: <p></p><ul>";
    html += '<li>' + commodities_total + " commodities" + '</li>';
    html += '<li>' + goods_total + " goods" + '</li>'
    html += '<li>' + command_total + " command tokens" + '</li>'
    html += '<li>' + strategy_total + " strategy tokens" + '</li>'
    html += '<li>' + fleet_total + " fleet supply" + '</li>'
    html += '</ul>';

    $('.hud_menu_overlay').html(html);

  });
}



Imperium.prototype.handleLawsMenuItem = function handleLawsMenuItem() {

  let imperium_self = this;
  let laws = this.returnAgendaCards();
  let html = '<div id="menu-container">';

  if (this.game.state.agendas.length > 0) {
    html += '<div style="margin-bottom: 1em">Galactic Laws Under Enforcement:</div>';
    html += '<ul>';
    for (let i = 0; i < this.game.state.laws.length; i++) {
      html += `  <li class="card" id="${i}">${laws[this.game.state.laws[i]].name}</li>`;
    }
    html += '</ul>';
    html += '<p></p>';
  }

  if (this.game.state.laws.length > 0) {
    html += '<div style="margin-bottom: 1em">Galactic Laws Under Consideration:</div>';
    html += '<ul>';
    for (let i = 0; i < this.game.state.agendas.length; i++) {
      html += `  <li class="card" id="${i}">${laws[this.game.state.agendas[i]].name}</li>`;
    }
    html += '</ul>';
  }

  if (this.game.state.laws.length == 0 && this.game.state.agendas.length == 0) {
    html += 'There are no laws in force or agendas up for consideration at this time.';
  }

  html += '</div>';

  $('.hud_menu_overlay').html(html);

}





////////////////
// initialize //
////////////////
Imperium.prototype.initializeGame = async function initializeGame(game_id) {

  this.updateStatus("loading game...");
  this.loadGame(game_id);

  if (this.game.status != "") { this.updateStatus(this.game.status); }

  //
  // specify players
  //
  this.totalPlayers = this.game.opponents.length + 1;
  //this.totalPlayers = 3;

  //
  // position non-hex pieces
  //
  $('.agendabox').css('width', this.gameboardWidth);

  //
  // create new board
  //
  if (this.game.board == null) {

    this.game.board = {};
    for (let i = 1, j = 4; i <= 7; i++) {
      for (let k = 1; k <= j; k++) {
        let slot      = i + "_" + k;
	this.game.board[slot] = { tile : "" };
      }
      if (i < 4) { j++; };
      if (i >= 4) { j--; };
    }

    //
    // dice
    //
    this.initializeDice();

    //
    // units are stored in within systems / planets
    //
    this.game.systems = this.returnSystems();
    this.game.planets = this.returnPlanets();
    this.game.tech    = this.returnTechnologyTree();
    this.game.players = this.returnPlayers(this.totalPlayers); // factions and player info
    this.game.state   = this.returnState();
    this.game.state.strategy_cards = [];
    let x = this.returnStrategyCards();
    for (let i in x) { this.game.state.strategy_cards.push(i); this.game.state.strategy_cards_bonus.push(0); }

    //
    // put homeworlds on board
    //
    let factions = this.returnFactions();
    let hwsectors = this.returnHomeworldSectors(this.game.players.length);
    for (let i = 0; i < this.game.players.length; i++) {
      this.game.players[i].homeworld = hwsectors[i];
      this.game.board[hwsectors[i]].tile = factions[this.game.players[i].faction].homeworld;
    }

    //
    // remove tiles in 3 player game
    //
    if (this.totalPlayers <= 3) {
      $('#1_3').attr('id', '');
      delete this.game.board["1_3"];
      $('#1_4').attr('id', '');
      delete this.game.board["1_4"];
      $('#2_5').attr('id', '');
      delete this.game.board["2_5"];
      $('#3_1').attr('id', '');
      delete this.game.board["3_1"];
      $('#4_1').attr('id', '');
      delete this.game.board["4_1"];
      $('#5_1').attr('id', '');
      delete this.game.board["5_1"];
      $('#6_5').attr('id', '');
      delete this.game.board["6_5"];
      $('#7_3').attr('id', '');
      delete this.game.board["7_3"];
      $('#7_4').attr('id', '');
      delete this.game.board["7_4"];
    }


    //
    // add other planet tiles
    //
    let tmp_sys = this.returnSystems();
    let seltil = [];


    //
    // empty space in board center
    //
    this.game.board["4_4"].tile = "sector25";

    for (let i in this.game.board) {
      if (i != "4_4" && !hwsectors.includes(i)) {
        let oksel = 0;
        var keys = Object.keys(tmp_sys);
        while (oksel == 0) {
          let rp = keys[Math.floor(keys.length * Math.random())];
          if (this.game.systems[rp].hw != 1 && seltil.includes(rp) != 1 && this.game.systems[rp].mr != 1) {
            seltil.push(rp);
            delete tmp_sys[rp];
            this.game.board[i].tile = rp;
            oksel = 1;
          }
        }
      }
    }



    //
    // add starting units to player homewords
    //
    for (let i = 0; i < this.totalPlayers; i++) {

      let sys = this.returnSystemAndPlanets(hwsectors[i]); 

      let strongest_planet = 0;
      let strongest_planet_resources = 0;
      for (z = 0; z < sys.p.length; z++) {
	sys.p[z].owner = (i+1);
 	if (sys.p[z].resources < strongest_planet_resources) {
	  strongest_planet = z;
	  strongest_planet_resources = sys.p[z].resources;
	}
      }

      this.addSpaceUnit(i + 1, hwsectors[i], "cruiser");
      //this.addSpaceUnit(i + 1, hwsectors[i], "flagship");
      //this.addSpaceUnit(i + 1, hwsectors[i], "dreadnaught");
      this.addSpaceUnit(i + 1, hwsectors[i], "destroyer");
      this.addSpaceUnit(i + 1, hwsectors[i], "carrier");
      //this.addSpaceUnit(i + 1, hwsectors[i], "fighter");
      this.addSpaceUnit(i + 1, hwsectors[i], "fighter");
      this.loadUnitOntoPlanet(i + 1, hwsectors[i], strongest_planet, "infantry");
      this.loadUnitOntoPlanet(i + 1, hwsectors[i], strongest_planet, "infantry");
      this.loadUnitOntoPlanet(i + 1, hwsectors[i], strongest_planet, "infantry");
      //this.loadUnitOntoPlanet(i + 1, hwsectors[i], strongest_planet, "infantry");
      this.loadUnitOntoPlanet(i + 1, hwsectors[i], strongest_planet, "pds");
      this.loadUnitOntoPlanet(i + 1, hwsectors[i], strongest_planet, "spacedock");

      this.saveSystemAndPlanets(sys);

    }
  }



  //
  // display board
  //
  for (let i in this.game.board) {

    // add html to index
    let boardslot = "#" + i;
    $(boardslot).html(this.returnTile(i));

    // insert planet
    let planet_div = "#hex_img_"+i;
    $(planet_div).attr("src", this.game.systems[this.game.board[i].tile].img);

    this.updateSectorGraphics(i);

  }

  //
  // initialize game queue
  //
  //if (1) {
  //   this.game.queue = [];

  if (this.game.queue.length == 0) {

    this.game.queue.push("turn");
    this.game.queue.push("newround");

    //
    // add cards to deck and shuffle as needed
    //
    this.game.queue.push("SHUFFLE\t1");
    this.game.queue.push("SHUFFLE\t2");
    this.game.queue.push("SHUFFLE\t3");
    this.game.queue.push("SHUFFLE\t4");
    this.game.queue.push("SHUFFLE\t5");
    this.game.queue.push("SHUFFLE\t6");
    this.game.queue.push("POOL\t1");
    this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnStrategyCards()));
    this.game.queue.push("DECK\t2\t"+JSON.stringify(this.returnActionCards()));	
    this.game.queue.push("DECK\t3\t"+JSON.stringify(this.returnAgendaCards()));
    this.game.queue.push("DECK\t4\t"+JSON.stringify(this.returnStageIPublicObjectives()));
    this.game.queue.push("DECK\t5\t"+JSON.stringify(this.returnStageIIPublicObjectives()));
    this.game.queue.push("DECK\t6\t"+JSON.stringify(this.returnSecretObjectives()));

  }

  //
  // add events to board 
  //
  this.addEventsToBoard();

}







/////////////////////
// Core Game Logic //
/////////////////////
Imperium.prototype.handleGame = function handleGame(msg=null) {

  let imperium_self = this;
  if (this.game.queue.length > 0) {

      imperium_self.saveGame(imperium_self.game.id);

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      if (mv[0] === "gameover") {
	if (imperium_self.browser_active == 1) {
	  alert("Game Over");
	}
	imperium_self.game.over = 1;
	imperium_self.saveGame(imperium_self.game.id);
	return;
      }

      if (mv[0] === "resolve") {

	if (mv[2] != undefined) {

	  this.confirms_received += parseInt(mv[2]);
	  if (this.confirms_needed <= this.confirms_received) {
	    this.confirms_needed = 0;
	    this.confirms_received = 0;
  	    this.game.queue.splice(qe-1, 2);
	    return 1;
	  }

          return 0;

	} else {
  	  this.game.queue.splice(qe-1, 2);
	  return 1;
	}
      }


      if (mv[0] === "turn") {

	this.game.state.turn++;

	this.game.queue.push("play\t1");

	let new_round = 1;
        for (let i = 0; i < this.game.players.length; i++) {
	  if (this.game.players[i].passed == 0) { new_round = 0; }
        }

	//
	// NEW TURN
	//
	if (new_round == 1) {
	  this.game.queue.push("newround");
	}

	this.updateLeaderboard();

      }

      if (mv[0] === "newround") {

	this.game.queue.push("resolve\tnewround");

	this.game.state.round++;

	this.updateLog("ROUND: " + this.game.state.round);
	this.updateStatus("Moving into Round " + this.game.state.round);

	//
	// SCORING
	//
        if (this.game.state.round_scoring == 0 && this.game.state.round > 1) {
          //imperium_self.addMove("strategy\t"+"empire"+"\t"+"-1"+"\t2\t"+this.game.players.length);
          this.game.queue.push("strategy\t"+"empire"+"\t"+"-1"+"\t2\t"+1);
	  this.game.state.round_scoring = 0;
	} else {
	  this.game.state.round_scoring = 0;
	}

	//
	// RESET USER ACCOUNTS
	//
        for (let i = 0; i < this.game.players.length; i++) {
	  this.game.players[i].passed = 0;
        }

	//
	// REPAIR UNITS
	//
	this.repairUnits();

	//
	// STRATEGY CARDS
	//
        this.game.queue.push("playerschoosestrategycards");
	if (this.game.players.length == 3 || this.game.players.length == 4) {
          this.game.queue.push("playerschoosestrategycards");
	}
	if (this.game.players.length == 2) {
          this.game.queue.push("playerschoosestrategycards");
	}

	//
	// mark as ready 
	//	  
	if (this.game.initializing == 1) {
          this.game.queue.push("EMAIL\tready");
	}

	//
	// FLIP NEW AGENDA CARDS
	//
        this.game.queue.push("revealagendas");
	for (let i = 1; i <= this.game.players.length; i++) {
          this.game.queue.push("FLIPCARD\t3\t3\t1\t"+i); // deck card poolnum player
	}
	return 1;

      }

      if (mv[0] === "revealagendas") {

	this.updateLog("revealing upcoming agendas...");

	//
	// reset agendas
	//
	this.game.state.agendas = [];
        for (i = 0; i < 3; i++) {
          this.game.state.agendas.push(this.game.pool[0].hand[i]);	
	}

	//
	// reset pool
	//
	this.game.pool = [];


	this.updateAgendaDisplay();
	this.updateLeaderboard();

	this.game.queue.splice(qe, 1);
	return 1;
      }

      if (mv[0] === "invade_planet") {

	let player       = mv[1];
	let player_moves = mv[2];
	let attacker     = mv[3];
	let defender     = mv[4];
        let sector       = mv[5];
        let planet_idx   = mv[6];

	this.updateLog(this.returnFaction(player) + " launches an invasion");

	if (this.game.player != player || player_moves == 1) {
	  this.invadePlanet(attacker, defender, sector, planet_idx);
        }

	//
	// update planet ownership
	//
	this.updatePlanetOwner(sector, planet_idx);

	this.game.queue.splice(qe-1, 2);
	return 1;
      }


      if (mv[0] === "score") {

	let player       = parseInt(mv[1]);
	let vp 		 = parseInt(mv[2]);
	let objective    = mv[3];

	this.updateLog(this.returnFaction(player)+" scores "+vp+" VP");
	this.game.players[player-1].vp += vp;

	this.game.queue.splice(qe-1, 2);
	return 1;
      }


      if (mv[0] === "playerschoosestrategycards") {

	this.updateLog("Players selecting strategy cards, starting from " + this.returnSpeaker());
	this.updateStatus("Players selecting strategy cards, starting from " + this.returnSpeaker());

	//
	// all strategy cards on table again
	//
	this.game.state.strategy_cards = [];
	let x = this.returnStrategyCards();

	for (let z in x) {
  	  if (!this.game.state.strategy_cards.includes(z)) {
	    this.game.state.strategy_cards.push(z);
	    this.game.state.strategy_cards_bonus.push(0);
          }
	}

	if (this.game.player == this.game.state.speaker) {

	  this.addMove("resolve\tplayerschoosestrategycards");
	  this.addMove("addbonustounselectedstrategycards");

          for (let i = 0; i < this.game.players.length; i++) {
	    let this_player = this.game.state.speaker+i;
	    if (this_player > this.game.players.length) { this_player -= this.game.players.length; }
	    this.rmoves.push("pickstrategy\t"+this_player);
          }

	  this.endTurn();
	}
	return 0;
      }

      if (mv[0] === "addbonustounselectedstrategycards") {

	for (let i = 0; i < this.game.state.strategy_cards.length; i++) {
	  this.game.state.strategy_cards_bonus[i] += 1;
	}

        this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "pickstrategy") {

	let player       = parseInt(mv[1]);

	if (this.game.player == player) {

	  this.playerSelectStrategyCards(function(card) {
	    imperium_self.addMove("resolve\tpickstrategy");
	    imperium_self.addMove("purchase\t"+imperium_self.game.player+"\tstrategycard\t"+card);
	    imperium_self.endTurn();
	  });
	  return 0;
	}
	return 0;
      }

      if (mv[0] === "land") {

	let player       = mv[1];
	let player_moves = mv[2];
        let sector       = mv[3];
        let source       = mv[4];   // planet ship
        let source_idx   = mv[5];   // planet_idx or ship_idx
        let planet_idx   = mv[6];
        let unitjson     = mv[7];

        let sys = this.returnSystemAndPlanets(sector);

	if (this.game.player != player || player_moves == 1) {
          if (source == "planet") {
            this.unloadUnitByJSONFromPlanet(player, sector, source_idx, unitjson);
            this.loadUnitByJSONOntoPlanet(player, sector, planet_idx, unitjson);
          } else {
            if (source == "ship") {
              this.unloadUnitByJSONFromShip(player, sector, source_idx, unitjson);
              this.loadUnitByJSONOntoPlanet(player, sector, planet_idx, unitjson);
            } else {
              //this.loadUnitByJSONOntoShipByJSON(player, sector, shipjson, unitjson);
            }
          }
        }

        this.saveSystemAndPlanets(sys);
        this.updateSectorGraphics(sector);
        this.game.queue.splice(qe, 1);
        return 1;

      }

      if (mv[0] === "load") {

	let player       = mv[1];
	let player_moves = mv[2];
        let sector       = mv[3];
        let source       = mv[4];   // planet ship
        let source_idx   = mv[5];   // planet_idx or ship_idx
        let unitjson     = mv[6];
        let shipjson     = mv[7];

        let sys = this.returnSystemAndPlanets(sector);

	if (this.game.player != player || player_moves == 1) {
          if (source == "planet") {
            this.unloadUnitByJSONFromPlanet(player, sector, source_idx, unitjson);
            this.loadUnitByJSONOntoShipByJSON(player, sector, shipjson, unitjson);
          } else {
            if (source == "space") {
              //this.unloadUnitByJSONFromShip(player, sector, ship_idx, unitjson);
              //this.loadUnitByJSONOntoShipByJSON(player, sector, shipjson, unitjson);
            } else {
              //this.loadUnitByJSONOntoShipByJSON(player, sector, shipjson, unitjson);
            }
          }
        }

        this.saveSystemAndPlanets(sys);
        this.updateSectorGraphics(sector);
        this.game.queue.splice(qe, 1);
        return 1;

      }
      if (mv[0] === "notify") {

	this.updateLog(mv[1]);
	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "pds_space_defense") {

	let player       = mv[1];
        let sector       = mv[2];

	this.pdsSpaceDefense(player, sector);
	this.updateSectorGraphics(sector);
	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "expend") {

	let player       = parseInt(mv[1]);
        let type         = mv[2];
        let details      = mv[3];

        if (type == "command") {
	  this.game.players[player-1].command_tokens -= parseInt(details);
	}
        if (type == "strategy") {
	  this.game.players[player-1].strategy_tokens -= parseInt(details);
	}
        if (type == "planet") {
	  this.game.planets[details].exhausted = 1;
	}

	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "unexhaust") {

	let player       = parseInt(mv[1]);
        let type	 = mv[2];
        let name	 = mv[3];

	if (type == "planet") { this.exhaustPlanet(name); }

	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "trade") {

	let player       = parseInt(mv[1]);
	let recipient    = parseInt(mv[2]);
        let offer	 = mv[3];
	let amount	 = mv[4];

	if (offer == "goods") {
	  amount = parseInt(amount);
	  if (this.game.players[player-1].goods >= amount) {
	    this.game.players[player-1].goods -= amount;
	    this.game.players[recipient-1].goods += amount;
	  }
	}

	if (offer == "commodities") {
	  amount = parseInt(amount);
	  if (this.game.players[player-1].commodities >= amount) {
	    this.game.players[player-1].commodities -= amount;
	    this.game.players[recipient-1].goods += amount;
	  }
	}

	this.game.queue.splice(qe, 1);
	return 1;
	
      }
      if (mv[0] === "activate") {

	let player       = parseInt(mv[1]);
        let sector	 = mv[2];

        sys = this.returnSystemAndPlanets(sector);
	sys.s.activated[player-1] = 1;
	this.saveSystemAndPlanets(sys);
        this.updateSectorGraphics(sector);
	this.game.queue.splice(qe, 1);
	return 1;
	
      }
      if (mv[0] === "deactivate") {

	let player       = parseInt(mv[1]);
        let sector	 = mv[2];

        sys = this.returnSystemAndPlanets(sector);
	sys.s.activated[player-1] = 0;
        this.updateSectorGraphics(sector);
	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "purchase") {

	let player       = parseInt(mv[1]);
        let item         = mv[2];
        let amount       = parseInt(mv[3]);

        if (item == "strategycard") {
	  this.game.players[player-1].strategy.push(mv[3]);
	  for (let i = 0; i < this.game.state.strategy_cards.length; i++) {
	    if (this.game.state.strategy_cards[i] === mv[3]) {
	      this.game.players[player-1].goods += this.game.state.strategy_cards_bonus[i];
	      this.game.state.strategy_cards.splice(i, 1);
	      this.game.state.strategy_cards_bonus.splice(i, 1);
	      i = this.game.state.strategy_cards.length+2;
	    }
	  }
	}
        if (item == "tech") {
	  this.game.players[player-1].tech.push(mv[3]);
	}
        if (item == "goods") {
	  this.game.players[player-1].goods += amount;
	}
        if (item == "commodities") {
	  this.game.players[player-1].commodities += amount;
	}
        if (item == "command") {
	  this.game.players[player-1].command_tokens += amount;
	}
        if (item == "strategy") {
	  this.game.players[player-1].strategy_tokens += amount;
	}
        if (item == "fleetsupply") {
	  this.game.players[player-1].fleet_supply += amount;
	}

	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "pass") {

	let player       = parseInt(mv[1]);
	this.game.players[player-1].passed = 1;
	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "move") {

	let player       = mv[1];
        let player_moves = parseInt(mv[2]);
        let sector_from  = mv[3];
        let sector_to    = mv[4];
        let shipjson     = mv[5];

	//
	// move any ships
	//
	if (this.game.player != player || player_moves == 1) {
	  this.removeSpaceUnitByJSON(player, sector_from, shipjson);
          this.addSpaceUnitByJSON(player, sector_to, shipjson);
	}

	//
	// handle any conflict
	//
	this.invadeSector(player, sector_to);

	this.updateSectorGraphics(sector_from);
	this.updateSectorGraphics(sector_to);

	this.game.queue.splice(qe, 1);
	return 1;

      }
      if (mv[0] === "produce") {

	let player       = mv[1];
        let player_moves = parseInt(mv[2]);
        let planet_idx   = parseInt(mv[3]); // planet to build on
        let unitname     = mv[4];
        let sector       = mv[5];

	if (planet_idx != -1) {
          this.addPlanetaryUnit(player, sector, planet_idx, unitname);
	} else {
          this.addSpaceUnit(player, sector, unitname);
        }

	//
	// monitor fleet supply
	//
        console.log("Fleet Supply issues getting managed here....");

	//
	// update sector
	//
	this.updateSectorGraphics(sector);

	let sys = this.returnSystemAndPlanets(sector);

	this.game.queue.splice(qe, 1);
	return 1;

      }

      if (mv[0] === "continue") {

	let player = mv[1];
	let sector = mv[2];

	//
	// check to see if any ships survived....
	//
        let html  = this.returnFaction(player) + ": <p></p><ul>";
	if (this.canPlayerInvadePlanet(player, sector)) {
            html += '<li class="option" id="invade">invade planet</li>';
	}
            html += '<li class="option" id="action">action card</li>';
            html += '<li class="option" id="endturn">end turn</li>';
	    html += '</ul>';
 


	this.updateStatus(html);
	$('.option').on('click', function() {
          let action2 = $(this).attr("id");

          if (action2 == "endturn") {
            imperium_self.addMove("resolve\tplay");
            imperium_self.endTurn();
          }

          if (action2 == "invade") {
            imperium_self.playerInvadePlanet(player, sector);
          }

        });

	this.game.queue.splice(qe, 1);
	return 0;

      }
      if (mv[0] === "play") {

	let player = mv[1];
        if (player == this.game.player) {
	  this.tracker = this.returnPlayerTurnTracker();
	  this.addMove("resolve\tplay");
	  this.playerTurn();
        } else {
	  this.updateLog(this.returnFaction(parseInt(player)) + " is taking their turn");
	  this.updateStatus(this.returnFaction(parseInt(player)) + " is taking their turn");
	}

	return 0;
      }

      if (mv[0] === "strategy") {

	let card = mv[1];
	let player = mv[2];
	let stage = mv[3];

	if (stage == 1) {
	  this.playStrategyCardPrimary(player, card);
	}
	if (stage == 2) {
	  this.playStrategyCardSecondary(player, card);
	}

	return 0;
      }

      //
      // avoid infinite loops
      //
      if (shd_continue == 0) {
        return 0;
      }

  }

  return 1;

}



Imperium.prototype.playerTurn = function playerTurn(stage="main") {

  let html = '';
  let imperium_self = this;

  if (stage == "main") {

    let html  = '[command: '+this.game.players[this.game.player-1].command_tokens+'] [strategy: '+this.game.players[this.game.player-1].strategy_tokens+']';
        html  += '<p></p>';
        html  += this.returnFaction(this.game.player) + ": <p></p><ul>";
    if (this.game.players[this.game.player-1].command_tokens > 0) {
      html += '<li class="option" id="activate">activate system</li>';
    }
// HACK
    if (this.game.players[this.game.player-1].command_tokens > 0) {
      html += '<li class="option" id="select_strategy_card">select strategy card</li>';
    }
    if (this.tracker.action_card == 0) {
      html += '<li class="option" id="action">action card</li>';
    }
    if (this.tracker.trade == 0) {
      html += '<li class="option" id="trade">trade</li>';
    }

    html += '<li class="option" id="pass">pass</li>';
    html += '</ul>';

    this.updateStatus(html);

    $('.option').on('click', function() {

      let action2 = $(this).attr("id");

      if (action2 == "activate") {
        imperium_self.playerActivateSystem();
      }
      if (action2 == "select_strategy_card") {
        imperium_self.playerSelectStrategyCard(function(success) {
	  imperium_self.addMove("strategy\t"+success+"\t"+imperium_self.game.player+"\t1");
	  imperium_self.endTurn();
        });
      }
      if (action2 == "action") {
        imperium_self.playerSelectActionCard(function(success) {
	  imperium_self.addMove("action\t"+success+"\t"+imperium_self.game.player);
	  imperium_self.endTurn();
        });
      }
      if (action2 == "trade") {
        imperium_self.playerTrade(function() {
	  imperium_self.endTurn();
        });
      }
      if (action2 == "pass") {
        imperium_self.addMove("pass\t"+imperium_self.game.player);
        imperium_self.endTurn();
      }
    });
  }
}




////////////////
// Production //
////////////////
Imperium.prototype.playerBuyTokens = function playerBuyTokens() {

  let imperium_self = this;

  if (this.playerAvailableInfluence() <= 2) {
    this.updateStatus("Skipping purchase of tokens as insufficient influence...");
    this.endTurn();
    return;
  }

  let html = 'Do you wish to purchase any command or strategy tokens? <p></p><ul>';
  html += '<li class="buildchoice" id="command">Command Tokens (<span class="command_total">0</span>)</li>';
  html += '<li class="buildchoice" id="strategy">Strategy Tokens (<span class="strategy_total">0</span>)</li>';
  html += '</ul>';
  html += '<p></p>';
  html += '<div id="buildcost" class="buildcost"><span class="buildcost_total">0</span> influence</div>';
  html += '<div id="confirm" class="buildchoice">click here to finish</div>';

  this.updateStatus(html);

  let command_tokens = 0;
  let strategy_tokens = 0;
  let total_cost = 0;

  $('.buildchoice').off();
  $('.buildchoice').on('click', function() {

    let id = $(this).attr("id");

    if (id == "confirm") {

      total_cost = 3 * (command_tokens + strategy_tokens);
      imperium_self.playerSelectInfluence(total_cost, function(success) {

	if (success == 1) {
          imperium_self.addMove("purchase\t"+imperium_self.game.player+"\tcommand\t"+command_tokens);
          imperium_self.addMove("purchase\t"+imperium_self.game.player+"\tcommand\t"+strategy_tokens);
          imperium_self.endTurn();
          return;
	} else {
	  alert("failure to find appropriate influence");
	}
      });
    };

    //
    //  figure out if we need to load infantry / fighters
    //
    if (id == "command") 	{ command_tokens++; }
    if (id == "strategy")	{ strategy_tokens++; }

    let divtotal = "." + id + "_total";
    let x = parseInt($(divtotal).html());
    x++;
    $(divtotal).html(x);



    let resourcetxt = " resources";
    total_cost = 3 * (command_tokens + strategy_tokens);
    if (total_cost == 1) { resourcetxt = " resource"; }
    $('.buildcost_total').html(total_cost + resourcetxt);

  });


}



Imperium.prototype.playerBuyActionCards = function playerBuyActionCards() {

  let imperium_self = this;

  let html = 'Do you wish to spend 1 strategy token to purchase 2 action cards? <p></p><ul>';
  html += '<li class="buildchoice" id="yes">Purchase Action Cards</li>';
  html += '<li class="buildchoice" id="no">Do Not Purchase Action Cards</li>';
  html += '</ul>';
  html += '<p></p>';
  html += '<div id="confirm" class="buildchoice">click here to finish</div>';

  this.updateStatus(html);

  $('.buildchoice').off();
  $('.buildchoice').on('click', function() {

    let id = $(this).attr("id");

    if (id == "yes") {

      imperium_self.addMove("DEAL\t2\t"+this.game.player+"\t2");
      imperium_self.addMove("expend\t"+imperium_self.game.player+"\tstrategy\t1");
      imperium_self.endTurn();
      return;

    } else {

      imperium_self.endTurn();
      return;

    }
  });

}



Imperium.prototype.canPlayerResearchTechnology = function canPlayerResearchTechnology(tech) {

  let mytech = this.game.players[this.game.player-1].tech;
  if (mytech.includes(tech)) { return 0; }

  let prereqs = JSON.parse(JSON.stringify(this.game.tech[tech].prereqs));

  for (let i = 0; i < mytech.length; i++) {
    let color = mytech[i].color;
    for (let j = 0; j < prereqs.length; j++) {
      if (prereqs[j] == color) {
        prereqs.splice(j, 1);
	j = prereqs.length;
      }
    }
  }

  if (prereqs.length == 0) {
    return 1;
  }

  return 0;

}
Imperium.prototype.playerResearchTechnology = function playerResearchTechnology(mycallback) {

  let html = 'You are eligible to upgrade to the following technologies: <p></p><ul>';

  for (var i in this.game.tech) {  
    if (this.canPlayerResearchTechnology(i)) {
      html += '<li class="option" id="'+i+'">'+this.game.tech[i].name+'</li>';
    }
  }
  html += '</ul>';

  this.updateStatus(html);
  
  $('.option').off();
  $('.option').on('click', function() {
    mycallback($(this).attr("id"));
  });


}


Imperium.prototype.playerScoreVictoryPoints = function playerScoreVictoryPoints(mycallback) {

  let html = 'Do you wish to score any victory points? <p></p><ul>';

  // Stage I Public Objectives
  for (var i in this.game.deck[3].cards) {
    html += '<li class="option" id="'+i+'">'+this.game.deck[3].cards.name+'</li>';
  }

  // Stage II Public Objectives
  for (var i in this.game.deck[4].cards) {
    html += '<li class="option" id="'+i+'">'+this.game.deck[4].cards.name+'</li>';
  }

  // Secret Objectives
  for (var i in this.game.deck[5].cards) {
    html += '<li class="option" id="'+i+'">'+this.game.deck[5].cards.name+'</li>';
  }

  html += '<li class="option" id="no">I choose not to score...</li>';
  html += '</ul>';

  this.updateStatus(html);
  
  $('.option').off();
  $('.option').on('click', function() {

    let action = $(this).attr("id");

    if (action == "no") {

      mycallback(0, "");

    } else {

      let vp = 2;
      let objective = "SECRET OBJECTIVE: mining power";
      mycallback(vp, objective);

    }
  });
}





Imperium.prototype.playerBuildInfrastructure = function playerBuildInfrastructure() { 

  let imperium_self = this;

  let html = 'Which would you like to build: <p></p><ul>';
  html += '<li class="buildchoice" id="pds">Planetary Defense System</li>';
  html += '<li class="buildchoice" id="spacedock">Space Dock</li>';
  html += '</ul>';
  html += '<p></p>';
  html += '<div id="confirm" class="buildchoice">click here to build</div>';

  this.updateStatus(html);

  let stuff_to_build = [];  

  $('.buildchoice').off();
  $('.buildchoice').on('click', function() {

    let id = $(this).attr("id");

    html = "Select a planet on which to build: ";
    imperium_self.updateStatus(html);

    imperium_self.playerSelectPlanet(function(sector, planet_idx) {

      if (id == "pds") {
	imperium_self.addMove("produce\t"+imperium_self.game.player+"\t"+1+"\t"+planet_idx+"\tpds\t"+sector);
	imperium_self.endTurn();
      }
      if (id == "spacedock") {
	imperium_self.addMove("produce\t"+imperium_self.game.player+"\t"+1+"\t"+planet_idx+"\tspacedock\t"+sector);
	imperium_self.endTurn();
      }

    }, 0);  // 0 any planet

  });

}


Imperium.prototype.playerProduceUnits = function playerProduceUnits(sector) { 

  let imperium_self = this;

  let html = 'Produce Units in this Sector: <p></p><ul>';
  html += '<li class="buildchoice" id="infantry">Infantry (<span class="infantry_total">0</span>)</li>';
  html += '<li class="buildchoice" id="fighter">Fighter (<span class="fighter_total">0</span>)</li>';
  html += '<li class="buildchoice" id="destroyer">Destroyer (<span class="destroyer_total">0</span>)</li>';
  html += '<li class="buildchoice" id="carrier">Carrier (<span class="carrier_total">0</span>)</li>';
  html += '<li class="buildchoice" id="cruiser">Cruiser (<span class="cruiser_total">0</span>)</li>';
  html += '<li class="buildchoice" id="dreadnaught">Dreadnaught (<span class="dreadnaught_total">0</span>)</li>';
  html += '<li class="buildchoice" id="flagship">Flagship (<span class="flagship_total">0</span>)</li>';
  html += '<li class="buildchoice" id="warsun">War Sun (<span class="warsun_total">0</span>)</li>';
  html += '</ul>';
  html += '<p></p>';
  html += '<div id="buildcost" class="buildcost"><span class="buildcost_total">0</span> resources</div>';
  html += '<div id="confirm" class="buildchoice">click here to build</div>';

  this.updateStatus(html);

  let stuff_to_build = [];  


  $('.buildchoice').off();
  $('.buildchoice').on('click', function() {

    let id = $(this).attr("id");

    let calculated_total_cost = 0;
    for (let i = 0; i < stuff_to_build.length; i++) {
      calculated_total_cost += imperium_self.returnUnitCost(stuff_to_build[i]);
    }
    calculated_total_cost += imperium_self.returnUnitCost(id);

    if (calculated_total_cost > imperium_self.playerAvailableResources(imperium_self.game.player)) {
      alert("You cannot build more than you have available to pay for it.");
      return;
    }


    //
    // submit when done
    //
    if (id == "confirm") {

      let total_cost = 0;
      for (let i = 0; i < stuff_to_build.length; i++) {
	total_cost += imperium_self.returnUnitCost(stuff_to_build[i]);
      }

      imperium_self.playerSelectResources(total_cost, function(success) {

	if (success == 1) {

          imperium_self.addMove("resolve\tplay");
          imperium_self.addMove("continue\t"+imperium_self.game.player+"\t"+sector);
          for (let y = 0; y < stuff_to_build.length; y++) {
	    let planet_idx = -1;
	    if (stuff_to_build[y] == "infantry") { planet_idx = 0; }
	    imperium_self.addMove("produce\t"+imperium_self.game.player+"\t"+1+"\t"+planet_idx+"\t"+stuff_to_build[y]+"\t"+sector);
          }
          imperium_self.endTurn();
          return;

	} else {

	  alert("failure to find appropriate influence");

	}

      });

    };


    //
    //  figure out if we need to load infantry / fighters
    //
    stuff_to_build.push(id);

    let total_cost = 0;
    for (let i = 0; i < stuff_to_build.length; i++) {
      total_cost += imperium_self.returnUnitCost(stuff_to_build[i]);
    }

    let divtotal = "." + id + "_total";
    let x = parseInt($(divtotal).html());
    x++;
    $(divtotal).html(x);



    let resourcetxt = " resources";
    if (total_cost == 1) { resourcetxt = " resource"; }
    $('.buildcost_total').html(total_cost + resourcetxt);

  });

}


Imperium.prototype.playerTrade = function playerTrade(mycallback) {

  let imperium_self = this;
  let factions = this.returnFactions();

  let html = 'Initiate Trade Offer with Faction: <p></p><ul>';
  for (let i = 0; i < this.game.players.length; i++) {
    html += `  <li class="option" id="${i}">${factions[this.game.players[i].faction].name}</li>`;
  }
  html += '</ul>';

  this.updateStatus(html);

  $('.option').off();
  $('.option').on('click', function() {

    let faction = $(this).attr("id");
    let commodities_selected = 0;
    let goods_selected = 0;

    let html = "Extend Trade Mission: <p></p><ul>";
    html += '<li id="commodities" class="option"><span class="commodities_total">0</span> commodities</li>';
    html += '<li id="goods" class="option"><span class="goods_total">0</span> goods</li>';
    html += '<li id="confirm" class="option">CLICK HERE TO SEND TRADE MISSION</li>';
    html += '</ul>';

    imperium_self.updateStatus(html);

    $('.option').off();
    $('.option').on('click', function() {

      let selected = $(this).attr("id");

      if (selected == "commodities") { commodities_selected++; }
      if (selected == "goods") { goods_selected++; }
      if (selected == "confirm") {
	if (commodities_selected >= 1) {
	  imperium_self.addMove("trade\t"+imperium_self.game.player+"\t"+(faction+1)+"commodities"+"\t"+commodities_selected);
	}
	if (goods_selected >= 1) {
	  imperium_self.addMove("trade\t"+imperium_self.game.player+"\t"+(faction+1)+"goods"+"\t"+goods_selected);
	}
      }

      if (commodities_selected > imperium_self.game.players[imperium_self.game.player-1].commodities) {
	commodities_selected = imperium_self.game.players[imperium_self.game.player-1].commodities;
      }
      if (goods_selected > imperium_self.game.players[imperium_self.game.player-1].goods) {
	goods_selected = imperium_self.game.players[imperium_self.game.player-1].goods;
      }

      $('.commodities_total').html(commodities_selected);
      $('.goods_total').html(goods_selected);

    });
  });
}




Imperium.prototype.playerSelectSector = function playerSelectSector(mycallback, mode=0) { 

  //
  // mode
  //
  // 0 = any sector
  // 1 = activated actor
  //

  let imperium_self = this;

  $('.sector').on('click', function() {
    let pid = $(this).attr("id");
    mycallback(pid);
  });

}



Imperium.prototype.playerSelectPlanet = function playerSelectPlanet(mycallback, mode=0) { 

  //
  // mode
  //
  // 0 = in any sector
  // 1 = in unactivated actor
  //

  let imperium_self = this;

  let html  = "Select a system in which to select a planet: ";
  this.updateStatus(html);

  $('.sector').on('click', function() {

    let pid = $(this).attr("id");
    let sys = imperium_self.returnSystemAndPlanets(pid);

    html = 'Select a planet in this system: <p></p><ul>';
    for (let i = 0; i < sys.p.length; i++) {
      html += '<li class="option" id="' + i + '">' + sys.p[i].name + ' (<span class="invadeplanet_'+i+'">0</span>)</li>';
    }
    html += '</ul>';

    imperium_self.updateStatus(html);

    $('.option').off();
    $('.option').on('click', function() {
      mycallback(pid, $(this).attr("id"));
    });

  });

}



Imperium.prototype.playerAvailableResources = function playerAvailableResources(player) {

  let array_of_cards = this.returnPlayerUnexhaustedPlanetCards(player); // unexhausted
  let total_available_resources = 0;
  for (let z = 0; z < array_of_cards.length; z++) {
    total_available_resources += this.game.planets[array_of_cards[z]].resources;
  }
  total_available_resources += this.game.players[player-1].goods;
  return total_available_resources;

}
Imperium.prototype.playerAvailableInfluence = function playerAvailableInfluence(player) {

  let array_of_cards = this.returnPlayerUnexhaustedPlanetCards(player); // unexhausted
  let total_available_influence = 0;
  for (let z = 0; z < array_of_cards.length; z++) {
    total_available_influence += this.game.planets[array_of_cards[z]].influence;
  }
  total_available_influence += this.game.players[player-1].goods;
  return total_available_influence;

}

Imperium.prototype.playerSelectResources = function playerSelectResources(cost, mycallback) {

  if (cost == 0) { mycallback(1); }

  let imperium_self = this;
  let array_of_cards = this.returnPlayerUnexhaustedPlanetCards(this.game.player); // unexhausted
  let array_of_cards_to_exhaust = [];
  let selected_cost = 0;

  let html  = "Select "+cost+" in resources: <p></p><ul>";
  for (let z = 0; z < array_of_cards.length; z++) {
    html += '<li class="cardchoice" id="cardchoice_'+array_of_cards[z]+'">' + this.returnPlanetCard(array_of_cards[z]) + '</li>';
  }
  html += '</ul>';

  this.updateStatus(html);
  $('.cardchoice').on('click', function() {

    let action2 = $(this).attr("id");
    let tmpx = action2.split("_");
    
    let divid = "#"+action2;
    let y = tmpx[1];
    let idx = 0;
    for (let i = 0; i < array_of_cards.length; i++) {
      if (array_of_cards[i] === y) {
        idx = i;
      } 
    }


    imperium_self.addMove("expend\t"+imperium_self.game.player+"\tplanet\t"+array_of_cards[idx]);

    array_of_cards_to_exhaust.push(array_of_cards[idx]);

    $(divid).off();
    $(divid).css('opacity','0.3');

    selected_cost += imperium_self.game.planets[array_of_cards[idx]].resources;

    if (cost <= selected_cost) { mycallback(1); }

  });

}

Imperium.prototype.playerSelectInfluence = function playerSelectInfluence(cost, mycallback) {

  if (cost == 0) { mycallback(1); }

  let imperium_self = this;
  let array_of_cards = this.returnPlayerUnexhaustedPlanetCards(this.game.player); // unexhausted
  let array_of_cards_to_exhaust = [];
  let selected_cost = 0;

  let html  = "Select "+cost+" in influence: <p></p><ul>";
  for (let z = 0; z < array_of_cards.length; z++) {
    html += '<li class="cardchoice" id="cardchoice_'+array_of_cards[z]+'">' + this.returnPlanetCard(array_of_cards[z]) + '</li>';
  }
  html += '</ul>';

  this.updateStatus(html);
  $('.cardchoice').on('click', function() {

    let action2 = $(this).attr("id");
    let tmpx = action2.split("_");
    
    let divid = "#"+action2;
    let y = tmpx[1];
    let idx = 0;
    for (let i = 0; i < array_of_cards.length; i++) {
      if (array_of_cards[i] === y) {
        idx = i;
      } 
    }

    imperium_self.addMove("expend\t"+imperium_self.game.player+"\tplanet\t"+array_of_cards[idx]);

    array_of_cards_to_exhaust.push(array_of_cards[idx]);

    $(divid).off();
    $(divid).css('opacity','0.3');

    selected_cost += imperium_self.game.planets[array_of_cards[idx]].resources;

    if (cost <= selected_cost) { mycallback(1); }

  });

}


Imperium.prototype.playerSelectActionCard = function playerSelectActionCard(mycallback) {

  let array_of_cards = this.returnPlayerActionCards(this.game.player);

  let html = this.returnFaction(this.game.player) + ": select your strategy card: <p></p><ul>";
  for (let z in array_of_cards) {
    html += '<li class="cardchoice" id="'+z+'">' + this.returnActionCard(z) + '</li>';
  }
  html += '</ul>';

  this.updateStatus(html);
  $('.cardchoice').on('click', function() {
    let action2 = $(this).attr("id");
    mycallback(action2);
  });

}


//
// this is when players are choosing to play the cards that they have 
// already chosen.
//
Imperium.prototype.playerSelectStrategyCard = function playerSelectStrategyCard(mycallback) {

  let array_of_cards = this.game.players[this.game.player-1].strategy;

  let html = "<ul>";
  for (let z in array_of_cards) {
    html += '<li class="cardchoice" id="'+array_of_cards[z]+'">' + this.returnStrategyCard(array_of_cards[z]) + '</li>';
  }
  html += '</ul>';

  this.updateStatus(html);
  $('.cardchoice').on('click', function() {
    let action2 = $(this).attr("id");
    mycallback(action2);
  });

}


//
// this is when players select at the begining of the round, not when they 
// are chosing to play the cards that they have already selected
//
Imperium.prototype.playerSelectStrategyCards = function playerSelectStrategyCards(mycallback) {

  let html  = "Select strategy card: <p></p><ul>";
  for (let z = 0; z < this.game.state.strategy_cards.length; z++) {
    html += '<li class="cardchoice" id="'+this.game.state.strategy_cards[z]+'">' + this.returnStrategyCard(this.game.state.strategy_cards[z]) + '</li>';
  }
  html += '</ul>';

  this.updateStatus(html);
  $('.cardchoice').on('click', function() {
    let action2 = $(this).attr("id");
    mycallback(action2);
  });

}




//////////////////////////
// Select Units to Move //
//////////////////////////
Imperium.prototype.playerSelectUnitsToMove = function playerSelectUnitsToMove(destination) {

  let imperium_self = this;
  let html = '';
  let hops = 3;
  let sectors = [];
  let distance = [];

  let x = this.returnSectorsWithinHopDistance(destination, hops);
  sectors = x.sectors; distance = x.distance;
  ships_and_sectors = this.returnShipsMovableToDestinationFromSectors(destination, sectors, distance);

console.log(JSON.stringify(ships_and_sectors));


  //
  // highlight ships
  //
  for (let i = 0; i < ships_and_sectors.length; i++) {
console.log("LOOPING AT: " + ships_and_sectors[i].sector);
    let sys = this.returnSystemAndPlanets(ships_and_sectors[i].sector);
    html += '<b style="margin-top:10px">'+sys.s.name+'</b>';
    html += '<ul>';
    for (let ii = 0; ii < ships_and_sectors[i].ships.length; ii++) {
      html += '<li id="sector_'+i+'_'+ii+'" class="shipchoice">'+ships_and_sectors[i].ships[ii].name+'</li>';
    }
    html += '</ul>';
  }
  html += '<p></p>';
  html += '<div id="confirm" class="shipchoice">click here to move</div>';

  this.updateStatus(html);

  let stuff_to_move = [];  
  let stuff_to_load = [];  

  $('.shipchoice').off();
  $('.shipchoice').on('click', function() {

    let id = $(this).attr("id");

    //
    // submit when done
    //
    if (id == "confirm") {
      imperium_self.addMove("resolve\tplay");
      imperium_self.addMove("continue\t"+imperium_self.game.player+"\t"+destination);
      imperium_self.addMove("pds_space_defense\t"+imperium_self.game.player+"\t"+destination);
      for (let y = 0; y < stuff_to_move.length; y++) { imperium_self.addMove("move\t"+imperium_self.game.player+"\t"+1+"\t"+ships_and_sectors[stuff_to_move[y].i].sector+"\t"+destination+"\t"+JSON.stringify(ships_and_sectors[stuff_to_move[y].i].ships[stuff_to_move[y].ii])); }
      for (let y = stuff_to_load.length-1; y >= 0; y--) { imperium_self.addMove("load\t"+imperium_self.game.player+"\t"+0+"\t"+stuff_to_load[y].sector+"\t"+stuff_to_load[y].source+"\t"+stuff_to_load[y].source_idx+"\t"+stuff_to_load[y].unitjson+"\t"+stuff_to_load[y].shipjson); }
      imperium_self.endTurn();
      return;
    };


    //
    // highlight ship on menu
    //
    $(this).css("font-weight", "bold");

    //
    //  figure out if we need to load infantry / fighters
    //
    let tmpx = id.split("_");
    let i  = tmpx[1]; 
    let ii = tmpx[2];
    let sector = ships_and_sectors[i].sector;
    let sys = imperium_self.returnSystemAndPlanets(sector);
    let ship = ships_and_sectors[i].ships[ii];
    let total_ship_capacity = imperium_self.returnRemainingCapacity(ship);
    let x = { i : i , ii : ii , sector : sector };

    stuff_to_move.push(x);


    if (total_ship_capacity > 0) {
      let remove_what_capacity = 0;
      for (let z = 0; z < stuff_to_load.length; z++) {
	let x = stuff_to_load[z];
	if (x.i == i && x.ii == ii) {
	  let thisunit = JSON.parse(stuff_to_load[z].unitjson);
	  remove_what_capacity += thisunit.capacity_required;
	  //total_ship_capacity -= thisunit.capacity_required;
	}
      }

      let user_message = `<div id="menu-container">This ship has <span class="capacity_remaining">${total_ship_capacity}</span> capacity to carry fighters / infantry. Do you wish to add them? <p></p><ul>`;

      for (let i = 0; i < sys.p.length; i++) {
        let planetary_units = sys.p[i].units[imperium_self.game.player-1];
        let infantry_available_to_move = 0;
        for (let k = 0; k < planetary_units.length; k++) {
          if (planetary_units[k].name == "infantry") {
            infantry_available_to_move++;
          }
        }
        if (infantry_available_to_move > 0) {
          user_message += '<li class="card" id="addinfantry_p_'+i+'">add infantry from '+sys.p[i].name+' (<span class="add_infantry_remaining_'+i+'">'+infantry_available_to_move+'</span>)</li>';
        }
      }

      let fighters_available_to_move = 0;
      for (let i = 0; i < sys.s.units[imperium_self.game.player-1].length; i++) {
        if (sys.s.units[imperium_self.game.player-1][i].name == "fighter") {
	  fighters_available_to_move++;
        }
      }
      user_message += '<li class="card" id="addfighter_s_s">add fighter (<span class="add_fighters_remaining">'+fighters_available_to_move+'</span>)</li>';
      user_message += '<li class="card" id="skip">skip</li>';
      user_message += '</ul></div>';

      //
      // choice
      //
      $('.hud_menu_overlay').html(user_message);
      $('.status').hide();
      $('.hud_menu_overlay').show();

      // leave action enabled on other panels
      $('.card').on('click', function() {

        let id = $(this).attr("id");
        let tmpx = id.split("_");
        let action2 = tmpx[0];


	if (total_ship_capacity > 0) {

        if (action2 === "addinfantry") {

          let planet_idx = tmpx[2];
  	  let irdiv = '.add_infantry_remaining_'+planet_idx;
          let ir = parseInt($(irdiv).html());
          let ic = parseInt($('.capacity_remaining').html());

	  //
	  // we have to load prematurely. so JSON will be accurate when we move the ship, so player_move is 0 for load
	  //
	  let unitjson = imperium_self.unloadUnitFromPlanet(imperium_self.game.player, sector, planet_idx, "infantry");

          imperium_self.loadUnitByJSONOntoShip(imperium_self.game.player, sector, ships_and_sectors[i].ship_idxs[ii], unitjson);
	  
	  $(irdiv).html((ir-1));
	  $('.capacity_remaining').html((ic-1));

	  let loading = {};
	      loading.sector = sector;
	      loading.source = "planet";
	      loading.source_idx = planet_idx;
	      loading.unitjson = unitjson;
	      loading.ship_idx = ships_and_sectors[i].ship_idxs[ii];
	      loading.shipjson = JSON.stringify(sys.s.units[imperium_self.game.player-1][ships_and_sectors[i].ship_idxs[ii]]);;
	      loading.i = i;
	      loading.ii = ii;

	  total_ship_capacity--;

	  stuff_to_load.push(loading);
	  if (ic === 1 && total_ship_capacity == 0) {
            $('.status').show();
            $('.hud_menu_overlay').hide();
	  }

        }


        if (action2 === "addfighter") {

          let ir = parseInt($('.add_fighters_remaining').html());
          let ic = parseInt($('.capacity_remaining').html());
  	  $('.add_fighters_remaining').html((ir-1));
	  $('.capacity_remaining').html((ic-1));

	  let unitjson = imperium_self.removeSpaceUnit(imperium_self.game.player, sector, "fighter");

          imperium_self.loadUnitByJSONOntoShip(imperium_self.game.player, sector, ships_and_sectors[i].ship_idxs[ii], unitjson);

	  let loading = {};
  	  stuff_to_load.push(loading);

	      loading.sector = sector;
	      loading.source = "ship";
	      loading.source_idx = "";
	      loading.unitjson = unitjson;
	      loading.ship_idx = ships_and_sectors[i].ship_idxs[ii];
	      loading.shipjson = JSON.stringify(sys.s.units[imperium_self.game.player-1][ships_and_sectors[i].ship_idxs[ii]]);;
	      loading.i = i;
	      loading.ii = ii;

	  total_ship_capacity--;

	  if (ic == 1 && total_ship_capacity == 0) {
            $('.status').show();
            $('.hud_menu_overlay').hide();
          }
        }


	} // total ship capacity

        if (action2 === "skip") {
          $('.hud_menu_overlay').hide();
          $('.status').show();
        }
      });
    }
  });

}



Imperium.prototype.playerInvadePlanet = function playerInvadePlanet(player, sector) {

  let imperium_self = this;
  let sys = this.returnSystemAndPlanets(sector);

  let total_available_infantry = 0;
  let space_transport_available = 0;
  let space_transport_used = 0;

  let landing_forces = [];

  html = 'Which planet(s) do you wish to invade: <p></p><ul>';
  for (let i = 0; i < sys.p.length; i++) {
    if (sys.p[i].owner != player) {
      html += '<li class="option" id="' + i + '">' + sys.p[i].name + ' (<span class="invadeplanet_'+i+'">0</span>)</li>'; 
    }
  }
  html += '<li class="option" id="confirm">click here to confirm</li>'; 
  html += '</ul>';
  this.updateStatus(html);

  let populated_planet_forces = 0;
  let populated_ship_forces = 0;
  let forces_on_planets = [];
  let forces_on_ships = [];

  $('.option').off();
  $('.option').on('click', function () {

    let planet_idx = $(this).attr('id');

    if (planet_idx == "confirm") {
      alert("invasion is ready...");
      imperium_self.endTurn();
      return;
    }

    imperium_self.addMove("invade_planet\t"+imperium_self.game.player+"\t"+1+"\t"+imperium_self.game.player+"\t"+sys.p[planet_idx].owner+"\t"+sector+"\t"+planet_idx);

    //
    // figure out available infantry and ships capacity
    //
    for (let i = 0; i < sys.s.units[player - 1].length; i++) {
      let unit = sys.s.units[player-1][i];
      for (let k = 0; k < unit.storage.length; k++) {
	if (unit.storage[k].name == "infantry") {
          if (populated_ship_forces == 0) {
            total_available_infantry += 1;
	  }
	}
      }
      if (sys.s.units[player - 1][i].capacity > 0) {
        if (populated_ship_forces == 0) {
          space_transport_available += sys.s.units[player - 1][i].capacity;
        }
      }
    }

    html = 'Select Ground Forces for Invasion of '+sys.p[planet_idx].name+': <p></p><ul>';

    //
    // other planets in system
    //
    for (let i = 0; i < sys.p.length; i++) {
      forces_on_planets.push(0);
      if (space_transport_available > 0 && sys.p[i].units[player - 1].length > 0) {
        for (let j = 0; j < sys.p[i].units[player - 1].length; j++) {
          if (sys.p[i].units[player - 1][j].name == "infantry") {
            if (populated_planet_forces == 0) {
              forces_on_planets[i]++;;
	    }
          }
        }
        html += '<li class="invadechoice" id="invasion_planet_'+i+'">'+sys.p[i].name+' (<span class="planet_'+i+'_infantry">'+forces_on_planets[i]+'</span>)</li>';
      }
    }
    populated_planet_forces = 1;



    //
    // ships in system
    //
    for (let i = 0; i < sys.s.units[player-1].length; i++) {
      let ship = sys.s.units[player-1][i];
      forces_on_ships.push(0);
      for (let j = 0; j < ship.storage.length; j++) {
	if (ship.storage[j].name === "infantry") {
          if (populated_ship_forces == 0) {
            forces_on_ships[i]++;
	  } else {

	    // need to subtract forces removed from ship

	  }
	}
      }
      html += '<li class="invadechoice" id="invasion_ship_'+i+'">'+ship.name+' (<span class="ship_'+i+'_infantry">'+forces_on_ships[i]+'</span>)</li>';
    }
    populated_ship_forces = 1;
    html += '<li class="invadechoice" id="finished_0_0">finish selecting</li>';
    html += '</ul>';


    //
    // choice
    //
    $('.hud_menu_overlay').html(html);
    $('.status').hide();
    $('.hud_menu_overlay').show();


    $('.invadechoice').off();
    $('.invadechoice').on('click', function() {

      let id = $(this).attr("id");
      let tmpx = id.split("_");

      let action2 = tmpx[0];
      let source = tmpx[1];
      let source_idx = tmpx[2];
      let counter_div = "." + source + "_"+source_idx+"_infantry";
      let counter = parseInt($(counter_div).html());

      if (action2 == "invasion") {

        if (source == "planet") {
  	  if (space_transport_available <= 0) { alert("Invalid Choice! No space transport available!"); return; }
	  forces_on_planets[source_idx]--;
        } else {
	  forces_on_ships[source_idx]--;
        }
        if (counter == 0) { 
 	  alert("You cannot attack with forces you do not have available."); return;
        }

	let unitjson = JSON.stringify(imperium_self.returnUnit("infantry"));

        let landing = {};
            landing.sector = sector;
            landing.source = source;
            landing.source_idx = source_idx;
            landing.planet_idx = planet_idx;
            landing.unitjson = unitjson;

        landing_forces.push(landing);

        let planet_counter = ".invadeplanet_"+planet_idx;
        let planet_forces = parseInt($(planet_counter).html());

        planet_forces++;
        $(planet_counter).html(planet_forces);

        counter--;
        $(counter_div).html(counter);

      }

      if (action2 === "finished") {

        //
        // submit when done
        //
        for (let y = 0; y < landing_forces.length; y++) { 
	  imperium_self.addMove("land\t"+imperium_self.game.player+"\t"+1+"\t"+landing_forces[y].sector+"\t"+landing_forces[y].source+"\t"+landing_forces[y].source_idx+"\t"+landing_forces[y].planet_idx+"\t"+landing_forces[y].unitjson);
        };

        $('.status').show();
        $('.hud_menu_overlay').hide();

        return;
      }
    });
  });
}


Imperium.prototype.canPlayerActivateSystem = function canPlayerActivateSystem(pid) {

  let imperium_self = this;
  let sys = imperium_self.returnSystemAndPlanets(pid);
  if (sys.s.activated[imperium_self.game.player-1] == 1) { return 0; }
  return 1;

}
Imperium.prototype.playerActivateSystem = function playerActivateSystem() {

  let imperium_self = this;
  let html  = "Select a sector to activate: ";

  imperium_self.updateStatus(html);

  $('.sector').off();
  $('.sector').on('click', function() {

    let pid = $(this).attr("id");

    if (imperium_self.canPlayerActivateSystem(pid) == 0) {

      alert("You cannot activate that system: " + pid);

    } else {

      let sys = imperium_self.returnSystemAndPlanets(pid);
      let divpid = '#'+pid;

      $(divpid).find('.hex_activated').css('background-color', 'yellow');
      $(divpid).find('.hex_activated').css('opacity', '0.3');

  //    let c = confirm("Activate this system?");
  //    if (c) {
        sys.s.activated[imperium_self.game.player-1] = 1;
        imperium_self.addMove("resolve\tplay");
        imperium_self.addMove("activate\t"+imperium_self.game.player+"\t"+pid);
        imperium_self.addMove("expend\t"+imperium_self.game.player+"\t"+"command"+"\t"+1);
        imperium_self.playerPostActivateSystem(pid);
  //    }
    }

  });
}


Imperium.prototype.playerPostActivateSystem = function playerPostActivateSystem(sector) {

  let imperium_self = this;

  //
  // move
  // space
  // ground
  // produce
  //
  let html  = this.returnFaction(this.game.player) + ": <p></p><ul>";
      html += '<li class="option" id="move">move into sector</li>';
  if (this.canPlayerProduceInSector(this.game.player, sector)) {
      html += '<li class="option" id="produce">produce units</li>';
  }
      html += '<li class="option" id="finish">finish turn</li>';
      html += '</ul>';

  imperium_self.updateStatus(html);

  $('.option').on('click', function() {

    let action2 = $(this).attr("id");

    if (action2 == "move") {
      imperium_self.playerSelectUnitsToMove(sector);
    }
    if (action2 == "produce") {
      imperium_self.playerProduceUnits(sector);
    }
    if (action2 == "finish") {
      imperium_self.addMove("resolve\tplay");
      imperium_self.endTurn();
    }
  });
}






/////////////////////////
// Add Events to Board //
/////////////////////////
Imperium.prototype.addEventsToBoard = function addEventsToBoard() {

  let imperium_self = this;
  let pid  = "";

  $('.sector').off();
  $('.sector').on('mouseenter', function() {
    pid = $(this).attr("id");
    imperium_self.showSector(pid);
  }).on('mouseleave', function() {
    pid = $(this).attr("id");
    imperium_self.hideSector(pid);
  });

}




Imperium.prototype.exhaustPlanet = function exhaustPlanet(pid) {
  this.game.planets[pid].exhausted = 1;
}
Imperium.prototype.unexhaustPlanet = function unexhaustPlanet(pid) {
  this.game.planets[pid].exhausted = 0;
}

Imperium.prototype.updatePlanetOwner = function updatePlanetOwner(sector, planet_idx) {
  let sys = this.returnSystemAndPlanets(sector);
  let owner = -1;
  for (let i = 0; i < sys.p[planet_idx].units.length; i++) {
    if (sys.p[planet_idx].units[i].length > 0) { owner = i+1; }
  }
  if (owner != -1) {
    sys.p[planet_idx].owner = owner;
    sys.p[planet_idx].exhausted = 1;
  }
  this.saveSystemAndPlanets(sys);
}




///////////////////////
// Display Gameboard //
///////////////////////
Imperium.prototype.showSector = function showSector(pid) {

  let hex_space = "#hex_space_"+pid;
  let hex_ground = "#hex_ground_"+pid;

  $(hex_space).fadeOut();
  $(hex_ground).fadeIn();

}
Imperium.prototype.hideSector = function hideSector(pid) {

  let hex_space = "#hex_space_"+pid;
  let hex_ground = "#hex_ground_"+pid;

  $(hex_ground).fadeOut();
  $(hex_space).fadeIn();

}












Imperium.prototype.addPlanetaryUnit = function addPlanetaryUnit(player, sector, planet_idx, unitname) {
  return this.loadUnitOntoPlanet(player, sector, planet_idx, unitname);
};

Imperium.prototype.addPlanetaryUnitByJSON = function addSpaceUnitByJSON(player, sector, planet_idx, unitjson) {
  return this.loadUnitByJSONOntoPlanet(player, sector, planet_idx, unitname);
};
Imperium.prototype.addSpaceUnit = function addSpaceUnit(player, sector, unitname) {
  let sys = this.returnSystemAndPlanets(sector);
  let unit_to_add = this.returnUnit(unitname);
  sys.s.units[player - 1].push(unit_to_add);
  this.saveSystemAndPlanets(sys);
  return JSON.stringify(unit_to_add);
};

Imperium.prototype.addSpaceUnitByJSON = function addSpaceUnitByJSON(player, sector, unitjson) {
  let sys = this.returnSystemAndPlanets(sector);
  sys.s.units[player - 1].push(JSON.parse(unitjson));
  this.saveSystemAndPlanets(sys);
  return unitjson;
};

Imperium.prototype.removeSpaceUnit = function removeSpaceUnit(player, sector, unitname) {
  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.s.units[player - 1].length; i++) {
    if (sys.s.units[player - 1][i].name === unitname) {
      let removedunit = sys.s.units[player - 1].splice(i, 1);
      this.saveSystemAndPlanets(sys);
      return JSON.stringify(removedunit[0]);
      ;
    }
  }
};



Imperium.prototype.removeSpaceUnitByJSON = function removeSpaceUnitByJSON(player, sector, unitjson) {
  let sys = this.returnSystemAndPlanets(sector);
  for (let i = 0; i < sys.s.units[player - 1].length; i++) {
    if (JSON.stringify(sys.s.units[player - 1][i]) === unitjson) {
      sys.s.units[player - 1].splice(i, 1);
      this.saveSystemAndPlanets(sys);
      return unitjson;
    }
  }
};



Imperium.prototype.loadUnitOntoPlanet = function loadUnitOntoPlanet(player, sector, planet_idx, unitname) {
  let sys = this.returnSystemAndPlanets(sector);
  let unit_to_add = this.returnUnit(unitname);
  sys.p[planet_idx].units[player - 1].push(unit_to_add);
  this.saveSystemAndPlanets(sys);
  return JSON.stringify(unit_to_add);
};
Imperium.prototype.loadUnitByJSONOntoPlanet = function loadUnitByJSONOntoPlanet(player, sector, planet_idx, unitjson) {
console.log("LOAD UNIT BY JSON Onto Planet in Sector: " + sector);
  let sys = this.returnSystemAndPlanets(sector);
console.log("LOAD UNIT BY JSON Onto Planet " + planet_idx);
  sys.p[planet_idx].units[player - 1].push(JSON.parse(unitjson));
  this.saveSystemAndPlanets(sys);
  return unitjson;
};







Imperium.prototype.loadUnitOntoShip = function loadUnitOntoShip(player, sector, ship_idx, unitname) {
  let sys = this.returnSystemAndPlanets(sector);
  let unit_to_add = this.returnUnit(unitname);
  sys.s.units[player - 1][ship_idx].storage.push(unit_to_add);
  this.saveSystemAndPlanets(sys);
  return JSON.stringify(unit_to_add);
};
Imperium.prototype.loadUnitByJSONOntoShip = function loadUnitByJSONOntoShip(player, sector, ship_idx, unitjson) {
  let sys = this.returnSystemAndPlanets(sector);
  sys.s.units[player - 1][ship_idx].storage.push(JSON.parse(unitjson));
  this.saveSystemAndPlanets(sys);
  return unitjson;
};

Imperium.prototype.loadUnitOntoShipByJSON = function loadUnitOntoShipByJSON(player, sector, shipjson, unitname) {
  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.s.units[player - 1].length; i++) {
    if (JSON.stringify(sys.s.units[player - 1][i]) === shipjson) {
      let unit_to_add = this.returnUnit(unitname);
      sys.s.units[player - 1][i].storage.push(unit_to_add);
      this.saveSystemAndPlanets(sys);
      return JSON.stringify(unit_to_add);
    }
  }

  return "";
};


Imperium.prototype.loadUnitByJSONOntoShipByJSON = function loadUnitByJSONOntoShipByJSON(player, sector, shipjson, unitjson) {
  let sys = this.returnSystemAndPlanets(sector);
  for (let i = 0; i < sys.s.units[player - 1].length; i++) {
    if (JSON.stringify(sys.s.units[player - 1][i]) === shipjson) {
      sys.s.units[player - 1][i].storage.push(JSON.parse(unitjson));
      this.saveSystemAndPlanets(sys);
      return unitjson;
    }
  }
  return "";
};

Imperium.prototype.unloadUnitFromShip = function loadUnitFromShip(player, sector, ship_idx, unitname) {
  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.s.units[player - 1][ship_idx].storage.length; i++) {
    if (sys.s.units[player - 1][ship_idx].storage[i].name === unitname) {
      let unit_to_remove = sys.s.units[player - 1][ship_idx].storage[i];
      sys.s.units[player-1][ship_idx].storage.splice(i, 1);
      this.saveSystemAndPlanets(sys);
      return JSON.stringify(unit_to_remove);
    }
  }

  return "";
};

Imperium.prototype.unloadUnitFromPlanet = function loadUnitFromPlanet(player, sector, planet_idx, unitname) {
  let sys = this.returnSystemAndPlanets(sector);
  for (let i = 0; i < sys.p[planet_idx].units[player - 1].length; i++) {
    if (sys.p[planet_idx].units[player - 1][i].name === unitname) {
      let unit_to_remove = sys.p[planet_idx].units[player - 1][i];
      sys.p[planet_idx].units[player-1].splice(i, 1);
      this.saveSystemAndPlanets(sys);
      return JSON.stringify(unit_to_remove);
    }
  }
  return "";
};
Imperium.prototype.unloadUnitByJSONFromPlanet = function unloadUnitByJSONFromPlanet(player, sector, planet_idx, unitjson) {
  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.p[planet_idx].units[player-1].length; i++) {
    if (JSON.stringify(sys.p[planet_idx].units[player - 1][i]) === unitjson) {
      let unit_to_remove = sys.p[planet_idx].units[player - 1][i];
      sys.p[planet_idx].units[player-1].splice(i, 1);
      this.saveSystemAndPlanets(sys);
      return JSON.stringify(unit_to_remove);
    }
  }
  return "";
};

Imperium.prototype.unloadUnitByJSONFromShip = function unloadUnitByJSONFromShip(player, sector, ship_idx, unitjson) {
  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.s.units[player - 1][ship_idx].storage.length; i++) {
    if (JSON.stringify(sys.s.units[player - 1][ship_idx].storage[i]) === unitjson) {
      sys.s.units[player-1][ship_idx].storage.splice(i, 1);
      this.saveSystemAndPlanets(sys);
      return unitjson;
    }
  }

  return "";
};

Imperium.prototype.unloadUnitFromShipByJSON = function unloadUnitFromShipByJSON(player, sector, shipjson, unitname) {
  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.s.units[player - 1].length; i++) {
    if (JSON.stringify(sys.s.units[player - 1][i]) === shipjson) {
      for (let j = 0; j < sys.s.units[player - 1][i].storage.length; j++) {
        if (sys.s.units[player - 1][i].storage[j].name === unitname) {
          sys.s.units[player-1][i].storage.splice(j, 1);
          this.saveSystemAndPlanets(sys);
          return unitjson;
        }
      }
    }
  }

  return "";
};

Imperium.prototype.unloadUnitByJSONFromShipByJSON = function unloadUnitByJSONFromShipByJSON(player, sector, shipjson, unitjson) {
  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.s.units[player - 1].length; i++) {
    if (JSON.stringify(sys.s.units[player - 1][i]) === shipjson) {
      for (let j = 0; j < sys.s.units[player - 1][i].storage.length; j++) {
        if (JSON.stringify(sys.s.units[player - 1][i].storage[j]) === unitjson) {
          sys.s.units[player-1][i].storage.splice(j, 1);
          this.saveSystemAndPlanets(sys);
          return unitjson;
        }
      }
    }
  }

  return "";
};













Imperium.prototype.pdsSpaceDefense = function pdsSpaceDefense(attacker, destination) {

  let sys = this.returnSystemAndPlanets(destination);
  let x = this.returnSectorsWithinHopDistance(destination, 1);
  let sectors = [];
  let distance = [];


  sectors = x.sectors;
  distance = x.distance;

  //
  // get enemy pds units within range
  //
  let battery = this.returnPDSWithinRange(attacker, destination, sectors, distance);
  let hits = 0;

  this.updateLog(battery.length + " pds units open fire...");
  for (let i = 0; i < battery.length; i++) {

    let roll = this.rollDice();
    if (roll >= battery[i].combat) {
this.updateLog("hit...! roll ("+roll+")");
      hits++;
    } else {
this.updateLog("miss... roll ("+roll+")");
    }

  }

  if (hits > 0) {
    this.assignHitsToSpaceFleet(attacker, destination, hits);
    this.eliminateDestroyedUnitsInSector(attacker, destination);
  }


}








Imperium.prototype.invadePlanet = function invadePlanet(attacker, defender, sector, planet_idx) {

  let sys = this.returnSystemAndPlanets(sector);

  attacker_faction = this.returnFaction(attacker);
  defender_faction = this.returnFaction(defender);

  //
  // planetary defense system
  //
  let hits = 0;
  for (let z = 0; z < sys.p[planet_idx].units[defender-1].length; z++) {
    if (sys.p[planet_idx].units[defender-1][z].name == "pds") {
      let roll = this.rollDice(10);
      if (roll >= 6) {
        this.updateLog("PDS fires and hits (roll: "+roll+")");
	hits++;  
      } else {
      }
    }
  }

  //
  // assign hits
  //
  this.assignHitsToGroundForces(attacker, sector, planet_idx, hits);
  this.eliminateDestroyedUnitsOnPlanet(attacker, sector, planet_idx);


  //
  // while the battle rages...
  //
  let attacker_forces = this.returnNumberOfGroundForcesOnPlanet(attacker, sector, planet_idx);
  let defender_forces = this.returnNumberOfGroundForcesOnPlanet(defender, sector, planet_idx);

  while (attacker_forces > 0 && defender_forces > 0) {

    //
    // attacker rolls first
    //
    let attacker_hits = 0;
    let defender_hits = 0;

    for (let z = 0; z < sys.p[planet_idx].units[attacker-1].length; z++) {
      let unit = sys.p[planet_idx].units[attacker-1][z];
      if (unit.name == "infantry") {
        let roll = this.rollDice(10);
        if (roll >= unit.combat) {
          this.updateLog(attacker_faction + " " +unit.name + " hits (roll: "+roll+")");
  	  attacker_hits++;  
        } else {
//          this.updateLog(attacker_faction + " " +unit.name + " misses (roll: "+roll+")");
        }
      }
    }

    for (let z = 0; z < sys.p[planet_idx].units[defender-1].length; z++) {
      let unit = sys.p[planet_idx].units[defender-1][z];
      if (unit.name == "infantry") {
        let roll = this.rollDice(10);
        if (roll >= unit.combat) {
          this.updateLog(defender_faction + " " +unit.name + " hits (roll: "+roll+")");
  	  defender_hits++;  
        } else {
//          this.updateLog(defender_faction + " " +unit.name + " misses (roll: "+roll+")");
        }
      }
    }

    this.assignHitsToGroundForces(attacker, sector, planet_idx, defender_hits);
    this.assignHitsToGroundForces(defender, sector, planet_idx, attacker_hits);

    //
    // attacker strikes defender
    //
    attacker_forces = this.returnNumberOfGroundForcesOnPlanet(attacker, sector, planet_idx);
    defender_forces = this.returnNumberOfGroundForcesOnPlanet(defender, sector, planet_idx);

  }


  //
  // evaluate if planet has changed hands
  //
  if (attacker_forces > defender_forces) {

    //
    // destroy all units belonging to defender (pds, spacedocks)
    //
    sys.p[planet_idx].units[defender-1] = [];

    //
    // notify everyone
    //
    this.updateLog(sys.p[planet_idx].name + " is conquered by " + this.returnFaction(attacker));

    //
    // player gets planet card
    //

    //
    // planet changes ownership
    //
    sys.p[planet_idx].owner = attacker;
    sys.p[planet_idx].exhausted = 1;

  } else {

    //
    // notify everyone
    //
    this.updateLog("Invasion fails!");

  }

  //
  // remove destroyed units
  //
  this.eliminateDestroyedUnitsOnPlanet(attacker, sector, planet_idx);
  this.eliminateDestroyedUnitsOnPlanet(defender, sector, planet_idx);

  //
  // save regardless
  //
  this.saveSystemAndPlanets(sys);

}


Imperium.prototype.invadeSector = function invadeSector(attacker, sector) {

  let sys = this.returnSystemAndPlanets(sector);

  let defender = 0;
  let defender_found = 0;
  for (let i = 0; i < sys.s.units.length; i++) {
    if (attacker != (i+1)) {
      if (sys.s.units[i].length > 0) {
	defender = (i+1);
	defender_found = 1;
      }
    }
  }

  if (defender_found == 0) {
    this.updateLog("fleet moves into sector unopposed...");
    return;
  }


  let attacker_faction = this.returnFaction(attacker);
  let defender_faction = this.returnFaction(defender);


  //
  // while the battle rages...
  //
  let attacker_forces = this.returnNumberOfSpaceFleetInSector(attacker, sector);
  let defender_forces = this.returnNumberOfSpaceFleetInSector(defender, sector);

  while (attacker_forces > 0 && defender_forces > 0) {

    //
    // attacker rolls first
    //
    let attacker_hits = 0;
    let defender_hits = 0;

    for (let z = 0; z < sys.s.units[attacker-1].length; z++) {
      let unit = sys.s.units[attacker-1][z];
      let roll = this.rollDice(10);
      if (roll >= unit.combat) {
        this.updateLog(attacker_faction + " " +unit.name + " hits (roll: "+roll+")");
        attacker_hits++;  
      } else {
//        this.updateLog(attacker_faction + " " +unit.name + " misses (roll: "+roll+")");
      }
    }

    for (let z = 0; z < sys.s.units[defender-1].length; z++) {
      let unit = sys.s.units[defender-1][z];
      let roll = this.rollDice(10);
      if (roll >= unit.combat) {
        this.updateLog(defender_faction + " " +unit.name + " hits (roll: "+roll+")");
        defender_hits++;  
      } else {
//        this.updateLog(defender_faction + " " +unit.name + " misses (roll: "+roll+")");
      }
    }

    this.assignHitsToSpaceFleet(attacker, sector, defender_hits);
    this.assignHitsToSpaceFleet(defender, sector, attacker_hits);

    //
    // attacker strikes defender
    //
    attacker_forces = this.returnNumberOfSpaceFleetInSector(attacker, sector);
    defender_forces = this.returnNumberOfSpaceFleetInSector(defender, sector);

  }

  //
  // evaluate if sector has changed hands
  //
  if (attacker_forces > defender_forces) {

    //
    // destroy all floating units belonging to defender (pds, spacedocks)
    //

    //
    // notify everyone
    //
    this.updateLog(sys.s.name + " is now controlled by "+ this.returnFaction(attacker));

  } else {

    //
    // notify everyone
    //
    this.updateLog("Invasion fails!");

  }

  //
  // remove destroyed units
  //
  this.eliminateDestroyedUnitsInSector(attacker, sector);
  this.eliminateDestroyedUnitsInSector(defender, sector);

  //
  // save regardless
  //
  this.saveSystemAndPlanets(sys);

}


Imperium.prototype.isPlanetExhausted = function isPlanetExhausted(planetname) {
  if (this.game.planets[planetname].exhausted == 1) { return 1; }
  return 0;
}


Imperium.prototype.canPlayerProduceInSector = function canPlayerProduceInSector(player, sector) {

  let sys = this.returnSystemAndPlanets(sector);

  for (let i = 0; i < sys.p.length; i++) {
    for (let k = 0; k < sys.p[i].units[player-1].length; k++) {
      if (sys.p[i].units[player-1][k].name == "spacedock") {
        return 1;
      }
    }
  }

  return 0;
}

Imperium.prototype.canPlayerInvadePlanet = function canPlayerInvadePlanet(player, sector) {

  let sys = this.returnSystemAndPlanets(sector);
  let space_transport_available = 0;
  let planets_ripe_for_plucking = 0;
  let total_available_infantry = 0;
  let can_invade = 0;

  //
  // any planets available to invade?
  //
  for (let i = 0; i < sys.p.length; i++) {
    if (sys.p[i].owner != player) { planets_ripe_for_plucking = 1; }
  }
  if (planets_ripe_for_plucking == 0) { return 0; }


  //
  // do we have any infantry for an invasion
  //
  for (let i = 0; i < sys.s.units[player-1].length; i++) {
    let unit = sys.s.units[player-1][i];
    for (let k = 0; k < unit.storage.length; k++) {
      if (unit.storage[k].name == "infantry") {
        total_available_infantry += 1;
      }
    }
    if (unit.capacity > 0) { space_tranport_available = 1; }
  }

  //
  // return yes if troops in space
  //
  if (total_available_infantry > 0) {
    return 1;
  }

  //
  // otherwise see if we can transfer over from another planet in the sector
  //
  if (space_transport_available == 1) {
    for (let i = 0; i < sys.p.length; i++) {
      for (let k = 0; k < sys.p[i].units[player-1].length; k++) {
        if (sys.p[i].units[player-1][k].name == "infantry") { return 1; }
      }
    }
  }

  //
  // sad!
  //
  return 0;
}



Imperium.prototype.eliminateDestroyedUnitsInSector = function eliminateDestroyedUnitsInSector(player, sector) {

  let sys = this.returnSystemAndPlanets(sector);

  //
  // in space
  //
  for (let z = 0; z < sys.s.units[player-1].length; z++) {
    if (sys.s.units[player-1][z].destroyed == 1) {
      sys.s.units[player-1].splice(z, 1);
      z--;
    }
  }

  //
  // on planets
  //
  for (let planet_idx = 0; planet_idx < sys.p.length; planet_idx++) {
    for (let z = 0; z < sys.p[planet_idx].units[player-1].length; z++) {
      if (sys.p[planet_idx].units[player-1][z].destroyed == 1) {
        sys.p[planet_idx].units[player-1].splice(z, 1);
        z--;
      }
    }
  }

  this.saveSystemAndPlanets(sys);

}

Imperium.prototype.eliminateDestroyedUnitsOnPlanet = function eliminateDestroyedUnitsOnPlanet(player, sector, planet_idx) {

  let sys = this.returnSystemAndPlanets(sector);

  for (let z = 0; z < sys.p[planet_idx].units[player-1].length; z++) {
    if (sys.p[planet_idx].units[player-1][z].destroyed == 1) {
this.updateLog(sys.p[planet_idx].units[player-1][z].name + " is destroyed");
      sys.p[planet_idx].units[player-1].splice(z, 1);
      z--;
    }
  }

  this.saveSystemAndPlanets(sys);

}

Imperium.prototype.assignHitsToGroundForces = function assignHitsToGroundForces(defender, sector, planet_idx, hits) {

  let sys = this.returnSystemAndPlanets(sector);
  for (let i = 0; i < hits; i++) {

    //
    // find weakest unit
    //
    let weakest_unit = -1;
    let weakest_unit_idx = -1;
    for (let z = 0; z < sys.p[planet_idx].units[defender-1].length; z++) {
      let unit = sys.p[planet_idx].units[defender-1][z];
      if (unit.strength > 0 && weakest_unit_idx == -1 && unit.destroyed == 0) {
	weakest_unit = sys.p[planet_idx].units[defender-1].strength;
	weakest_unit_idx = z;
      }
      if (unit.strength > 0 && unit.strength < weakest_unit && weakest_unit_idx != -1) {
	weakest_unit = unit.strength;
	weakest_unit_idx = z;
      }
    }

    //
    // and assign 1 hit
    //
    if (weakest_unit_idx != -1) {
      sys.p[planet_idx].units[defender-1][weakest_unit_idx].strength--;
      if (sys.p[planet_idx].units[defender-1][weakest_unit_idx].strength <= 0) {
        sys.p[planet_idx].units[defender-1][weakest_unit_idx].destroyed = 1;
      }
    }
  }

  this.saveSystemAndPlanets(sys);

}

Imperium.prototype.assignHitsToSpaceFleet = function assignHitsToSpaceFleet(defender, sector, hits) {

  let sys = this.returnSystemAndPlanets(sector);
  for (let i = 0; i < hits; i++) {

    //
    // find weakest unit
    //
    let weakest_unit = -1;
    let weakest_unit_idx = -1;
    for (let z = 0; z < sys.s.units[defender-1].length; z++) {
      let unit = sys.s.units[defender-1][z];
      if (unit.strength > 0 && weakest_unit_idx == -1 && unit.destroyed == 0) {
	weakest_unit = sys.s.units[defender-1][z].strength;
	weakest_unit_idx = z;
      }
      if (unit.strength > 0 && unit.strength < weakest_unit && weakest_unit_idx != -1) {
	weakest_unit = unit.strength;
	weakest_unit_idx = z;
      }
    }

    //
    // and assign 1 hit
    //
    if (weakest_unit_idx != -1) {
      sys.s.units[defender-1][weakest_unit_idx].strength--;
      if (sys.s.units[defender-1][weakest_unit_idx].strength <= 0) {
        sys.s.units[defender-1][weakest_unit_idx].destroyed = 1;
      }
    }
  }

  this.saveSystemAndPlanets(sys);

}




Imperium.prototype.returnRemainingCapacity = function returnRemainingCapacity(unit) {
  let capacity = unit.capacity;

  for (let i = 0; i < unit.storage.length; i++) {
    if (unit.storage[i].can_be_stored != 0) {
      capacity -= unit.storage[i].capacity_required;
    }
  }

  if (capacity <= 0) {
    return 0;
  }

  return capacity;
};

Imperium.prototype.returnSectorsWithinHopDistance = function returnSectorsWithHopDistance(destination, hops) {

  let sectors = [];
  let distance = [];
  let s = this.returnSectors();

  sectors.push(destination);
  distance.push(0);

  //
  // find which systems within move distance (hops)
  //
  for (let i = 0; i < hops; i++) {
    let tmp = JSON.parse(JSON.stringify(sectors));
    for (let k = 0; k < tmp.length; k++) {
      let neighbours = s[tmp[k]].neighbours;
      for (let m = 0; m < neighbours.length; m++) {
	if (!sectors.includes(neighbours[m]))  {
	  sectors.push(neighbours[m]);
	  distance.push(i+1);
	}
      }
    }
  }

  return { sectors : sectors , distance : distance };

}

Imperium.prototype.returnPDSWithinRange = function returnPDSWithinRange(attacker, destination, sectors, distance) {

  let battery = [];

  for (let i = 0; i < sectors.length; i++) {

    let sys = this.returnSystemAndPlanets(sectors[i]);

    //
    // some sectors not playable in 3 player game
    //
    if (sys != null) {

      for (let j = 0; j < sys.p.length; j++) {
        for (let k = 0; k < sys.p[j].units.length; k++) {
	  if (k != attacker-1) {
	    for (let z = 0; z < sys.p[j].units[k].length; z++) {
	      if (sys.p[j].units[k][z].name == "pds") {
		if (sys.p[j].units[k][z].range <= distance[i]) {
	          let pds = {};
	              pds.combat = sys.p[j].units[k][z].combat;
		      pds.owner = (k+1);
		      pds.sector = sectors[i];

	          battery.push(pds);
		}
	      }
	    }
	  }
        }
      }
    }
  }

  return battery;

}

Imperium.prototype.returnShipsMovableToDestinationFromSectors = function returnShipsMovableToDestinationFromSectors(destination, sectors, distance) {

  let imperium_self = this;
  let ships_and_sectors = [];
  for (let i = 0; i < sectors.length; i++) {

    let sys = this.returnSystemAndPlanets(sectors[i]);
    

    //
    // some sectors not playable in 3 player game
    //
    if (sys != null) {

      let x = {};
      x.ships = [];
      x.ship_idxs = [];
      x.sector = null;

      //
      // only move from unactivated systems
      //
      if (sys.s.activated[imperium_self.game.player-1] == 0) {

        for (let k = 0; k < sys.s.units[this.game.player-1].length; k++) {
          let this_ship = sys.s.units[this.game.player-1][k];
          if (this_ship.move >= distance[i]) {
            x.ships.push(this_ship);
            x.ship_idxs.push(k);
            x.sector = sectors[i];
          }
        }
        if (x.sector != null) {
          ships_and_sectors.push(x);
        }
      }

    }
  }

  return ships_and_sectors;

}

//////////////////
// Return Board //
//////////////////
Imperium.prototype.returnBoard = function returnBoard() {

  var board = {};

  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      let divname = (i+1) + "_" + (j+1);
      board[divname] = { letter: "_" , fresh : 1 }
    }
  }

  return board;

}


/////////////////
// Return Tile //
/////////////////
Imperium.prototype.returnTile = function returnTile(slot="") {

  let tile = ' \
        <div class="hexIn" id="hexIn_'+slot+'"> \
          <div class="hexLink" id="hexLink_'+slot+'"> \
            <div class="hex_bg" id="hex_bg_'+slot+'"> \
              <img class="hex_img" id="hex_img_'+slot+'" src="" /> \
              <div class="hex_activated" id="hex_activated_'+slot+'"> \
	      </div> \
              <div class="hex_space" id="hex_space_'+slot+'"> \
	      </div> \
              <div class="hex_ground" id="hex_ground_'+slot+'"> \
	      </div> \
            </div> \
          </div> \
        </div> \
  ';
  return tile;
}


////////////////////
// Return Planets //
////////////////////
Imperium.prototype.returnPlanets = function returnPlanets() {

  var planets = {};

  // homeworlds
  planets['planet1']	= { img : "/imperium/images/planet_card_template.png" , name : "Ganesh" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet2']	= { img : "/imperium/images/planet_card_template.png" , name : "Troth" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet3']	= { img : "/imperium/images/planet_card_template.png" , name : "Londrak" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet4']	= { img : "/imperium/images/planet_card_template.png" , name : "Citadel" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet5']	= { img : "/imperium/images/planet_card_template.png" , name : "Belvedere" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet6']	= { img : "/imperium/images/planet_card_template.png" , name : "Shriva" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet7']	= { img : "/imperium/images/planet_card_template.png" , name : "Zondor" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet8']	= { img : "/imperium/images/planet_card_template.png" , name : "Calthrex" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet9']	= { img : "/imperium/images/planet_card_template.png" , name : "Soundra IV" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet10']	= { img : "/imperium/images/planet_card_template.png" , name : "Udon I" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet11']	= { img : "/imperium/images/planet_card_template.png" , name : "Udon II" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet12']	= { img : "/imperium/images/planet_card_template.png" , name : "New Jylanx" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet13']	= { img : "/imperium/images/planet_card_template.png" , name : "Terra Core" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet14']	= { img : "/imperium/images/planet_card_template.png" , name : "Granton Mex" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet15']	= { img : "/imperium/images/planet_card_template.png" , name : "Harkon Caledonia" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet16']	= { img : "/imperium/images/planet_card_template.png" , name : "New Byzantium" , resources : 3 , influence : 2 , bonus : ""  }

  // regular planets
  planets['planet17']	= { img : "/imperium/images/planet_card_template.png" , name : "Lazak's Curse" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet18']	= { img : "/imperium/images/planet_card_template.png" , name : "Voluntra" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet19']	= { img : "/imperium/images/planet_card_template.png" , name : "Xerxes IV" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet20']	= { img : "/imperium/images/planet_card_template.png" , name : "Siren's End" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet21']	= { img : "/imperium/images/planet_card_template.png" , name : "Riftview" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet22']	= { img : "/imperium/images/planet_card_template.png" , name : "Broughton" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet23']	= { img : "/imperium/images/planet_card_template.png" , name : "Fjordra" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet24']	= { img : "/imperium/images/planet_card_template.png" , name : "Nova Klondike" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet25']	= { img : "/imperium/images/planet_card_template.png" , name : "Contouri I" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet26']	= { img : "/imperium/images/planet_card_template.png" , name : "Contouri II" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet27']	= { img : "/imperium/images/planet_card_template.png" , name : "Hoth" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet28']	= { img : "/imperium/images/planet_card_template.png" , name : "Unsulla" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet29']	= { img : "/imperium/images/planet_card_template.png" , name : "Grox Towers" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet30']	= { img : "/imperium/images/planet_card_template.png" , name : "Gravity's Edge" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet31']	= { img : "/imperium/images/planet_card_template.png" , name : "Populax" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet32']	= { img : "/imperium/images/planet_card_template.png" , name : "Old Moltour" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet33']	= { img : "/imperium/images/planet_card_template.png" , name : "New Illia" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet34']	= { img : "/imperium/images/planet_card_template.png" , name : "Outerant" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet35']	= { img : "/imperium/images/planet_card_template.png" , name : "Vespar" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet36']	= { img : "/imperium/images/planet_card_template.png" , name : "Craw Populi" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet37']	= { img : "/imperium/images/planet_card_template.png" , name : "Yssari II" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet38']	= { img : "/imperium/images/planet_card_template.png" , name : "Hope's Lure" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet39']	= { img : "/imperium/images/planet_card_template.png" , name : "Quandam" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet40']	= { img : "/imperium/images/planet_card_template.png" , name : "Quandor" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet41']	= { img : "/imperium/images/planet_card_template.png" , name : "Lorstruck" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet42']	= { img : "/imperium/images/planet_card_template.png" , name : "Industryl" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet43']	= { img : "/imperium/images/planet_card_template.png" , name : "Mechanex" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet44']	= { img : "/imperium/images/planet_card_template.png" , name : "Hearthslough" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet45']	= { img : "/imperium/images/planet_card_template.png" , name : "Incarth" , resources : 3 , influence : 2 , bonus : ""  }
  planets['planet46']	= { img : "/imperium/images/planet_card_template.png" , name : "Aandor" , resources : 3 , influence : 2 , bonus : ""  }

  for (var i in planets) {
    planets[i].exhausted = 0;
    planets[i].owner = -1;
    planets[i].units = [this.totalPlayers]; // array to store units
    for (let j = 0; j < this.totalPlayers; j++) {
      planets[i].units[j] = [];
    }

    planets[i].units[1] = [];
    planets[i].units[1].push(this.returnUnit("infantry"));
    planets[i].units[1].push(this.returnUnit("infantry"));
    planets[i].owner = 2;
  }

  return planets;
}



Imperium.prototype.returnState = function returnState() {

  let state = {};

      state.speaker = 1;
      state.round = 0;
      state.turn = 1;
      state.round_scoring = 0;
      state.events = {};
      state.laws = [];
      state.agendas = [];
      state.strategy_cards = [];
      state.strategy_cards_bonus = [];
    
  return state;
}

////////////////////
// Return Planets //
////////////////////
Imperium.prototype.returnSystems = function returnSystems() {

  var systems = {};

  systems['sector1']         = { img : "/imperium/images/sector1.png" , 	   name : "Sector 1" , hw : 0 , mr : 0 , planets : [] }
  systems['sector2']         = { img : "/imperium/images/sector2.png" , 	   name : "Sector 2" , hw : 0 , mr : 0 , planets : [] }
  systems['sector3']         = { img : "/imperium/images/sector3.png" , 	   name : "Sector 3" , hw : 0 , mr : 0 , planets : [] }
  systems['sector4']         = { img : "/imperium/images/sector4.png" , 	   name : "Sector 4" , hw : 0 , mr : 0 , planets : [] }
  systems['sector5']         = { img : "/imperium/images/sector5.png" , 	   name : "Sector 5" , hw : 0 , mr : 0 , planets : [] }
  systems['sector6']         = { img : "/imperium/images/sector6.png" , 	   name : "Sector 6" , hw : 0 , mr : 0 , planets : [] }
  systems['sector7']         = { img : "/imperium/images/sector7.png" , 	   name : "Sector 7" , hw : 0 , mr : 0 , planets : [] }
  systems['sector8']         = { img : "/imperium/images/sector8.png" , 	   name : "Sector 8" , hw : 0 , mr : 0 , planets : ['planet1','planet2'] }
  systems['sector9']         = { img : "/imperium/images/sector9.png" , 	   name : "Sector 9" , hw : 0 , mr : 0 , planets : ['planet3','planet4'] }
  systems['sector10']        = { img : "/imperium/images/sector10.png" , 	   name : "Sector 10" , hw : 0 , mr : 0 , planets : ['planet5','planet6'] }
  systems['sector11']        = { img : "/imperium/images/sector11.png" , 	   name : "Sector 11" , hw : 0 , mr : 0 , planets : ['planet7','planet8'] }
  systems['sector12']        = { img : "/imperium/images/sector12.png" , 	   name : "Sector 12" , hw : 0 , mr : 0 , planets : ['planet9','planet10'] }
  systems['sector13']        = { img : "/imperium/images/sector13.png" , 	   name : "Sector 13" , hw : 0 , mr : 0 , planets : ['planet11','planet12'] }
  systems['sector14']        = { img : "/imperium/images/sector14.png" , 	   name : "Sector 14" , hw : 0 , mr : 0 , planets : ['planet13','planet14'] }
  systems['sector15']        = { img : "/imperium/images/sector15.png" , 	   name : "Sector 15" , hw : 0 , mr : 0 , planets : ['planet15','planet16'] }
  systems['sector16']        = { img : "/imperium/images/sector16.png" , 	   name : "Sector 16" , hw : 0 , mr : 0 , planets : ['planet17','planet18'] }
  systems['sector17']        = { img : "/imperium/images/sector17.png" , 	   name : "Sector 17" , hw : 0 , mr : 0 , planets : ['planet19','planet20'] }
  systems['sector18']        = { img : "/imperium/images/sector18.png" , 	   name : "Sector 18" , hw : 0 , mr : 0 , planets : ['planet21','planet22'] }
  systems['sector19']        = { img : "/imperium/images/sector19.png" , 	   name : "Sector 19" , hw : 0 , mr : 0 , planets : ['planet23','planet24'] }
  systems['sector20']        = { img : "/imperium/images/sector20.png" , 	   name : "Sector 20" , hw : 0 , mr : 0 , planets : ['planet25','planet26'] }
  systems['sector21']        = { img : "/imperium/images/sector21.png" , 	   name : "Sector 21" , hw : 0 , mr : 0 , planets : ['planet27','planet28'] }
  systems['sector22']        = { img : "/imperium/images/sector22.png" , 	   name : "Sector 22" , hw : 0 , mr : 0 , planets : ['planet29'] }
  systems['sector23']        = { img : "/imperium/images/sector23.png" , 	   name : "Sector 23" , hw : 0 , mr : 0 , planets : ['planet30'] }
  systems['sector24']        = { img : "/imperium/images/sector24.png" , 	   name : "Sector 24" , hw : 0 , mr : 0 , planets : ['planet31'] }
  systems['sector25']        = { img : "/imperium/images/sector25.png" , 	   name : "New Byzantium" , hw : 0 , mr : 1 , planets : ['planet32'] }
  systems['sector26']        = { img : "/imperium/images/sector26.png" , 	   name : "Sector 26" , hw : 0 , mr : 0 , planets : ['planet33'] }
  systems['sector27']        = { img : "/imperium/images/sector27.png" , 	   name : "Sector 27" , hw : 0 , mr : 0 , planets : ['planet34'] }
  systems['sector28']        = { img : "/imperium/images/sector28.png" , 	   name : "Sector 28" , hw : 0 , mr : 0 , planets : ['planet35'] }
  systems['sector29']        = { img : "/imperium/images/sector29.png" , 	   name : "Sector 29" , hw : 0 , mr : 0 , planets : ['planet36'] }
  systems['sector30']        = { img : "/imperium/images/sector30.png" , 	   name : "Sector 30" , hw : 1 , mr : 0 , planets : ['planet37'] }
  systems['sector31']        = { img : "/imperium/images/sector31.png" , 	   name : "Sector 31" , hw : 1 , mr : 0 , planets : ['planet38'] }
  systems['sector32']        = { img : "/imperium/images/sector32.png" , 	   name : "Sector 32" , hw : 0 , mr : 0 , planets : ['planet39'] }
  systems['sector33']        = { img : "/imperium/images/sector33.png" , 	   name : "Sector 33" , hw : 0 , mr : 0 , planets : [] }
  systems['sector34']        = { img : "/imperium/images/sector34.png" , 	   name : "Sector 34" , hw : 0 , mr : 0 , planets : [] }
  systems['sector35']        = { img : "/imperium/images/sector35.png" , 	   name : "Sector 35" , hw : 0 , mr : 0 , planets : [] }
  systems['sector36']        = { img : "/imperium/images/sector36.png" , 	   name : "Sector 36" , hw : 0 , mr : 0 , planets : [] }

  for (var i in systems) {
    systems[i].units = [this.totalPlayers]; // array to store units
    systems[i].activated = [this.totalPlayers]; // array to store units

    for (let j = 0; j < this.totalPlayers; j++) {
      systems[i].units[j] = []; // array of united
      systems[i].activated[j] = 0; // is this activated by the player
    }

    systems[i].units[1] = [];
    //systems[i].units[1].push(this.returnUnit("cruiser"));
    //systems[i].units[1].push(this.returnUnit("cruiser"));

  }
  return systems;
};





Imperium.prototype.returnNumberOfSpaceFleetInSector = function returnNumberOfSpaceFleetInSector(player, sector) {

  let sys = this.returnSystemAndPlanets(sector);
  let num = 0;

  for (let z = 0; z < sys.s.units[player-1].length; z++) {
    if (sys.s.units[player-1][z].strength > 0 && sys.s.units[player-1][z].destroyed == 0) {
      num++;
    }
  }

  return num;
}
Imperium.prototype.returnNumberOfGroundForcesOnPlanet = function returnNumberOfGroundForcesOnPlanet(player, sector, planet_idx) {

  let sys = this.returnSystemAndPlanets(sector);
  let num = 0;

  for (let z = 0; z < sys.p[planet_idx].units[player-1].length; z++) {
    if (sys.p[planet_idx].units[player-1][z].strength > 0 && sys.p[planet_idx].units[player-1][z].destroyed == 0) {
      num++;
    }
  }

  return num;
}
Imperium.prototype.returnSectors = function returnSectors() {
  var slot = {};
  slot['1_1'] = {
    neighbours: ["1_2", "2_1", "2_2"]
  };
  slot['1_2'] = {
    neighbours: ["1_1", "1_3", "2_2", "2_3"]
  };
  slot['1_3'] = {
    neighbours: ["1_2", "1_4", "2_3", "2_4"]
  };
  slot['1_4'] = {
    neighbours: ["1_3", "2_4", "2_5"]
  };
  slot['2_1'] = {
    neighbours: ["1_1", "2_2", "3_1", "3_2"]
  };
  slot['2_2'] = {
    neighbours: ["1_1", "1_2", "2_1", "2_3", "3_2", "3_3"]
  };
  slot['2_3'] = {
    neighbours: ["1_2", "1_3", "2_2", "2_4", "3_3", "3_4"]
  };
  slot['2_4'] = {
    neighbours: ["1_3", "1_4", "2_3", "2_5", "3_4", "3_5"]
  };
  slot['2_5'] = {
    neighbours: ["1_4", "2_4", "3_5", "3_6"]
  };
  slot['3_1'] = {
    neighbours: ["2_1", "3_2", "4_1", "4_2"]
  };
  slot['3_2'] = {
    neighbours: ["2_1", "2_2", "3_1", "3_3", "4_2", "4_3"]
  };
  slot['3_3'] = {
    neighbours: ["2_2", "2_3", "3_2", "3_4", "4_3", "4_4"]
  };
  slot['3_4'] = {
    neighbours: ["2_3", "2_4", "3_3", "3_5", "4_4", "4_5"]
  };
  slot['3_5'] = {
    neighbours: ["2_4", "2_4", "3_4", "3_5", "4_4", "4_5"]
  };
  slot['3_6'] = {
    neighbours: ["2_5", "3_5", "4_5", "4_6"]
  };
  slot['4_1'] = {
    neighbours: ["3_1", "4_2", "5_1"]
  };
  slot['4_2'] = {
    neighbours: ["3_1", "3_2", "4_1", "4_3", "5_1", "5_2"]
  };
  slot['4_3'] = {
    neighbours: ["3_2", "3_3", "4_2", "4_4", "5_2", "5_3"]
  };
  slot['4_4'] = {
    neighbours: ["3_3", "3_4", "4_3", "4_5", "5_3", "5_4"]
  };
  slot['4_5'] = {
    neighbours: ["3_4", "3_4", "4_4", "4_6", "5_4", "5_5"]
  };
  slot['4_6'] = {
    neighbours: ["3_4", "3_4", "4_5", "4_7", "5_5", "5_6"]
  };
  slot['4_7'] = {
    neighbours: ["3_5", "4_6", "5_6"]
  };
  slot['5_1'] = {
    neighbours: ["4_1", "4_2", "5_2", "6_1"]
  };
  slot['5_2'] = {
    neighbours: ["4_2", "4_3", "5_1", "5_3", "6_1", "6_2"]
  };
  slot['5_3'] = {
    neighbours: ["4_2", "3_3", "5_2", "5_4", "6_2", "6_3"]
  };
  slot['5_4'] = {
    neighbours: ["4_3", "3_4", "5_3", "5_5", "6_3", "6_4"]
  };
  slot['5_5'] = {
    neighbours: ["4_4", "3_4", "5_4", "5_6", "6_4", "6_5"]
  };
  slot['5_6'] = {
    neighbours: ["4_5", "4_6", "5_5", "6_5"]
  };
  slot['6_1'] = {
    neighbours: ["5_1", "5_2", "6_2", "7_1"]
  };
  slot['6_2'] = {
    neighbours: ["5_2", "5_3", "6_1", "6_3", "7_1", "7_2"]
  };
  slot['6_3'] = {
    neighbours: ["5_3", "5_4", "6_2", "6_4", "7_2", "7_3"]
  };
  slot['6_4'] = {
    neighbours: ["5_4", "5_5", "6_3", "6_5", "7_3", "7_4"]
  };
  slot['6_5'] = {
    neighbours: ["5_5", "5_6", "6_4", "7_4"]
  };
  slot['7_1'] = {
    neighbours: ["6_1", "6_2", "7_2"]
  };
  slot['7_2'] = {
    neighbours: ["6_2", "6_3", "7_1", "7_3"]
  };
  slot['7_3'] = {
    neighbours: ["6_3", "6_4", "7_2", "7_4"]
  };
  slot['7_4'] = {
    neighbours: ["6_4", "6_5", "7_3"]
  };
  return slot;
}; 



//////////////////////////////
// Return Secret Objectives //
//////////////////////////////
Imperium.prototype.returnSecretObjectives = function returnSecretObjectives() {

  let secret = {};

  secret['1']		= { img : "/imperium/images/card_template.jpg" }
  secret['2']		= { img : "/imperium/images/card_template.jpg" }
  secret['3']		= { img : "/imperium/images/card_template.jpg" }
  secret['4']		= { img : "/imperium/images/card_template.jpg" }
  secret['5']		= { img : "/imperium/images/card_template.jpg" }
  secret['6']		= { img : "/imperium/images/card_template.jpg" }
  secret['7']		= { img : "/imperium/images/card_template.jpg" }
  secret['8']		= { img : "/imperium/images/card_template.jpg" }
  secret['9']		= { img : "/imperium/images/card_template.jpg" }
  secret['10']		= { img : "/imperium/images/card_template.jpg" }
  secret['11']		= { img : "/imperium/images/card_template.jpg" }
  secret['12']		= { img : "/imperium/images/card_template.jpg" }
  secret['13']		= { img : "/imperium/images/card_template.jpg" }
  secret['14']		= { img : "/imperium/images/card_template.jpg" }
  secret['15']		= { img : "/imperium/images/card_template.jpg" }
  secret['16']		= { img : "/imperium/images/card_template.jpg" }
  secret['17']		= { img : "/imperium/images/card_template.jpg" }
  secret['18']		= { img : "/imperium/images/card_template.jpg" }
  secret['19']		= { img : "/imperium/images/card_template.jpg" }
  secret['20']		= { img : "/imperium/images/card_template.jpg" }

  return secret;

}



//////////////////////////////////////
// Return Stage I Public Objectives //
//////////////////////////////////////
Imperium.prototype.returnStageIPublicObjectives = function returnStageIPublicObjectives() {

  let obj = {};

  obj['1']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['2']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['3']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['4']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['5']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['6']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['7']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['8']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['9']		= { img : "/imperium/images/objective_card_1_template.png" }
  obj['10']		= { img : "/imperium/images/objective_card_1_template.png" }

  return obj;

}



///////////////////////////////////////
// Return Stage II Public Objectives //
///////////////////////////////////////
Imperium.prototype.returnStageIIPublicObjectives = function returnStageIIPublicObjectives() {

  let obj = {};

  obj['1']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['2']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['3']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['4']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['5']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['6']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['7']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['8']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['9']		= { img : "/imperium/images/objective_card_2_template.png" }
  obj['10']		= { img : "/imperium/images/objective_card_2_template.png" }

  return obj;

}







////////////////////////////
// Return Technology Tree //
////////////////////////////
Imperium.prototype.returnTechnologyTree = function returnTechnologyTree() {

  let tech = {};

  tech['neural-implants']			= {
    name 	: 	"Neural Implants" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"green" ,
    prereqs	:	[]
  };
  tech['resuscitation-pods']			= {
    name 	: 	"Resuscitation Pods" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"green" ,
    prereqs	:	['green']
  };
  tech['biotic-enhancements']			= {
    name 	: 	"Biotic Enhancements" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"green" ,
    prereqs	:	['green','green']
  };
  tech['viral-plasma']			= {
    name 	: 	"X-91 Viral Plasma" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"green" ,
    prereqs	:	['green','green','green']
  };

  tech['electron-shielding']			= {
    name 	: 	"Electron Shielding" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"blue" ,
    prereqs	:	[]
  };
  tech['slingshot-drive']			= {
    name 	: 	"Slingshot Drive" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"blue" ,
    prereqs	:	['blue']
  };
  tech['fleet-ansible']			= {
    name 	: 	"Fleet Ansible" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"blue" ,
    prereqs	:	['blue','blue']
  };
  tech['stealth-cloaking']			= {
    name 	: 	"Stealth Cloaking" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"blue" ,
    prereqs	:	['blue','blue','blue']
  };

  tech['waste-recycling']			= {
    name 	: 	"Waste Recycling" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"yellow" ,
    prereqs	:	[]
  };
  tech['laser-targeting']			= {
    name 	: 	"Laser Targeting" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"yellow" ,
    prereqs	:	['yellow']
  };
  tech['deep-space-reanimatronics']			= {
    name 	: 	"Deep Space Reanimatronics" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"yellow" ,
    prereqs	:	['yellow','yellow']
  };
  tech['frontline-assembly']			= {
    name 	: 	"Frontline Assembly" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"yellow" ,
    prereqs	:	['yellow','yellow','yellow']
  };

  tech['plasma-clusters']			= {
    name 	: 	"Plasma Clusters" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"red" ,
    prereqs	:	[]
  };
  tech['stasis-fields']			= {
    name 	: 	"Stasis Fields" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"red" ,
    prereqs	:	['red']
  };
  tech['titanium-shielding']			= {
    name 	: 	"Titanium Shielding" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"red" ,
    prereqs	:	['red','red']
  };
  tech['chain-shot']			= {
    name 	: 	"Chain Shot" ,
    img		:	"/imperium/images/card_template.jpg" , 
    color	:	"red" ,
    prereqs	:	['red','red','red']
  };

  tech['fighter-ii']			= {
    name 	: 	"Fighter II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['green','blue']
  };
  tech['infantry-ii']			= {
    name 	: 	"Infantry II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['green','green']
  };
  tech['carrier-ii']			= {
    name 	: 	"Carrier II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['green','green','blue','blue']
  };
  tech['dreadnaught-ii']			= {
    name 	: 	"Dreadnaught II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['blue','blue','yellow']
  };
  tech['cruiser-ii']			= {
    name 	: 	"Cruiser II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['green','yellow','red']
  };
  tech['spacedock-ii']			= {
    name 	: 	"Space Dock II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['yellow','yellow']
  };
  tech['destroyer-ii']			= {
    name 	: 	"Destroyer II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['red','red']
  };
  tech['pds-ii']			= {
    name 	: 	"PDS II" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['yellow','red']
  };
  tech['war-sun']			= {
    name 	: 	"War Sun" ,
    img		:	"/imperium/images/card_template.jpg" , 
    prereqs	:	['yellow','red','red','red']
  };

  return tech;

}

///////////////////////////
// Return Strategy Cards //
///////////////////////////
Imperium.prototype.returnStrategyCards = function returnStrategyCards() {

  let strategy = {};

  strategy['initiative']	= { img : "/imperium/images/card_template.jpg" , name : "Initiative" };
  strategy['negotiation'] 	= { img : "/imperium/images/card_template.jpg" , name : "Negotiation" };
  strategy['politics'] 		= { img : "/imperium/images/card_template.jpg" , name : "Politics" };
  strategy['infrastructure'] 	= { img : "/imperium/images/card_template.jpg" , name : "Infrastructure" };
  strategy['trade'] 	 	= { img : "/imperium/images/card_template.jpg" , name : "Trade Federation" };
  strategy['military'] 	 	= { img : "/imperium/images/card_template.jpg" , name : "Military Council" };
  strategy['tech'] 		= { img : "/imperium/images/card_template.jpg" , name : "Tech Research" };
  strategy['empire'] 	 	= { img : "/imperium/images/card_template.jpg" , name : "Empire" };

  return strategy;

}


/////////////////////////
// Return Action Cards //
/////////////////////////
Imperium.prototype.returnActionCards = function returnActionCards() {

  let action = {};

  action['action1']	= { 
	name : "Diaspora Uprising" ,
	type : "instant" ,
	text : "Gain control of one planet not controlled by any player" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action2']	= { 
	name : "Hydrocannon Cooling" ,
	type : "instant" ,
	text : "Ship gets -2 on combat rolls next round" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action3']	= { 
	name : "Agile Thrusters" ,
	type : "instant" ,
	text : "Attached ship may cancel up to 2 hits by PDS or Ion Cannons" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action4']	= { 
	name : "" ,
	type : "instant" ,
	text : "Exhaust a planet card held by another player. Gain trade goods equal to resource value." ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action5']	= { 
	name : "" ,
	type : "instant" ,
	text : "Cancel 1 yellow technology prerequisite" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action6']	= { 
	name : "" ,
	type : "instant" ,
	text : "Cancel 1 blue technology prerequisite" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action7']	= { 
	name : "" ,
	type : "instant" ,
	text : "Cancel 1 red technology prerequisite" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action8']	= { 
	name : "" ,
	type : "instant" ,
	text : "Cancel 1 green technology prerequisite" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action9']	= { 
	name : "" ,
	type : "instant" ,
	text : "Replace 1 of your Destroyers with a Dreadnaught" ,
	img : "/imperium/images/action_card_template.png" ,
  };
  action['action10']	= { 
	name : "" ,
	type : "instant" ,
	text : "Place 1 Destroyer in a system with no existing ships" ,
	img : "/imperium/images/action_card_template.png" ,
  };

  return action;

}


/////////////////////////
// Return Agenda Cards //
/////////////////////////
Imperium.prototype.returnAgendaCards = function returnAgendaCards() {

  let agenda = {};

  agenda['a1']	= { 
	name : "Unruly Natives" ,
	type : "Law" ,
	text : "All invasions of unoccupied planets require conquering 1 infantry" ,
	img : "/imperium/images/agenda_card_template.png" ,
  };
  agenda['a2']	= { 
	name : "Wormhole Travel Ban" ,
	type : "Law" ,
	text : "All invasions of unoccupied planets require conquering 1 infantry" ,
	img : "/imperium/images/agenda_card_template.png" ,
  };
  agenda['a3']	= { 
	name : "Regulated Bureaucracy" ,
	type : "Law" ,
	text : "Players may have a maximum of 3 action cards in their hands at all times" ,
	img : "/imperium/images/agenda_card_template.png" ,
  };
  agenda['a4']	= { 
	name : "Freedom in Arms Act" ,
	type : "Law" ,
	text : "Players may place any number of PDS units on planets" ,
	img : "/imperium/images/agenda_card_template.png" ,
  };
  agenda['a5']	= { 
	name : "Performance Testing" ,
	type : "Law" ,
	text : "After any player researches a tach, he must destroy a non-fighter ship if possible" ,
	img : "/imperium/images/agenda_card_template.png" ,
  };
  agenda['a6']	= { 
	name : "Fleet Limitations" ,
	type : "Law" ,
	text : "Players may have a maximum of four tokens in their fleet supply." ,
	img : "/imperium/images/agenda_card_template.png" ,
  };
  agenda['a7']	= { 
	name : "Restricted Conscription" ,
	type : "Law" ,
	text : "Production cost for infantry and fighters is 1 rather than 0.5 resources" ,
	img : "/imperium/images/agenda_card_template.png" ,
  };
  agenda['a8']	= { 
	name : "Representative Democracy" ,
	type : "Law" ,
	text : "All players have only 1 vote in each Politics Vote" ,
	img : "/imperium/images/agenda_card_template.png" ,
  };

  return agenda;
}


/////////////////////
// Return Factions //
/////////////////////
Imperium.prototype.returnFaction = function returnFaction(player) {
  let factions = this.returnFactions();
  if (this.game.players[player-1] == null) { return "Unknown"; }
  if (this.game.players[player-1] == undefined) { return "Unknown"; }
  return factions[this.game.players[player-1].faction].name;
}
Imperium.prototype.returnSpeaker = function returnSpeaker() {
  let factions = this.returnFactions();
  return factions[this.game.players[this.game.state.speaker-1].faction].name;
}

Imperium.prototype.returnPlayers = function returnPlayers(num=0) {

  var players = [];
  let factions = this.returnFactions();

  for (let i = 0; i < num; i++) {

    if (i == 0) { col = "color1"; }
    if (i == 1) { col = "color2"; }
    if (i == 2) { col = "color3"; }
    if (i == 3) { col = "color4"; }
    if (i == 4) { col = "color5"; }
    if (i == 5) { col = "color6"; }

    var keys = Object.keys(factions);
    let rf = keys[this.rollDice(keys.length)-1];
    delete factions[rf];

    players[i] = {};
    players[i].command_tokens  	= 3;
    players[i].strategy_tokens 	= 2;
    players[i].fleet_supply    	= 3;
    players[i].faction 		= rf;
    players[i].homeworld	= "";
    players[i].color   		= col;
    players[i].goods		= 0;
    players[i].commodities	= 3;
    players[i].commodity_limit	= 3;

    players[i].vp		= 0;
    players[i].passed		= 0;
    players[i].strategy_cards_played = 0;

    if (i == 1) { players[i].color   = "yellow"; }
    if (i == 2) { players[i].color   = "green"; }
    if (i == 3) { players[i].color   = "blue"; }
    if (i == 4) { players[i].color   = "purple"; }
    if (i == 5) { players[i].color   = "black"; }

    players[i].planets = [];
    players[i].tech = [];
    players[i].upgrades = [];
    players[i].strategy = [];

  }

  return players;

}


///////////////////////
// Return Unit Costs //
///////////////////////
Imperium.prototype.returnUnitCost = function returnUnitCost(name) {

  if (name == "infantry") { return 0.5; }
  if (name == "fighter") { return 0.5; }
  if (name == "destroyer") { return 1; }
  if (name == "cruiser") { return 2; }
  if (name == "carrier") { return 3; }
  if (name == "dreadnaught") { return 4; }
  if (name == "flagship") { return 8; }
  if (name == "warsun") { return 12; }

  return 1;

}



/////////////////////
// Return Factions //
/////////////////////
Imperium.prototype.returnFactions = function returnFactions() {
  var factions = {};
  factions['faction1'] = {
    homeworld: "sector30",
    name: "Faction 1"
  };
  factions['faction2'] = {
    homeworld: "sector31",
    name: "Faction 2"
  };
/**
  factions['faction3'] = {
    homeworld: "sector32",
    name: "Faction 3"
  };
  factions['faction4'] = {
    homeworld: "sector32",
    name: "Faction 4"
  };
  factions['faction5'] = {
    homeworld: "sector32",
    name: "Faction 5"
  };
  factions['faction6'] = {
    homeworld: "sector32",
    name: "Faction 6"
  };
  factions['faction7'] = {
    homeworld: "sector32",
    name: "Faction 7"
  };
  factions['faction8'] = {
    homeworld: "sector32",
    name: "Faction 8"
  };
  factions['faction9'] = {
    homeworld: "sector32",
    name: "Faction 9"
  };
  factions['faction10'] = {
    homeworld: "sector32",
    name: "Faction 10"
  };
  factions['faction11'] = {
    homeworld: "sector32",
    name: "Faction 11"
  };
  factions['faction12'] = {
    homeworld: "sector32",
    name: "Faction 12"
  };
  factions['faction13'] = {
    homeworld: "sector32",
    name: "Faction 13"
  };
  factions['faction14'] = {
    homeworld: "sector32",
    name: "Faction 14"
  };
  factions['faction15'] = {
    homeworld: "sector32",
    name: "Faction 15"
  };
  factions['faction16'] = {
    homeworld: "sector32",
    name: "Faction 16"
  };
  factions['faction17'] = {
    homeworld: "sector32",
    name: "Faction 17"
  };
**/
  return factions;
}; 



///////////////////////////////
// Return Starting Positions //
///////////////////////////////
Imperium.prototype.returnHomeworldSectors = function returnHomeworldSectors(players = 4) {
  if (players <= 2) {
    return ["1_1", "4_7"];
  }

  if (players <= 3) {
    return ["1_1", "4_7", "7_1"];
  }

  if (players <= 4) {
    return ["1_3", "3_1", "5_6", "7_2"];
  }

  if (players <= 5) {
    return ["1_3", "3_1", "4_7", "7_1", "7_4"];
  }

  if (players <= 6) {
    return ["1_1", "1_4", "4_1", "4_7", "7_1", "7_7"];
  }
};


/////////////////////////
// Return Turn Tracker //
/////////////////////////
Imperium.prototype.returnPlayerTurnTracker = function returnPlayerTurnTracker() {
  let tracker = {};
  tracker.activate_system = 0;
  tracker.action_card = 0;
  tracker.production = 0;
  tracker.trade = 0;
  return tracker;
};





Imperium.prototype.repairUnits = function repairUnits() {

  for (let i in this.game.board) {
    let sys = this.returnSystemAndPlanets(i);
    for (let i = 0; i < sys.s.units.length; i++) {
      for (let ii = 0; ii < sys.s.units[i].length; ii++) {
        sys.s.units[i][ii].strength = sys.s.units[i][ii].max_strength;
      }
    }
    for (let i = 0; i < sys.p.length; i++) {
      for (let ii = 0; ii < sys.p[i].units; ii++) {
        for (let iii = 0; iii < sys.p[i].units[ii].length; ii++) {
          sys.p[i].units[ii][iii].strength = sys.p[i].units[ii][iii].max_strength;
        }
      }
    }
    this.saveSystemAndPlanets(sys);
  }

}


//////////////////
// Return Units //
//////////////////
Imperium.prototype.returnUnit = function returnUnit(type = "") {

  let unit = {};

  unit.name = type;

  unit.storage = [];		   // units this unit stores
  unit.capacity = 0;		   // number of units this unit can store
  unit.can_be_stored = 0;	   // can this be stored in other units
  unit.capacity_required = 0;      // how many storage units does it occupy

  unit.max_strength = 0;	   // number of hits can sustain (fully repaired)
  unit.strength = 0;	   	   // number of hits can sustain (dead at zero)
  unit.combat = 10;   	           // number of hits on rolls of N
  unit.destroyed = 0;		   // set to 1 when unit is destroyed in battle

  unit.move = 0;
  unit.range = 1;		   // range for firing (pds)
  unit.production = 0;

  if (type == "spacedock") {
    unit.production = 0;
  }

  if (type == "pds") {
    unit.move = 0;
    unit.capacity = 0;
    unit.combat = 6;
    unit.strength = 1;
  }

  if (type == "carrier") {
    unit.move = 1;
    unit.capacity = 4;
    unit.combat = 9;
    unit.strength = 1;
  }

  if (type == "destroyer") {
    unit.move = 1;
    unit.combat = 9;
    unit.strength = 1;
  }

  if (type == "dreadnaught") {
    unit.move = 1;
    unit.capacity = 1;
    unit.strength = 2;
    unit.combat = 6;
    unit.strength = 2;
  }

  if (type == "cruiser") {
    unit.move = 2;
    unit.combat = 8;
    unit.strength = 1;
  }

  if (type == "flagship") {
    unit.move = 2;
    unit.combat = 8;
    unit.strength = 1;
  }

  if (type == "infantry") {
    unit.can_be_stored = 1;
    unit.capacity_required = 1;
    unit.combat = 8;
    unit.strength = 1;
  }

  if (type == "fighter") {
    unit.can_be_stored = 1;
    unit.capacity_required = 1;
    unit.combat = 9;
    unit.strength = 1;
  }

  return unit;
};



///////////////////////////////
// Return System and Planets //
///////////////////////////////


Imperium.prototype.returnSystemAndPlanets = function returnSystemAndPlanets(pid) {

  if (this.game.board[pid] == null) {
    return;
  }

  if (this.game.board[pid].tile == null) {
    return;
  }

  let sys = this.game.systems[this.game.board[pid].tile];
  let planets = [];

  for (let i = 0; i < sys.planets.length; i++) {
    planets[i] = this.game.planets[sys.planets[i]];
  }

  return {
    s: sys,
    p: planets
  };
}; 


/////////////////////////////
// Save System and Planets //
/////////////////////////////
Imperium.prototype.saveSystemAndPlanets = function saveSystemAndPlanets(sys) {
  for (let key in this.game.systems) {
    if (this.game.systems[key].img == sys.s.img) {
      this.game.systems[key] = sys.s;
      for (let j = 0; j < this.game.systems[key].planets.length; j++) {
        this.game.planets[this.game.systems[key].planets[j]] = sys.p[j];
      }
    }
  }
};


Imperium.prototype.updateAgendaDisplay = function updateAgendaDisplay() {

  $('.agendas').empty();

  for (let i = 0; i < this.game.state.agendas.length; i++) {
    let agendacard = this.returnAgendaCard(this.game.state.agendas[i]);
    $('.agendas').append(agendacard);
  }

}


Imperium.prototype.updateLeaderboard = function updateLeaderboard() {

  let imperium_self = this;
  let factions = this.returnFactions();
  let html = "Round " + this.game.state.round + " (turn " + this.game.state.turn + ")";

      html += '<p></p>';
      html += '<hr />';
      html += '<ul>';

  for (let i = 0; i < this.game.players.length; i++) {
    html += `  <li class="card" id="${i}">${factions[this.game.players[i].faction].name} -- ${this.game.players[i].vp} VP</li>`;
  }

  html += '</ul>';

  $('.leaderboard').html(html);

}


Imperium.prototype.updateSectorGraphics = function updateSectorGraphics(sector) {

  let sys = this.returnSystemAndPlanets(sector);
  
  let updated_space_graphics = 0;
  let updated_ground_graphics = 0;

  for (let z = 0; z < sys.s.units.length; z++) {

    let player = z+1;

    //
    // space
    //
    //if ((sys.s.units[player-1].length > 0 && updated_space_graphics == 0) || (updated_space_graphics == 0 && player == this.totalPlayers-1)) {
    if (sys.s.units[player-1].length > 0 && updated_space_graphics == 0) {

      updated_space_graphics = 1;

      let carriers     = 0;
      let fighters     = 0;
      let destroyers   = 0;
      let cruisers     = 0;
      let dreadnaughts = 0;
      let flagships    = 0;

      for (let i = 0; i < sys.s.units[player-1].length; i++) {

        let ship = sys.s.units[player-1][i];

        if (ship.name == "carrier") { carriers++; }
        if (ship.name == "fighter") { fighters++; }
        if (ship.name == "destroyer") { destroyers++; }
        if (ship.name == "cruiser") { cruisers++; }
        if (ship.name == "dreadnaught") { dreadnaughts++; }
        if (ship.name == "flagship") { flagships++; }

      }

      ////////////////////
      // SPACE GRAPHICS //
      ////////////////////
      html = '<div class="fleet">';

      let fleet_color = "color"+player;
      
      // fighters
      html += '<div class="fighters" alt="'+fighters+'">';
      if (fighters > 0) { html += `<div class="fighter ${fleet_color}">`+fighters+`</div>`; }
      html += '</div>';

      // carriers
      html += '<div class="carriers" alt="'+carriers+'">';
      if (carriers > 0) { html += `<div class="carrier ${fleet_color}">`+carriers+`</div>`; }
      html += '</div>';

      // destroyers
      html += '<div class="destroyers" alt="'+destroyers+'">';
      if (destroyers > 0) { html += `<div class="destroyer ${fleet_color}">`+destroyers+`</div>`; }
      html += '</div>';

      // cruisers
      html += '<div class="cruisers" alt="'+cruisers+'">';
      if (cruisers > 0) { html += `<div class="cruiser ${fleet_color}">`+cruisers+`</div>`; }
      html += '</div>';

      // dreadnaught
      html += '<div class="dreadnaughts" alt="'+dreadnaughts+'">';
      if (dreadnaughts > 0) { html += `<div class="dreadnaught ${fleet_color}">`+dreadnaughts+`</div>`; }
      html += '</div>';

      // flagships
      html += '<div class="flagships" alt="'+flagships+'">';
      if (flagships > 0) { html += `<div class="flagship ${fleet_color}">`+flagships+`</div>`; }
      html += '</div>';

      html += '</div>';

      let divsector = '#hex_space_'+sector;
      $(divsector).html(html);

    }
  }


  html = '';
  for (let z = 0; z < sys.s.units.length; z++) {

    let player = z+1;
    
    ////////////////////////
    // PLANETARY GRAPHICS //
    ////////////////////////

    let total_ground_forces_of_player = 0;
    
    for (let j = 0; j < sys.p.length; j++) {
      total_ground_forces_of_player += sys.p[j].units[z].length;
    }

    if (total_ground_forces_of_player > 0 && updated_ground_graphics == 0 || (updated_ground_graphics == 0 && player == (this.totalPlayers-1))) {
      for (let j = 0; j < sys.p.length; j++) {


	updated_ground_graphics = 1;

        let infantry     = 0;
        let spacedock    = 0;
        let pds          = 0;

        for (let k = 0; k < sys.p[j].units[player-1].length; k++) {

          let unit = sys.p[j].units[player-1][k];

          if (unit.name == "infantry") { infantry++; }
          if (unit.name == "pds") { pds++; }
          if (unit.name == "spacedock") { spacedock++; }

        }

        let pstyle = "top:"+this.scale(sys.p[j].top)+"px;left:"+this.scale(sys.p[j].left)+"px";

        html += '<div class="planet" id="planet_'+j+'" style="'+pstyle+'">';
        html += '<div class="ground_forces">';

        // infantry
        html += '<div class="troops" alt="'+infantry+'">';
        if (infantry > 0) { html += '<div class="infantry">'+infantry+'</div>'; }
        html += '</div>';

        // spacedocks
        html += '<div class="spacedocks" alt="'+spacedock+'">';
        if (spacedock > 0) { html += '<div class="spacedock">'+spacedock+'</div>'; }
        html += '</div>';

        // pds
        html += '<div class="pdsunits" alt="'+pds+'">';
        if (pds > 0) { html += '<div class="pds">'+pds+'</div>'; }

        html += '</div>';
        html += '</div>';
        html += '</div>';

      }
    }
  }

  divsector = '#hex_ground_' + sector;
  $(divsector).html(html);
};
///////////////
// webServer //
///////////////
Imperium.prototype.webServer = function webServer(app, expressapp) {
  expressapp.get('/imperium/', function (req, res) {
    res.sendFile(__dirname + '/web/index.html');
    return;
  });
  expressapp.get('/imperium/style.css', function (req, res) {
    res.sendFile(__dirname + '/web/style.css');
    return;
  });
  expressapp.get('/imperium/script.js', function (req, res) {
    res.sendFile(__dirname + '/web/script.js');
    return;
  });
  expressapp.get('/imperium/images/:imagefile', function (req, res) {
    var imgf = '/web/images/' + req.params.imagefile;

    if (imgf.indexOf("\/") != false) {
      return;
    }

    res.sendFile(__dirname + imgf);
    return;
  });
}; 


///////////////////////
// Imperium Specific //
///////////////////////
Imperium.prototype.addMove = function addMove(mv) {
  this.moves.push(mv);
};

Imperium.prototype.endTurn = function endTurn(nextTarget = 0) {
  for (let i = this.rmoves.length - 1; i >= 0; i--) {
    this.moves.push(this.rmoves[i]);
  }

  this.updateStatus("Waiting for information from peers....");
  let extra = {};
  extra.target = this.returnNextPlayer(this.game.player);

  if (nextTarget != 0) {
    extra.target = nextTarget;
  }

  this.game.turn = this.moves;
  this.moves = [];
  this.rmoves = [];
  this.sendMessage("game", extra);
};

Imperium.prototype.endGame = function endGame(winner, method) {
  this.game.over = 1;

  if (this.active_browser == 1) {
    alert("The Game is Over!");
  }
};



Imperium.prototype.returnPlayerUnexhaustedPlanetCards = function returnPlayerUnexhaustedPlanetCards(player=this.game.player) {
  return this.returnPlayerPlanetCards(player, 1);
}
Imperium.prototype.returnPlayerExhaustedPlanetCards = function returnPlayerExhaustedPlanetCards(player=this.game.player) {
  return this.returnPlayerPlanetCards(player, 2);
}
Imperium.prototype.returnPlayerPlanetCards = function returnPlayerPlanetCards(player=this.game.player, mode=0) {

  let x = [];

  for (var i in this.game.planets) {
    if (this.game.planets[i].owner == player) {

      if (mode == 0) {
        x.push(i);
      }
      if (mode == 1 && this.game.planets[i].exhausted == 0) {
        x.push(i);
      }
      if (mode == 2 && this.game.planets[i].exhausted == 1) {
	x.push(i);
      }
    }
  }

  return x;

}
Imperium.prototype.returnPlayerActionCards = function returnPlayerActionCards(player=this.game.player, mode=0) {

  let x = [];
  //
  // deck 2 -- hand #1
  //
console.log("MY ACTION CARDS: " + JSON.stringify(this.game.deck[1]));
  for (var i in this.game.deck[1].hand) {
    if (mode == 0) {
      x.push(i);
    }
  }

  return x;

}

Imperium.prototype.returnPlanetCard = function returnPlanetCard(planetname="") {

  var c = this.game.planets[planetname];
  if (c == undefined) {

    //
    // this is not a card, it is something like "skip turn" or cancel
    //
    return '<div class="noncard">'+cardname+'</div>';

  }

  var html = `
    <div class="planetcard" style="background-image: url('${c.img}');">
      <div class="planetcard_name">${c.name}</div>
      <div class="planetcard_resources">${c.resources}</div>
      <div class="planetcard_influence">${c.influence}</div>
    </div>
  `;
  return html;

}


Imperium.prototype.returnStrategyCard = function returnStrategyCard(cardname) {

  let cards = this.returnStrategyCards();
  let c = cards[cardname];

  if (c == undefined) {

    //
    // this is not a card, it is something like "skip turn" or cancel
    //
    return '<div class="noncard">'+cardname+'</div>';

  }

  var html = `
    <div class="strategycard" style="background-image: url('${c.img}');">
      <div class="strategycard_name">${c.name}</div>
    </div>
  `;
  return html;

}


Imperium.prototype.returnActionCard = function returnActionCard(cardname) {

  let cards = this.returnActionCards();
  let c = cards[cardname];

  if (c == undefined) {

    //
    // this is not a card, it is something like "skip turn" or cancel
    //
    return '<div class="noncard">'+cardname+'</div>';

  }

  var html = `
    <div class="actioncard" style="background-image: url('${c.img}');">
      <div class="actioncard_name">${c.name}</div>
    </div>
  `;
  return html;

}


Imperium.prototype.returnAgendaCard = function returnAgendaCard(cardname) {

  let cards = this.returnAgendaCards();
  let c = cards[cardname];

  if (c == undefined) {

    //
    // this is not a card, it is something like "skip turn" or cancel
    //
    return '<div class="noncard">'+cardname+'</div>';

  }

  var html = `
    <div class="agendacard" style="background-image: url('${c.img}');">
      <div class="agendacard_name">${c.name}</div>
    </div>
  `;
  return html;

}



Imperium.prototype.playStrategyCardPrimary = function playStrategyCardPrimary(player, card) {

  let imperium_self = this;

  let strategy_cards = this.returnStrategyCards();
  this.updateStatus(this.returnFaction(player) + " is playing the " + strategy_cards[card].name + " strategy card");

  let player_confirmation_needed = this.game.players.length;

  if (card == "initiative") {

    this.game.players[player-1].command_tokens += 2;
    this.game.players[player-1].strategy_tokens += 1;

    if (this.game.player == player) {
      this.addMove("resolve\tstrategy");
      this.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
      this.addMove("notify\t"+player+" gains 2 command and 1 strategy tokens");
      this.endTurn();
    }

  }
  if (card == "negotiation") {

    if (this.game.player == player) {

      this.updateStatus('Select sector to quagmire in diplomatic negotiations: ');
      this.playerSelectSector(function(sector) {
        imperium_self.addMove("resolve\tstrategy");
        imperium_self.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
        for (let i = 0; i < imperium_self.game.players.length; i++) {
          imperium_self.addMove("activate\t"+(i+1)+"\t"+sector);
        }

	//
	// re-activate any planets in that system
	//
 	let sys = imperium_self.returnSystemAndPlanets(sector);
	for (let i = 0; i < sys.p.length; i++) {
	  if (sys.p[i].owner == imperium_self.game.player) {
            imperium_self.addMove("unexhaust\t"+imperium_self.game.player+"\t"+sector);
	  }
	}
	imperium_self.saveSystemAndPlanets(sys);

        imperium_self.endTurn();
      });

    }


  }
  if (card == "politics") {

    //
    // two action cards
    //
    this.addMove("resolve\tstrategy");
    this.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
    this.addMove("DEAL\t2\t"+this.game.player+"\t2");
    this.endTurn();

  }
  if (card == "infrastructure") {

    if (this.game.player == player) {
      this.addMove("resolve\tstrategy");
      this.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
      this.playerBuildInfrastructure();
    }


  }
  if (card == "trade") {

    if (this.game.player == player) {

      this.addMove("resolve\tstrategy");
      this.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
      this.addMove("purchase\t"+this.game.player+"\tgoods\t3");
      this.addMove("purchase\t"+this.game.player+"\tcommodities\t"+this.game.players[this.game.player-1].commodity_limit);

      let factions = this.returnFactions();
      let html = 'Issue commodities to which players: <p></p><ul>';
      for (let i = 0; i < this.game.players.length; i++) {
	if (i != this.game.player-1) {
	  html += '<li class="option" id="'+i+'">' + factions[this.game.players[i].faction].name + '</li>';
        }
      }
      html += '<li class="option" id="finish">finish and end turn</li>';

      this.updateStatus(html);

      $('.option').off();
      $('.option').on('click', function() {
	let id = $(this).attr("id");
	if (id != "finish") {
          imperium_self.addMove("purchase\t"+(id+1)+"\tcommodities\t"+imperium_self.game.players[id].commodity_limit);
	  $(this).hide();
	} else {
          imperium_self.endTurn();
	}
      });

    }
  }
  if (card == "military") {

    if (this.game.player == player) {

      this.updateStatus('Select sector to de-activate.');
      this.playerSelectSector(function(sector) {
        imperium_self.addMove("resolve\tstrategy");
        imperium_self.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
        imperium_self.addMove("deactivate\t"+player+"\t"+sector);
        imperium_self.endTurn();
      });

    }

  }
  if (card == "tech") {

    if (this.game.player == player) {

      this.playerResearchTechnology(function(tech) {
        imperium_self.addMove("resolve\tstrategy");
        imperium_self.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
        imperium_self.addMove("purchase\t"+player+"\ttechnology\t"+tech);
        imperium_self.endTurn();
      });
    }
  }

  if (card == "empire") {

    this.game.state.round_scoring = 1;

    if (this.game.player == player) {
      this.playerScoreVictoryPoints(function(vp, objective) {
        imperium_self.addMove("resolve\tstrategy");
        imperium_self.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
	if (vp > 0) {
          imperium_self.addMove("score\t"+player+"\t"+vp+"\t"+objective);
	}
        imperium_self.endTurn();
      });
    }

  }


}



Imperium.prototype.playStrategyCardSecondary = function playStrategyCardSecondary(player, card) {

  let imperium_self = this;

  let strategy_cards = this.returnStrategyCards();
  this.updateStatus("Moving into the secondary of the " + strategy_cards[card].name + " strategy card");

  //
  // we need to wait for everyone to confirm to move on
  //
  //let player_confirmation_needed = this.game.players.length;
  let player_confirmation_needed = 1;


  this.confirms_needed = player_confirmation_needed;
  this.confirms_received = 0;



  if (card == "initiative") {
    this.addMove("resolve\tstrategy\t1");
    this.playerBuyTokens();
    return 0;
  }

  if (card == "negotiation") {

    if (this.game.player != player) {

      let html = 'Do you wish to spend 1 strategy token to unexhaust two planet cards? <p></p><ul>';
      html += '<li class="option" id="yes">Yes</li>';
      html += '<li class="option" id="no">No</li>';
      html += '</ul>';
      this.updateStatus(html);

      $('.option').off();
      $('.option').on('click', function() {

	let id = $(this).attr("id");

	if (id == "yes") {

          imperium_self.addMove("resolve\tstrategy\t1");
          let array_of_cards = this.returnPlayerExhaustedPlanetCards(imperium_self.game.player); // unexhausted

	  let choices_selected = 0;
	  let max_choices = 0;

          let html  = "Select planets to unexhaust: <p></p><ul>";
	  for (let z = 0; z < array_of_cards.length; z++) {
	    max_choices++;
	    html += '<li class="cardchoice" id="cardchoice_'+array_of_cards[z]+'">' + this.returnPlanetCard(array_of_cards[z]) + '</li>';
	  }
	  html += '</ul>';
	  if (max_choices >= 2) { max_choices = 2; }

	  this.updateStatus(html);

	  $('.cardchoice').off();
	  $('.cardchoice').on('click', function() {

	    let action2 = $(this).attr("id");
	    let tmpx = action2.split("_");

	    let divid = "#"+action2;
	    let y = tmpx[1];
	    let idx = 0;
	    for (let i = 0; i < array_of_cards.length; i++) {
	      if (array_of_cards[i] === y) {
	        idx = i;
	      }
	    }

	    choices_selected++;
	    imperium_self.addMove("unexhaust\t"+imperium_self.game.player+"\tplanet\t"+array_of_cards[idx]);

	    $(divid).off();
	    $(divid).css('opacity','0.3');

	    if (choices_selected >= max_choices) {
	      imperium_self.endTurn();
	    }

	  });
	}

	if (id == "no") {
          this.addMove("resolve\tstrategy\t1");
          this.endTurn();
          return 0;
	}

      });

    } else {
      this.addMove("resolve\tstrategy\t1");
      this.endTurn();
      return 0;
    }

  }

  if (card == "politics") {

    this.addMove("resolve\tstrategy\t1");
    this.playerBuyActionCards();
    return 0;

  }
  if (card == "infrastructure") {

    let html = 'Do you wish to spend 1 strategy token to build a PDS or Space Dock? <p></p><ul>';
    if (this.game.player != player) {
      html = 'Do you wish to build a second PDS or Space Dock? <p></p><ul>';
    }
    html += '<li class="option" id="yes">Yes</li>';
    html += '<li class="option" id="no">No</li>';
    html += '</ul>';

    this.updateStatus(html);

    $('.option').off();
    $('.option').on('click', function() {

      let id = $(this).attr("id");

      if (id == "yes") {
        this.addMove("resolve\tstrategy\t1");
	if (this.game.player != player) {
          this.addMove("expend\t"+imperium_self.game.player+"\tstrategy\t1");
	}
        this.playerBuildInfrastructure();
      }
      if (id == "no") {
        this.addMove("resolve\tstrategy\t1");
        this.endTurn();
        return 0;
      }

    });
  }

  if (card == "trade") {

    if (this.game.player != player) {

      let html = 'Do you wish to spend 1 strategy token to refresh your commodities? <p></p><ul>';
      html += '<li class="option" id="yes">Yes</li>';
      html += '<li class="option" id="no">No</li>';
      html += '</ul>';

      this.updateStatus(html);

      $('.option').off();
      $('.option').on('click', function() {

        let id = $(this).attr("id");

        if (id == "yes") {
          this.addMove("resolve\tstrategy\t1");
          this.addMove("purchase\t"+this.game.player+"\tcommodities\t"+this.game.players[this.game.player-1].commodity_limit);
          this.addMove("expend\t"+imperium_self.game.player+"\tstrategy\t1");
        }
        if (id == "no") {
        this.addMove("resolve\tstrategy\t1");
        this.endTurn();
        return 0;
        }

      });
    } else {
      this.addMove("resolve\tstrategy\t1");
      this.endTurn();
      return 0;
    }

  }
  if (card == "military") {

    if (this.game.player != player) {

      let html = 'Do you wish to spend 1 strategy token to produce in your home sector? <p></p><ul>';
      html += '<li class="option" id="yes">Yes</li>';
      html += '<li class="option" id="no">No</li>';
      html += '</ul>';

      this.updateStatus(html);

      $('.option').off();
      $('.option').on('click', function() {

        let id = $(this).attr("id");

        if (id == "yes") {
          imperium_self.addMove("resolve\tstrategy\t1");
          imperium_self.addMove("expend\t"+imperium_self.game.player+"\tstrategy\t1");
	  imperium_self.playerProduceUnits(this.game.players[this.game.player-1].homeworld);
        }
        if (id == "no") {
          imperium_self.addMove("resolve\tstrategy\t1");
          imperium_self.endTurn();
          return 0;
        }

      });
    } else {
      this.addMove("resolve\tstrategy\t1");
      this.endTurn();
      return 0;
    }

  }
  if (card == "tech") {

    if (this.game.player != player) {

      let html = 'Do you wish to spend 4 resources and a strategy token to research a technology? <p></p><ul>';
      html += '<li class="option" id="yes">Yes</li>';
      html += '<li class="option" id="no">No</li>';
      html += '</ul>';

      this.updateStatus(html);

      $('.option').off();
      $('.option').on('click', function() {

        let id = $(this).attr("id");

        if (id == "yes") {
          imperium_self.addMove("resolve\tstrategy\t1");
          imperium_self.playerSelectResources(4, function(success) {

	    if (success == 1) {
              imperium_self.playerResearchTechnology(function(tech) {
                imperium_self.addMove("resolve\tstrategy");
                imperium_self.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
                imperium_self.addMove("purchase\t"+player+"\ttechnology\t"+tech);
                imperium_self.addMove("expend\t"+imperium_self.game.player+"\tstrategy\t1");
                imperium_self.endTurn();
              });
	    } else {

alert("insufficient resources to build this tech... dying");

	    }
          });
        }
        if (id == "no") {
          imperium_self.addMove("resolve\tstrategy\t1");
          imperium_self.endTurn();
          return 0;
        }
      });

    } else {

      let html = 'Do you wish to spend 6 resources and a strategy token to research a technology? <p></p><ul>';
      html += '<li class="option" id="yes">Yes</li>';
      html += '<li class="option" id="no">No</li>';
      html += '</ul>';

      this.updateStatus(html);

      $('.option').off();
      $('.option').on('click', function() {

        let id = $(this).attr("id");

        if (id == "yes") {
          imperium_self.addMove("resolve\tstrategy\t1");
          imperium_self.playerSelectResources(6, function(success) {

	    if (success == 1) {
              imperium_self.playerResearchTechnology(function(tech) {
                imperium_self.addMove("resolve\tstrategy");
                imperium_self.addMove("strategy\t"+card+"\t"+player+"\t2\t"+player_confirmation_needed);
                imperium_self.addMove("purchase\t"+player+"\ttechnology\t"+tech);
                imperium_self.addMove("expend\t"+imperium_self.game.player+"\tstrategy\t1");
                imperium_self.endTurn();
              });
	    } else {

alert("insufficient resources to build this tech... dying");

	    }
          });
        }
        if (id == "no") {
          imperium_self.addMove("resolve\tstrategy\t1");
          imperium_self.endTurn();
          return 0;
        }
      });
    }
  }


  if (card == "empire") {

    this.playerScoreVictoryPoints(function(vp, objective) {
      imperium_self.addMove("resolve\tstrategy\t1");
      if (vp > 0) {
        imperium_self.addMove("score\t"+player+"\t"+vp+"\t"+objective);
      }
      imperium_self.endTurn();
    });

  }


  //
  // send 1-of-N confirms
  //
  //this.addMove("resolve\tstrategy\t1");
  //this.endTurn();
  return 0;

}








