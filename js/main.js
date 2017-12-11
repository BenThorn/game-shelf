/*Project 3: Game Shelf by Ben Thorn*/ 
/*Webpage that uses node with a giantbomb API wrapper*/
/*Users can search for games, see info, and then drag and drop games to add them to their collection*/
/*The games in their collection, stored with localStorage, can then be viewed and/or cleared*/

"use strict";

var gameCollection = [];

//Page load
$(document).ready(function(){
     if(localStorage.getItem("gameCollection") != null){
       var collStr = localStorage.getItem("gameCollection");
       //This turns the elements back into integers. They get stringfied in local storage.
       if(collStr != ""){
         gameCollection = collStr.split(",");
       }
        //Split the long string
       for(var i = 0; i < gameCollection.length; i++){
         var int = parseInt(gameCollection[i]); //Get the int out
         gameCollection[i] = int;
       }
       document.querySelector("#collectionDiv").textContent = "View " + gameCollection.length + " Games in Collection";
     } 
     console.log(gameCollection);

     //Drop functionality for the drop zone
     document.querySelector("#dropText").ondrop = function(e){
        
        e.preventDefault();
        var dataStr = e.dataTransfer.getData("text");
        var data = parseInt(dataStr); //The ID was turned into a string when it was an attribute, so we turn it back.
        var duplicate = false; //External bool for the for loop below

        //If there's nothing in the array, go ahead and push
        if(gameCollection.length == 0){
          gameCollection.push(data);
        } //Otherwise, check for duplicates
        else{
          for(var i = 0; i < gameCollection.length; i++){
            if(gameCollection[i] == data){
              duplicate = true;
            }
          }
          //Put ID in array
          if(!duplicate){
          gameCollection.push(data);
        }
        }

        
        //Update display
        document.querySelector("#collectionDiv").textContent = "View " + gameCollection.length + " Games in Collection";
        localStorage.setItem("gameCollection", gameCollection);
        console.log(gameCollection);
     } //More setting up drag/drop
     document.querySelector("#dropText").ondragover = function(e){
        e.preventDefault();
     }

     //Main search functionality
    $("#searchForm").submit(function(e){
        $("#result").empty();
        $("#result").append("Searching...");

        var action = $("#searchForm").attr("action");
    
        var term = encodeURIComponent($("#searchTerm").val());
        
        
        var data = "term=" + term;
        //Ajax call
        $.ajax({
          cache: false,
          type: "get", 
          url: action,
          data: data,
          dataType: "json",
          success: function (result, status, xhr) {
            makeSearchResults(result);
          },
          error: function (error, status, xhr) {
            $("#result").empty();
            var resultText = JSON.stringify(error);
            $("#result").text(resultText);
          }
        });
        
        e.preventDefault();
        return false;
      });

      //Onclick for the collection dive that displays how many are in the collection
      $("#collectionDiv").click(function(e){
        var list = [];
        $("#result").empty();
        
        //Makes an ajax call for every game in your collection
        for(var i = 0; i < gameCollection.length; i++){
        var data = "term=" + gameCollection[i];
        
          $.ajax({
            cache: false,
            type: "get", 
            url: "/gameInfo",
            data: data,
            dataType: "json",
            success: function (result, status, xhr) {
              list.push(result);
              makeCollection(list);
            },
            error: function (error, status, xhr) {
              $("#result").empty();
              var resultText = JSON.stringify(error);
              $("#result").text(resultText);
            }
          });
        }

        
        
        e.preventDefault();
        return false;
      });
});

//Makes the search results, in the div on the left.
function makeSearchResults(result){
  //Check if empty
  $("#result").empty();
  if(result.length == 0){
    $("#result").append("No results found.");
  }
//Create a little element for every result in the search
  else{
    for(var i = 0; i < result.length; i++){
      var game = result[i];
      var div = document.createElement('div');
      div.id = "searchItem";
      var h4 = document.createElement('h4');
      var p = document.createElement('p');

      h4.textContent = game.name;

      //Error checking for null fields
      if(game.original_release_date != null){
            p.textContent = game.platforms[0].abbreviation + ' | ' + game.original_release_date.slice(0,4);
      }
      else if(game.platforms != null){
            p.textContent = game.platforms[0].abbreviation; 
      }
      p.id = "searchDetails";

      div.appendChild(h4);
      div.appendChild(p);
      
      //Use closure to make it so that each click event refers to the right game.
      div.onclick = (function(e){
        var thisGame = game;
        var thisDiv = div;

        /*------- Get Game Info -------*/
        return function(){
          $.ajax({
            cache: false,
            type: "get", 
            url: "/gameInfo",
            data: "term=" + thisGame.id,
            dataType: "json",
            success: function (result, status, xhr) {
              $("#gameInfo").empty();
              makeGameInfo(result, thisDiv);
            },
            error: function (error, status, xhr) {
              var resultText = JSON.stringify(error);
              $("#result").text(resultText);
            }
          });
          
        }
          e.preventDefault();
          return false;
        /*-----------------------------*/

      })();
      

      document.querySelector("#result").appendChild(div);
    }
  }
}

//Makes the right part of the results/info screen.
//I put this here so as not to clutter the code above.
function makeGameInfo(game, div){

  var resultDiv = document.querySelector("#gameInfo");
  var displayDiv = document.createElement('div');
  displayDiv.id = "displayDiv";
  //Set the drag functionality
  displayDiv.draggable = true;
  displayDiv.setAttribute("gameID", game.id);
  //Set up variables
  var displayImage = game.image.small_url;
  var name = game.name;
  var people = game.people;
  var platforms = game.platforms;
  var deck = game.deck;
  var genres = game.genres;
  var futureYear = game.expected_release_year;
  var releaseDate = game.original_release_date;
  var developers = game.developers;


  var h3 = document.createElement('h3');
  h3.textContent = game.name;
  h3.style.textAlign = "center";

  var img = document.createElement('img');
  img.src = displayImage;
  img.style.height = '200px';
  img.style.marginRight = '15px';
  img.style.display = 'block';
  img.draggable = false; //So they don't accidentally drag the image

  var p0 = document.createElement('p'); //developer
  var p1 = document.createElement('p'); //Date
  var p2 = document.createElement('p'); //Platform
  var p3 = document.createElement('p'); //People
  var p4 = document.createElement('p'); //Genre
  var p5 = document.createElement('p'); //Section
  var p6 = document.createElement('p'); //Deck (short description)

  if(developers != null){
    p0.textContent = 'Developer: ' + developers[0].name;
  } 
  
  //If the game hasn't come out yet, it has a different variable for the release date
  if(releaseDate != null){
    p1.textContent = 'Release Date: ' + releaseDate.slice(0,10);
  }
  else if(futureYear != null){
    p1.textContent = 'Release Date: ' + futureYear;
  }

  if(platforms != null){
      p2.textContent = 'Platforms: ' + platforms[0].name;

    for(var i = 1; i < platforms.length; i++){
      p2.textContent += ', ' + platforms[i].name;
    }
  }
  
  if(people != null){
    people.splice(10); //Prevents too many names from listing
    p3.textContent = 'People: ' + people[0].name;
    for(var i = 1; i < people.length; i++){
      p3.textContent += ', ' + people[i].name;
    }
  }
  
  if(genres != null){
    p4.textContent = 'Genre: ' + genres[0].name;
  }
  
  p5.textContent = 'Overview: ';
  p5.style.fontSize = "13pt";
  p5.style.marginBottom = "3px"
  p6.style.marginTop = "3px"

  if(deck != null){
    p6.textContent = deck;
  }
  displayDiv.appendChild(img);
  displayDiv.appendChild(p0);
  displayDiv.appendChild(p1);
  displayDiv.appendChild(p2);
  displayDiv.appendChild(p4);
  displayDiv.appendChild(p3);
  displayDiv.appendChild(p5);
  displayDiv.appendChild(p6);

  //Drag/drop setup for the draggable part
  displayDiv.ondragstart = function(e){
    var data = e.target.getAttribute("gameid");
    e.dataTransfer.setData("text", data);
  }

  var instruction = document.createElement('p'); //Drag instructions
  instruction.style.color = "darkgray";
  instruction.style.textAlign = "center";
  instruction.style.fontSize = "20pt"

  instruction.textContent = "Drag the box above to add it to your collection.";


  resultDiv.appendChild(h3);
  resultDiv.appendChild(displayDiv);
  resultDiv.appendChild(instruction);
}



//Constructs the results when you want to look at your game collection
//Almost identical to the makeSearchResults() above, but has some extra element

function makeCollection(result){
  $("#result").empty();
  
  if(result.length == 0){
    $("#result").append("No results found.");
  }
  
  else{
    var header = document.createElement('h3');
    header.textContent = "Collection";
    document.querySelector("#result").appendChild(header);
    for(var i = 0; i < result.length; i++){
      var game = result[i];
      var div = document.createElement('div');
      div.id = "searchItem";
      var h4 = document.createElement('h4');
      var p = document.createElement('p');
      

      h4.textContent = game.name;

      //Error checking for null fields
      if(game.original_release_date != null){
            p.textContent = game.platforms[0].abbreviation + ' | ' + game.original_release_date.slice(0,4);
      }
      else if(game.platforms != null){
            p.textContent = game.platforms[0].abbreviation; 
      }
      p.id = "searchDetails";

      div.appendChild(h4);
      div.appendChild(p);
      
      //Use closure to make it so that each click event refers to the right game.
      div.onclick = (function(e){
        var thisGame = game;
        var thisDiv = div;

        /*------- Get Game Info -------*/
        return function(){
          $.ajax({
            cache: false,
            type: "get", 
            url: "/gameInfo",
            data: "term=" + thisGame.id,
            dataType: "json",
            success: function (result, status, xhr) {
              $("#gameInfo").empty();
              makeGameInfo(result, thisDiv);
            },
            error: function (error, status, xhr) {
              var resultText = JSON.stringify(error);
              $("#result").text(resultText);
            }
          });
          
        }
          e.preventDefault();
          return false;
        /*-----------------------------*/

      })();
      
      

      

      document.querySelector("#result").appendChild(div);
      
    }
    //Button to clear localStorage and your collection
    var clearButton = document.createElement("button");
    clearButton.textContent = "Clear List";
    document.querySelector("#result").appendChild(clearButton);
    //Resets everything
    clearButton.onclick = function(e){
      $("#result").empty();
      gameCollection = [];
      document.querySelector("#collectionDiv").textContent = "View " + gameCollection.length + " Games in Collection";
      localStorage.clear();
    }
  }
}