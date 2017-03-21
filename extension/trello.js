var app = new Vue({
  el: '#vue-loader',
  data: {
    boards: [],
    lists: [],
    organisations: [],
    cards: [],
    showSidebar: true,
    showOnboarding: false,
    showFilters: true,
    showLoader: true,
    showCards: false,
    showLoginForm: false,
    showCloseForm: false,
    showSettings:false,
    boardsToShow:[],
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
      
      var filters = JSON.parse(window.localStorage.nut_filters);
      if (filters.length === 0){
        var ids = boardsWhichContainCards.map(b => b.id);
        this.boardsToShow = ids;
      }
      
      return boardsWhichContainCards
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
      
      // Get width percentages for cards
      var overdueWidth = (overdueTotal / cardTotal) * 100;
      var dueWidth = (dueTotal / cardTotal) * 100;
      var doneWidth = (doneTotal / cardTotal) * 100;
      var noDeadlineWidth = (noDeadlineTotal / cardTotal) * 100;
      
      var widths = {overdueWidth, dueWidth, doneWidth, noDeadlineWidth}  
      return widths;
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
      authString = "key=" + APP_KEY + "&token=" + token;
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
          console.log(boards.length);
          var open = boards.filter((b) => b.closed === false);
          console.log(open.length);
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
          this.getCards();
        } else {console.log(getBoards.status);}
      }
      getBoards.send();
    },
    getCards() {
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
            document.getElementById("trello").innerHTML = "Sorry, something went wrong";
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
      Trello.authorize(
        {
            name: "Next Up Trello",
            type: "redirect",
            expiration: "never",
            interactive: true,
            scope: {read: true, write: false},
            success: function () {
                console.log("success");
                location.reload();
            },
            error: function () {
                console.log("failure")
            }
        });
    },
    loginCheck() {
      if (!localStorage.trello_token) {
          this.loggedIn = false;
          this.showLoginForm = true;
          this.showCloseForm = false;
      } else {
          this.showSidebar = false;
          this.showLoader = true;
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
})
