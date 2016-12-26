var auth_string = "";

var boardList = [];
var lists = [];

// Sorted Lists of cards
var overdueCards = [];      
var dueCards = [];      
var doneCards = [];
var noDeadlineCards = [];

var sortArray = function() {
  // overdue cards, sort so that most overdue is at the top of the lists
  overdueCards.sort(function(a,b) {
    a = new Date(a.due);
    b = new Date(b.due);
    return a < b ? -1 : a > b ? 1 : 0;
  })
  
  dueCards.sort(function(a,b) {
    a = new Date(a.due);
    b = new Date(b.due);
    return a < b ? -1 : a > b ? 1 : 0;
  })
  
  function createHeader() {
    var headerbg = document.getElementById("header-background");
    var overdueTotal = overdueCards.length;
    var dueTotal = dueCards.length;
    var doneTotal = doneCards.length;
    var noDeadlineTotal = noDeadlineCards.length;
    
    var cardTotal = overdueTotal + dueTotal + doneTotal + noDeadlineTotal;
    
    function createHeaderBlock(number, type) {
      var w = (number / cardTotal);
      var percent = w *100;
      percent = percent + "%";
      
      var block = document.createElement("a");
      block.classList.add("header-block");
      block.innerHTML = type;
      block.style.width = percent;
      var col = "";
      var text = "";
      var link = "";
      
      if(type == "Overdue") {
        col = "#FFCDD2";
        text = "#F44336";
        link = "#overdueCards";
      } else if (type == "Due") {
        col = "#BBDEFB";
        text = "#2196F3";
        link = "#dueCards";
      } else if (type == "No Deadline") {
        col = "#CFD8DC";
        text = "#607D8B";
        link = "#noDeadlineCards";
      } else if (type == "Done") {
        col = "#C8E6C9";
        text = "#4CAF50";
        link = "#doneCards";
      }
      
      block.href = link;
      block.style.backgroundColor = col;
      block.style.color = text;
      
      headerbg.appendChild(block);
    }
    createHeaderBlock(overdueTotal, "Overdue");
    createHeaderBlock(dueTotal, "Due");
    createHeaderBlock(noDeadlineTotal, "No Deadline");
    createHeaderBlock(doneTotal, "Done");
  }

  function createCards(array, container) {
    var app = document.getElementById(container);
    
    for (var i = 0;i<array.length;i++){
      var card = array[i];
      
      var link = document.createElement("a");
      link.href = card.url;
      link.classList.add("card");
      var div = document.createElement("div");
      
      var info = document.createElement("div");
      info.classList.add("info");
      
      var name = document.createElement("p");
      name.innerHTML = card.name;
      name.classList.add("name");
      var board = document.createElement("p");
      board.innerHTML = card.boardName;
      board.classList.add("board");
      
      div.appendChild(name);
      
      if (container != "doneCards" && card.due != null){
        var due = document.createElement("p");
        var dueDate = new Date(card.due);
        
        var compare = dueDate.getTime();
        var now = new Date().getTime();
        var day = 1000*60*60*24;
        
        if (container == "overdueCards") {
          var timeDiff = Math.abs(now - compare);
          var diffDays = Math.ceil(timeDiff / day);
          
          if (diffDays < 1) {
            diffDays = "Due less than a day ago.";
          } else {
            diffDays = "Due " + diffDays + " days ago.";
          }
        }
        
      if (container == "dueCards") {
        var timeDiff = Math.abs(compare - now);
        var diffDays = Math.ceil(timeDiff / day);
        if (diffDays < 1) {
          diffDays = "Due in less than a day";
        } else {
          diffDays = "Due in " + diffDays + " days.";
        }
      }
        
        due.innerHTML = diffDays;
        due.classList.add("due")
        info.appendChild(due);
      }
      
      info.appendChild(board);
      div.appendChild(info);
      link.appendChild(div);
      app.appendChild(link);
    }
  }
  
  createCards(overdueCards, "overdueCards");
  createCards(dueCards, "dueCards");
  createCards(noDeadlineCards, "noDeadlineCards");
  createCards(doneCards, "doneCards");
  
  document.getElementById("loader").classList.remove("active");
  document.getElementById("trello").classList.add("active");
  
  createHeader();
  
  var cards = document.querySelectorAll(".card");
  cards.forEach(function(card) {
    card.addEventListener("click", function() {
      analytics.track('clicked_card', {
        type: card.parentNode.id
      });
    })
  })
  
};

var getName = function(id) {  
  for (var i = 0;i<boardList.length;i++) {
    if (boardList[i]["id"] == id) {return boardList[i]["name"];}
  }
}

var getCards = function() {
  //Get cards
  var cardsUrl = "https://api.trello.com/1/members/me/cards/?" + authString;
  var getCards = new XMLHttpRequest();
  getCards.open('GET', cardsUrl);
  getCards.onload = function() {
      if (getCards.status === 200) {
          var data = JSON.parse(getCards.response);
          for (var i = 0;i<data.length;i++) {  
            var card = data[i];
            
            // Add name of board to object
            var name = getName(card.idBoard);
            card.boardName = name;
            
            // push cards to relevant lists
            if (card.dueComplete == true) {
              doneCards.push(card);
            } else {
              if (card.due == null) {
                noDeadlineCards.push(card);
              } else {
                var due = new Date(card.due);
                due < new Date() ? overdueCards.push(card) : dueCards.push(card);
              }
            }
          }
          sortArray();
        } else {
            console.log('Request failed.  Returned status of ' + getCards.status);
            document.getElementById("trello").innerHTML = "Sorry, something went wrong";
        }
      };
      getCards.send();
}

var getBoardNames = function(authString) {
  var boardsUrl = "https://api.trello.com/1/members/me/boards?" + authString;
  var getBoards = new XMLHttpRequest();
  getBoards.open('GET', boardsUrl);
  getBoards.onload = function() {
    if(getBoards.status === 200) {
      var boards = JSON.parse(getBoards.response);
      for(var i=0;i<boards.length;i++){
        var board = boards[i];
        var name = board.name;
        var id = board.id;
        var closed = board.closed;
        if (closed == false) {
          var boardInfo = {
            "name": name,
            "id": id
          };
          boardList.push(boardInfo);
        }
      }
      getCards();
    } else {
      console.log(getBoards.status);
    }
  }
  getBoards.send();
}

var getData = function() {
  var token = localStorage.trello_token;
  authString = "key=" + APP_KEY + "&token=" + token;
  
  getBoardNames(authString);
}

window.onload = function() {
  
  var userId = localStorage.user;
  if (!userId) {
    localStorage.setItem("user", Math.random().toString(36).substr(2, 16));
  }
  
  var form = document.getElementById("form");
  var account = document.getElementById("account-form");
  var lin = document.getElementById("login-button");
  var lout = document.getElementById("logout-button");
  var loader = document.getElementById("loader");
  var content = document.getElementById("trello");
  var onboarding = document.getElementById("onboarding");
  var header = document.querySelector("header");
  var closeForm = document.getElementById("close-form");
  var openForm = document.getElementById("open-form");
  var settings = document.getElementById("settings");
  var showOnboarding = document.getElementById("show-onboarding");
  
  // Check if page load is a redirect back from the auth procedure
  if (HashSearch.keyExists('token')) {
      Trello.authorize(
          {
              name: "Trello Helper Extension",
              expiration: "never",
              interactive: false,
              scope: {read: true, write: false},
              success: function () {
                  console.log("success");
                  analytics.track('logged in');
              },
              error: function () {
                  alert("Failed to authorize with Trello.")
              }
          });
  }
  
  // Log in button
  lin.addEventListener("click", function() {
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
          },
          error: function () {
              console.log("failure")
          }
      });
  });
  
  // Log out
  lout.addEventListener("click", function() {
    Trello.deauthorize();
    analytics.track('logged out');
    location.reload();
  });
  
  // Close onboarding button
  closeForm.addEventListener("click", function() {
    form.classList.add("closed");
    if (settings.classList.contains("active")) {
      analytics.track('close_form', {
        form: 'Settings'
      });
    }
    
    if (onboarding.classList.contains("active")) {
      analytics.track('close_form', {
        form: 'Onboarding'
      });
    }
    
    settings.classList.remove("active");
    onboarding.classList.remove("active");
    if (!localStorage.showOnboarding) {
        localStorage.setItem("showOnboarding", false);
    }
  })
  
  openForm.addEventListener("click", function(e) {
    form.classList.remove("closed");
    settings.classList.add("active");
    analytics.track('open_form', {
      form: 'Settings'
    });
  })
  
  showOnboarding.addEventListener("click", function(e) {
    onboarding.classList.add("active");
    settings.classList.remove("active");
    analytics.track('open_form', {
      form: 'Onboarding'
    });
  })

  // Check if logged in
  if (!localStorage.trello_token) {
      lin.classList.add("active");
      lout.classList.remove("active");
      closeForm.remove("active");
  } else {
      if(localStorage.showOnboarding == true) {
          onboarding.classList.add("active");
      } else {
        form.classList.add("closed");
      }
      header.classList.add("active");
      loader.classList.add("active");
      account.classList.remove("active");
      lin.classList.remove("active");
      lout.classList.add("active");
      analytics.identify(localStorage.id);
      getData();
  }
};
