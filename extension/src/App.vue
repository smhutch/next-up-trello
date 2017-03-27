<template>
  <div>
  <header v-bind:class="headerWidths ? 'active' : '' ">
    <span class="header-text">Next Up Trello</span>
    <div id="header-background">
      <a class="header-block"id="overdueCards" href="#overdueCards" v-if="headerWidths.overdueWidth" v-bind:style="{width: headerWidths.overdueWidth + '%'}">Overdue ({{Math.floor(headerWidths.overdueWidth,0)}})</a>
      <a class="header-block" id="dueCards" href="#dueCards" v-if="headerWidths.dueWidth" v-bind:style="{width: headerWidths.dueWidth + '%'}">Due</a>
      <a class="header-block" id="noDeadlineCards" href="#noDeadlineCards" v-if="headerWidths.noDeadlineWidth" v-bind:style="{width: headerWidths.noDeadlineWidth + '%'}">No Deadline</a>
      <a class="header-block" id="doneCards" href="#doneCards" v-if="headerWidths.doneWidth" v-bind:style="{width: headerWidths.doneWidth + '%'}">Done</a>
    </div>
  </header>
  <div v-bind:class="[showSidebar ? 'active' : '' , 'sidebar']" v-if="loggedIn">
    <div class="settingsItem">
      <button class="backToSettings" v-on:click="backToSettings" v-if="showSettings === false"><i class="icon ion-android-arrow-back"></i> Back to Settings</button>
      <div id="filters" v-if="showFilters">
        <h2>Filters</h2>
        <div class="filter">
          <div class="organisationName">
            <span class="organisationNameLabel">Personal</span>
            <a class="selectAll" v-on:click="selectAllFilters('Personal')">Select all</a>
          </div>
          <div v-for="board in boardsToFilter" v-bind:class="[boardsToShow.indexOf(board.id) > -1 ? 'filter-active' : '', 'filterItem']" v-if="board.org === 'Personal'">
            <label :for="board.id">
              <span>{{board.name}} <span class="bubble">{{board.cardCount}}</span></span>
              <input type="checkbox" :id="board.id" :value="board.id" :checked="board.show === true" v-model="boardsToShow">
            </label>
          </div>
        </div>
        <div class="filter" v-for="org in organisationFilters">
          <div class="organisationName">
            <span class="organisationNameLabel">{{org.name}}</span>
            <a class="selectAll" v-on:click="selectAllFilters(org.name)">Select all</a>
          </div>
          <div v-for="board in boardsToFilter" v-bind:class="[boardsToShow.indexOf(board.id) > -1 ? 'filter-active' : '', 'filterItem']" v-if="board.org === org.name">
            <label :for="board.id">
              <span>{{board.name}} <span class="bubble">{{board.cardCount}}</span></span>
              <input type="checkbox" :id="board.id" :value="board.id" :checked="board.show === true" v-model="boardsToShow">
            </label>
          </div>
        </div>
      </div>
      <div id="onboarding" v-if="showOnboarding">
        <h2>About</h2>
        <p>Here's how Next Up Trello works:</p>
        <p>Trello boards are divided into <span class="overdue">overdue</span>, <span class="due">due</span>, <span class="done">done</span>, and <span class="no-deadline">cards with no due date</span>.</p>
        <p><a target="_blank" href="https://www.smhutch.co.uk">Made by SMHutch</a></p>
      </div>
    </div>
    <div id="settings" class="settingsItem" v-if="showSettings">
      <h2>Settings</h2>
      <p><a href="#" id="show-filters" v-on:click="openFilters">Filter boards</a></p>
      <p><a href="#" id="show-onboarding" v-on:click="openOnboarding">About Next Up Trello</a></p>
      <p><a href="#" id="logout-button" v-on:click="logout">Sign Out</a></p>
    </div>
  </div>
  <div class="content" id="app">
    <div id="open-form" v-on:click="handleSidebar" v-bind:class="[showSidebar ? 'sidebar-active' : '']" v-if="loggedIn">
       <span class="unrotate" v-if="showSidebar">Close</span>
       <span class="unrotate" v-else>Menu</span>
    </div>
    <div class="login-wrapper">
      <div id="account-form" v-if="!loggedIn">
        <p>See your next available Trello tasks everytime you open a new tab.</p>
        <p>Get started by connecting your Trello account.</p>
        <button id="login-button" v-on:click="login">Get Started</button>
      </div>
    </div>
    <div id="loader" v-if="showLoader && loggedIn">
      <div class="loading-spinner">
        <div class="right"></div>
        <div class="left"></div>
        <div class="top"></div>
        <div class="bottom"></div>
      </div>
    </div>
    <div id="trello" v-if="showCards" v-bind:class="[showSidebar ? 'sidebar-active' : '' , 'active']" >
      <div class="section" v-if="overdueCards.length > 0" style="background-color: #FFCDD2;margin-top:60px;" id="overdueCards">
        <h2>Overdue</h2>
        <div class="container">
          <a v-for="card in overdueCards" class="card" :href="card.url" v-on:click="trackCardClick" >
            <div>
              <p class="name">{{card.name}}</p>
              <div class="info">
                <p class="due">{{card.diffDays}}</p>
                <p class="board">{{card.boardName}}</p>
                <p class="board">{{card.org}}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="section" v-if="dueCards.length > 0" style="background-color: #BBDEFB;" id="dueCards">
        <h2>Due</h2>
        <div class="container">
          <a v-for="card in dueCards" class="card" :href="card.url" v-on:click="trackCardClick">
            <div>
              <p class="name">{{card.name}}</p>
              <div class="info">
                <p class="due">{{card.diffDays}}</p>
                <p class="board">{{card.boardName}}</p>
                <p class="board">{{card.org}}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="section" v-if="noDeadlineCards.length > 0" style="background-color: #CFD8DC;" id="noDeadlineCards">
        <h2>No Deadline</h2>
        <div class="container">
          <a v-for="card in noDeadlineCards" class="card" :href="card.url" v-on:click="trackCardClick">
            <div>
              <p class="name">{{card.name}}</p>
              <div class="info">
                <p class="board">{{card.boardName}}</p>
                <p class="board">{{card.org}}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="section" v-if="doneCards.length > 0" style="background-color: #C8E6C9;" id="doneCards">
        <h2>Done ✅</h2>
        <div class="container">
          <a v-for="card in doneCards" class="card" :href="card.url" v-on:click="trackCardClick">
            <div>
              <p class="name">{{card.name}}</p>
              <div class="info">
                <p class="board">{{card.boardName}}</p>
                <p class="board">{{card.org}}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="section empty" v-if="filteredCards.length === 0">
        <div class="container empty" style="text-align:center">
          <p>No cards found 😕. Please try <span v-on:click="openFilters()">editing your filters.</span></p>
        </div>
      </div>
    </div>
  </div>
  
  
  </div>
</template>

<script>

import {APP_KEY} from './key.js'

export default {
  name: 'app',
  data () {
    return {
      boards: [],
      lists: [],
      organisations: [],
      cards: [],
      showSidebar: true,
      showOnboarding: false,
      showFilters: true,
      showLoader: true,
      showCards: false,
      showCloseForm: false,
      showSettings:false,
      loggedIn: false,
      boardsToShow:[],
    }
  },
  watch: {
    boardsToShow(val) {
      window.localStorage.setItem("nut_filters", JSON.stringify(val));
    },
  },
  computed: {
    boardsToFilter() {
      var boards = this.boards;
      var cards = this.cards;
      
      if (boards.length > 0) {
        var boardsWhichContainCards = boards.filter((b) => {
          var BoardExistsInCardsArray = cards.some((c) => (c.idBoard === b.id));
          return BoardExistsInCardsArray
        })
        
        boardsWhichContainCards.map((b) => {
          var countofCardsWhichContainsThisId = 0;
          
          this.cards.forEach((c) => {
            if (c.idBoard === b.id) {countofCardsWhichContainsThisId ++}
          })
          
          b.cardCount = countofCardsWhichContainsThisId;
          return b
        })
        
        if (window.localStorage.nut_filters) {
          var filters = JSON.parse(window.localStorage.nut_filters);
          if (filters.length === 0){
            var ids = boardsWhichContainCards.map(b => b.id);
            this.boardsToShow = ids;
          }
        } else {
          var ids = boardsWhichContainCards.map(b => b.id);
          this.boardsToShow = ids;
        }
        
        return boardsWhichContainCards
      } else {
        return []
      }
    },
    filteredCards() {
      var cards = this.cards;
      var out = cards.filter((b) => {
        if(this.boardsToShow.indexOf(b.idBoard) > -1) {
          return true
        } else {
          return false
        }
      });
      return out
    },
    organisationFilters() {
      var orgs = this.organisations;
      var organisationsWithCards = orgs.filter((o) => {
        var hasBoards = this.boardsToFilter.some(b => {
          return b.org === o.name
        })
        return hasBoards
      });
      return organisationsWithCards;
    },
    headerWidths() {
      // Get Lengths
      var overdueTotal = this.overdueCards.length;
      var dueTotal = this.dueCards.length;
      var doneTotal = this.doneCards.length;
      var noDeadlineTotal = this.noDeadlineCards.length;
      
      // Get total cards
      var cardTotal = overdueTotal + dueTotal + doneTotal + noDeadlineTotal;
      
      if (cardTotal === 0) {
        return false
      } else {
        // Get width percentages for cards
        var overdueWidth = (overdueTotal / cardTotal) * 100;
        var dueWidth = (dueTotal / cardTotal) * 100;
        var doneWidth = (doneTotal / cardTotal) * 100;
        var noDeadlineWidth = (noDeadlineTotal / cardTotal) * 100;
        
        var widths = {overdueWidth, dueWidth, doneWidth, noDeadlineWidth}  
        return widths;
      }
    },
    cardsWithDueDate() {
      return this.filteredCards.filter((card) => (card.due && (card.dueComplete === false)));
    },
    overdueCards() {
      var filtered = this.cardsWithDueDate.filter((card) => (new Date(card.due) < new Date()));
      var mapped = filtered.map((card) => {
        var dueDate = new Date(card.due);
        
        var compare = dueDate.getTime();
        var timeNow = new Date().getTime();
        var day = 1000*60*60*24;
        
        var timeDiff = Math.abs(timeNow - compare);
        var diffDays = Math.ceil(timeDiff / day);
        
        if (diffDays < 1) {
          diffDays = "Due less than a day ago.";
        } else {
          diffDays = "Due " + diffDays + " days ago.";
        }
        
        card.diffDays = diffDays;
        return card
      });
      // sort so that most overdue is at the top of the lists
      var sorted = mapped.sort((a,b) => {
        a = new Date(a.due);
        b = new Date(b.due);
        return a < b ? -1 : a > b ? 1 : 0;
      })
      
      return sorted
    },
    dueCards() {
      var filtered = this.cardsWithDueDate.filter((card) => (new Date(card.due) > new Date()));
      var mapped = filtered.map((card) => {
        var dueDate = new Date(card.due);
        
        var compare = dueDate.getTime();
        var timeNow = new Date().getTime();
        var day = 1000*60*60*24;
        
        var timeDiff = Math.abs(compare - timeNow);
        var diffDays = Math.ceil(timeDiff / day);
        if (diffDays < 1) {
          diffDays = "Due in less than a day";
        } else {
          diffDays = "Due in " + diffDays + " days.";
        }
        
        card.diffDays = diffDays;
        return card
      });
      var sorted = mapped.sort((a,b) => {
        a = new Date(a.due);
        b = new Date(b.due);
        return a < b ? -1 : a > b ? 1 : 0;
      });
      return sorted
    },
    doneCards() {
      return this.filteredCards.filter((card) => (card.dueComplete === true))
    },
    noDeadlineCards() {
      return this.filteredCards.filter((card) => (card.due === null))
    },
  },
  methods: {
    handleSidebar() {
      if (this.showSidebar === false) {
        this.showSidebar = true;
        this.showSettings = true;
        this.showOnboarding = false;
        this.showFilters = false;
      } else {
        this.showSidebar = false;
        this.showOnboarding = false;
        this.showSettings = true;
      }
    },
    getData() {
      var token = localStorage.trello_token;
      var authString = "key=" + APP_KEY + "&token=" + token;
      this.getOrganisations(authString);
    },
    getOrganisations(authString) {
      var organisationsUrl = "https://api.trello.com/1/members/me/organizations/?" + authString;
      var getOrg = new XMLHttpRequest();
      getOrg.open('GET', organisationsUrl);
      getOrg.onload = () => {
        if(getOrg.status === 200) {
          var orgList = JSON.parse(getOrg.response);
          var output = orgList.map((o) => {
            return {"name": o.displayName,"id": o.id}
          })
          this.organisations = output;
          this.getBoards(authString);
        } else {
          console.log(getOrg.status);
        }
      }
      getOrg.send(); 
    },
    getBoards(authString) {
      var boardsUrl = "https://api.trello.com/1/members/me/boards/?" + authString;
      var getBoards = new XMLHttpRequest();
      getBoards.open('GET', boardsUrl);
      getBoards.onload = () => {
        if(getBoards.status === 200) {
          var boards = JSON.parse(getBoards.response);
          var open = boards.filter((b) => b.closed === false);
          var output = open.map((b) => {
            var org = b.idOrganization;
            if (org) {
              b.orgName = this.organisations.find(x => x.id === org).name;
            } else {
              b.orgName = "Personal"
            }
            var out = {
              "name": b.name,
              "id": b.id,
              "org": b.orgName,
              "show": true
            }
            return out
          });
          this.boards = output;
          this.getCards(authString);
        } else {console.log(getBoards.status);}
      }
      getBoards.send();
    },
    getCards(authString) {
      //Get cards
      var cardsUrl = "https://api.trello.com/1/members/me/cards/?" + authString;
      var getCards = new XMLHttpRequest();
      getCards.open('GET', cardsUrl);
      getCards.onload = () => {
        if (getCards.status === 200) {
          var result = JSON.parse(getCards.response);
          var output = result.map(card => {
            card.boardName = this.boards.find(x => x.id === card.idBoard).name;
            card.org = this.boards.find(x => x.id === card.idBoard).org;
            return card;
          })
          this.cards = output;
          this.showLoader = false;
          this.showCards = true;
        } else {
            console.log('Request failed.  Returned status of ' + getCards.status);
        }
      };
      getCards.send();
    },
    logout() {
      Trello.deauthorize();
      window.localStorage.removeItem('nut_filters');
      analytics.track('logged out');
      location.reload();
    },
    login() {
      Trello.setKey(APP_KEY);
      var authSuccess = function() {
        console.log("auth success");
      };
      var authFailure = function() {
        console.log("auth failed");
      };
      Trello.authorize(
        {
            name: "Next Up Trello",
            type: "redirect",
            expiration: "never",
            scope: {read: true, write: false},
            success: authSuccess,
            error: authFailure
        });
    },
    loginCheck() {
      var hash = window.location.hash;
      if (hash.length > 0){
          hash = hash.substring(1, hash.length);
          var hashArray = hash.split('&');
          var token = '';
          hashArray.forEach(e => {
            e = e.split("=");
            if (e[0] === 'token'){
              Trello.authorize({
                interactive:false
              });
            }
          });
      }
      
      if (!localStorage.trello_token) {
          this.loggedIn = false; 
      } else {
          this.showSidebar = false;
          this.showLoader = true;
          this.loggedIn = true;
          analytics.identify(localStorage.id);
          this.getData();
      }
    },
    openFilters() {
      this.showFilters = true;
      this.showSettings = false;
      analytics.track('open_form', {form: 'Filters'});
    },
    openOnboarding() {
      this.showOnboarding = true;
      this.showSettings = false;
      analytics.track('open_form', {form: 'Onboarding'});
    },
    trackCardClick() {analytics.track('clicked_card', {type: card.parentNode.id});},
    backToSettings() {
      this.showOnboarding = false;
      this.showFilters = false;
      this.showSettings = true;
    },
    checkLocal() {
      var local = window.localStorage;
      if (local.nut_filters) {
        this.boardsToShow = JSON.parse(local.nut_filters);
      }
    },
    selectAllFilters(orgName) {
      var b = this.boardsToFilter;
      var ba = this.boardsToShow;
      var boardsToShowWithOrgName = b.filter(b => {
        return b.org === orgName
      })
      
      var countOfBoards = boardsToShowWithOrgName.length;
      var valCount = 0;
      boardsToShowWithOrgName.forEach(b => {
        if (ba.indexOf(b.id) > -1) {
          valCount ++; 
        }
      });
      
      if (valCount > (countOfBoards / 2)) {
        // more than half selected, so clear from list
        boardsToShowWithOrgName.forEach(b => {
          var index = this.boardsToShow.indexOf(b.id);
          if (index > -1) {
            this.boardsToShow.splice(index,1)
          }
        });        
      } else {
        // add all to list
        boardsToShowWithOrgName.forEach(b => {
          var index = this.boardsToShow.indexOf(b.id);
          if (index === -1) {
            this.boardsToShow.push(b.id);
          }
        })
      }
      
    }
  },
  mounted() {
    this.checkLocal();
    this.loginCheck();
  },
}
</script>

<style lang="scss">
* {
  text-decoration: none;
  --overdue-color: #F44336;
  --due-color:#2196F3;
  --no-deadline-color:#607D8B;
  --done-color:#4CAF50;
  --overdue-color-light: #FFCDD2;
  --due-color-light:#BBDEFB;
  --no-deadline-color-light:#CFD8DC;
  --done-color-light:#C8E6C9;
}

p {
  font-size: 1em;
  line-height: 1.5em;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  font-family: -apple-system, BlinkMacSystemFont, 
     "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", 
     "Fira Sans", "Droid Sans", "Helvetica Neue", 
     sans-serif;
}

p span {
  position: relative;
}

p span:after {
  content:"";  
  content: "";
  position: absolute;
  top: 60%;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.2;
}

span.overdue:after {background-color: var(--overdue-color);}
span.due:after {background-color: var(--due-color);}
span.done:after {background-color: var(--done-color);}
span.no-deadline:after {background-color: var(--no-deadline-color);}

#loader,
#trello,
#form {
  transition:0.4s ease all;
}

.login-wrapper {
  width: 100vw;
}

#account-form {
  box-shadow:0px 0px 10px rgba(0,0,0,0.2);
  max-width: 800px;
  width: 90%;
  margin:100px auto;
  box-sizing: border-box;
  padding:20px;
  text-align: center;
  
  #login-button {
    border-right-color: var(--overdue-color);
    border-left-color: var(--due-color);
    border-top-color: var(--no-deadline-color);
    border-bottom-color: var(--done-color);
    border-radius: 5px;
    border-style:solid;
    border-width:5px;
  }
}

#loader {
  background-color: white;
  position:fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  display:flex;
  justify-content: center;
  align-items: center;
  perspective: 50px;
}

.loading-spinner {
  width:5px;
  height:50px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  animation:rise 10s ease infinite;
}

.loading-spinner div {
  height:10px;
  width:10px;
  border-radius:50%;
  animation:pushAway 1s linear infinite;
  opacity: 0;
}

.loading-spinner div:nth-of-type(1) {
  background-color:var(--overdue-color);
}
.loading-spinner div:nth-of-type(2) {
  background-color:var(--due-color);
  animation-delay:0.25s;
}
.loading-spinner div:nth-of-type(3) {
  background-color:var(--no-deadline-color);
  animation-delay:0.5s;
}
.loading-spinner div:nth-of-type(4) {
  background-color:var(--done-color);
  animation-delay:0.75s;
}

@keyframes pushAway {
  0% {transform:translateX(0px); opacity:0;}
  25% {transform:translateX(10px);opacity:.5;}
  50% {opacity:1}
  75% {transform:translateX(-10px);opacity:.5;}
  100% {transform:translateX(0px) ;opacity:0;}
}

@keyframes rise {
  0% {transform:translateY(0)}
  100% {transform: translateY(-100px);}  
}

a {
  color:#222;
}

#overdueCards .card {border-top-color:var(--overdue-color);}
#dueCards .card {border-top-color:var(--due-color);}
#noDeadlineCards .card {border-top-color:var(--no-deadline-color);}
#doneCards .card {border-top-color:var(--done-color);}

.section h2 {
  text-align: right;
  color: white;
  position: sticky;
  float: right;
  top: 120px;
  margin: 0;
  padding-right: 50px;
  text-orientation: upright;
  font-size: 1em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 300;
  opacity: 0.2;
  padding-bottom:60px;
}

#overdueCards h2 {color: var(--overdue-color);}
#dueCards h2 {color: var(--due-color);}
#noDeadlineCards h2 {color: var(--no-deadline-color);}
#doneCards h2 {color: var(--done-color);}

.container {
  padding:50px 0;
  width:90%;
  max-width:500px;
  margin: 0px auto;
  opacity:0;
  transform:translateY(50px);
}

#trello {
  position:relative;
}

#trello.active .container {
  animation:containerRise 0.8s ease forwards;
}

#trello.sidebar-active {
  margin-left:300px;
}

@keyframes containerRise {
  0% {}
  100% {transform:translateY(0);opacity:1;}
}

.card {
  box-shadow:0px 2px 10px rgba(0,0,0,0.2);
  display: block;
  background-color: rgba(255,255,255,0.8);
  padding:20px;
  margin-bottom:20px;
  border-radius:5px;
  border-top:5px solid;
  transition:0.6s ease all;
  text-align: center;
}

.card:hover {
  transform:translateY(0) scale(1.05)!important;
}

.name {
  font-size:1.5em;
  margin:10px 0;
  font-weight:800;  
}

.info {
  display:flex;
  justify-content: center;
}

.info p {
  background-color: rgba(255,255,255,0.2);
  border-radius: 20px;
  padding: 5px 10px;
  box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
  margin-right: 10px;
  font-size: 0.8em;
}

.content {
  margin-top:60px;
}

#form {
  position: fixed;
  z-index: 2;
  top:0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255,255,255,0.8);
  will-change: box-shadow, border;
  border: 5px solid transparent;
  animation: arrive 0.4s ease forwards;
  transition: 0s;
  perspective: 1000px;
}

#form a {
  color:#2196F3;
}

#form .form-inner {
  border-radius: 5px;
  animation: popin 0.4s ease forwards;
}

@keyframes popin { 
0% {
  transform:rotateX(90deg) translateY(-100px);
  opacity: 0;
}
100% {
    transform:rotateX(0) translateY(0px);
    opacity: 1;
  }
}

#open-form {
  width: 60px;
  height: 60px;
  top: 80px;
  left: 20px;
  right: auto;
  bottom: auto;
  box-shadow: 0px 0px 20px rgba(0,0,0,0.2);
  border-right-color: var(--overdue-color);
  border-left-color: var(--due-color);
  border-top-color: var(--no-deadline-color);
  border-bottom-color: var(--done-color);
  border-radius: 5px;
  border-style:solid;
  border-width:5px;
  text-align: center;
  display: block;
  transform: rotate(45deg);
  font-size:0.8em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  line-height: 60px;
  position:fixed;
  z-index:1;
  transition:0.4s ease all;
  background-color: white;
}

#open-form .unrotate {
  transform: rotate(-45deg);
  transition:0.4s ease transform;
  display: block;
}

#open-form.sidebar-active {
  transform:rotate(0deg);
  line-height:2em;
  padding:10px 20px;
  height: auto;
}

#open-form.sidebar-active .unrotate {
  transform:rotate(0deg);
}

#open-form:hover {
  cursor: pointer;
}

#form .form-inner {
  z-index: 3;
  position: relative;
  margin:100px auto;
  background-color: white;
  box-shadow: 0px 2px 20px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 500px;
  padding: 50px;
}

button#close-form {
  position: absolute;
  right: 20px;
  top: 20px;
}

button {
  text-align: center;
  padding: 5px 10px;
  text-transform: uppercase;
  font-size: 0.8em;
  background-color: white;
  outline: 0;
  border-radius:5px;
  border: 0;
  box-shadow: 0px 0px 5px rgba(0,0,0,0.2);
  transition:0.4s ease all;
}

button:hover {
  transform:scale(1.05);
}

button.active {
  display: block;
}

header {
  text-align: center;
  position: fixed;
  left: 0;
  right:0;
  top:0;
  box-shadow: 0px 2px 10px rgba(0,0,0,0.2);
  background:linear-gradient(to bottom,white, #f5f5f5);
  z-index: 4;
  line-height: 60px;
  transition: 0.4s ease all;
  overflow: hidden;
}

header.active:hover #header-background {
  transform: translateY(0);
}

header.active:hover .header-text {
  transform: translateY(-60px);  
}

.header-text {
  font-weight:300;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 1em;
  display: block;
  transition: 0.4s ease all;
  transform: translateY(-5px);
}

#header-background {
  position: absolute;
  left: 0;
  right:0;
  bottom:0;
  top:0;
  display: flex;
  justify-content: space-between;
  transform: translateY(55px);
  transition: 0.4s ease all;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.header-block {
  font-size: 0.8em;
}

.header-block#overdueCards {
  background-color:#FFCDD2;
  color:#F44336;
}

.header-block#dueCards {
  background-color:#BBDEFB;
  color:#2196F3;
}

.header-block#noDeadlineCards {
  background-color:#CFD8DC;
  color:#607D8B;
}

.header-block#doneCards {
  background-color:#C8E6C9;
  color:#4CAF50;
}

.organisationName {
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
}

.organisationNameLabel {
  font-weight: 800;
}

.selectAll {
  color:var(--due-color);
}

#filters {
  /*margin-top:80px;*/
}

.filterItem {
  margin-bottom:20px;  
  padding: 8px;
  border-radius: 5px;
  transition: 0.4s ease all;
}

.filterItem.filter-active {
  box-shadow:0px 1px 2px 1px rgba(0,0,0,0.2);
}

.filterItem label {
  display: flex;
  justify-content: space-between;
  align-items:center;  
}

.filterItem label input {
  margin-left: 20px;
}

.sidebar {
  position: fixed;
  width: 300px;
  overflow-y: scroll;
  bottom: 0;
  top: 60px;
  padding-bottom: 50px;
  transform: translateX(-350px);
  transition: 0.4s ease all;
  box-shadow:2px 0px 10px rgba(0,0,0,0.2);
  z-index: 1;
  padding:20px;
  padding-bottom:50px;
  box-sizing:border-box;
}

.sidebar.active {
  transform:translateX(0);
}

.sidebar .settingsItem {
  margin-top:80px;
  user-select:none;
}

.bubble {
  background-color:rgba(255,255,255,0.2);
}
</style>
