import React, { useState, useEffect } from "react";
import "./App.css"; // Importing CSS for styling
import Square from "./components/Square/Square"; // Importing the Square component for the game grid
import { io } from "socket.io-client"; // Importing socket.io client for real-time communication
import Swal from "sweetalert2"; // Importing SweetAlert2 for beautiful alerts

// The initial structure of the game board
const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const App = () => {
  // State variables
  const [gameState, setGameState] = useState(renderFrom); // Tracks the current state of the game board
  const [currentPlayer, setCurrentPlayer] = useState("circle"); // Tracks the current player ('circle' or 'cross')
  const [finishedState, setFinishetState] = useState(false); // Tracks if the game has finished
  const [finishedArrayState, setFinishedArrayState] = useState([]); // Stores the indices of winning squares
  const [playOnline, setPlayOnline] = useState(false); // Determines if the player is playing online
  const [socket, setSocket] = useState(null); // Socket connection for real-time communication
  const [playerName, setPlayerName] = useState(""); // Stores the player's name
  const [opponentName, setOpponentName] = useState(null); // Stores the opponent's name
  const [playingAs, setPlayingAs] = useState(null); // Stores whether the player is playing as 'circle' or 'cross'

  // Function to check for a winner
  const checkWinner = () => {
    // Check rows for a winner
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        // Set winning indices and return the winner
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // Check columns for a winner
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        // Set winning indices and return the winner
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    // Check diagonal from top-left to bottom-right
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    // Check diagonal from top-right to bottom-left
    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    // Check for a draw (if all squares are filled)
    const isDrawMatch = gameState.flat().every((e) => {
      return e === "circle" || e === "cross"; // All squares must be filled with 'circle' or 'cross'
    });

    if (isDrawMatch) return "draw"; // Return draw if all squares are filled

    return null; // No winner yet
  };

  // Effect to check for a winner whenever gameState changes
  useEffect(() => {
    const winner = checkWinner(); // Check if there's a winner
    if (winner) {
      setFinishetState(winner); // Update the finished state if there's a winner
    }
  }, [gameState]); // Dependency array: runs effect when gameState changes

  // Function to prompt user for their name
  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name", // Alert title
      input: "text", // Input type
      showCancelButton: true, // Show cancel button
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!"; // Validation message
        }
      },
    });

    return result; // Return the result of the alert
  };

  // Socket event listener for when the opponent leaves the match
  socket?.on("opponentLeftMatch", () => {
    setFinishetState("opponentLeftMatch"); // Set finished state to opponent left match
  });

  // Socket event listener for player moves from server
  socket?.on("playerMoveFromServer", (data) => {
    const id = data.state.id; // Get the square ID from the data
    setGameState((prevState) => {
      let newState = [...prevState]; // Clone the previous state
      const rowIndex = Math.floor(id / 3); // Calculate row index
      const colIndex = id % 3; // Calculate column index
      newState[rowIndex][colIndex] = data.state.sign; // Update the square with the opponent's move
      return newState; // Return the new state
    });
    // Switch the current player
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  });

  // Socket event listener for successful connection
  socket?.on("connect", function () {
    setPlayOnline(true); // Set online status to true
  });

  // Socket event listener for when an opponent is not found
  socket?.on("OpponentNotFound", function () {
    setOpponentName(false); // Set opponent name to false
  });

  // Socket event listener for when an opponent is found
  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs); // Set the player's role (circle/cross)
    setOpponentName(data.opponentName); // Set the opponent's name
  });

  // Function to handle online play button click
  async function playOnlineClick() {
    const result = await takePlayerName(); // Prompt for player name

    if (!result.isConfirmed) {
      return; // Exit if user cancels
    }

    const username = result.value; // Get the entered username
    setPlayerName(username); // Set the player's name

    const newSocket = io("http://localhost:8000", {
      autoConnect: true, // Automatically connect to the server
    });

    // Emit request to play with the player's name
    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket); // Set the new socket connection
  }

  // Render the play online button if not playing online
  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  // Render waiting message if online but no opponent yet
  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for opponent</p>
      </div>
    );
  }

  // Render the game board and UI elements when the game is active
  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {playerName} {/* Display the player's name */}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? "current-move-" + currentPlayer : ""
          }`}
        >
          {opponentName} {/* Display the opponent's name */}
        </div>
      </div>
      <div>
        <h1 className="game-heading water-background">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {/* Render each square in the game grid */}
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Square
                  socket={socket} // Pass the socket connection to the Square component
                  playingAs={playingAs} // Pass the player's role
                  gameState={gameState} // Pass the current game state
                  finishedArrayState={finishedArrayState} // Pass the finished state array
                  finishedState={finishedState} // Pass the overall finished state
                  currentPlayer={currentPlayer} // Pass the current player
                  setCurrentPlayer={setCurrentPlayer} // Function to set current player
                  setGameState={setGameState} // Function to set game state
                  id={rowIndex * 3 + colIndex} // Calculate the unique ID for each square
                  key={rowIndex * 3 + colIndex} // Set key for React's reconciliation
                  currentElement={e} // Pass the current element (state of the square)
                />
              );
            })
          )}
        </div>
        {/* Adjusted winning message logic here */}
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState !== "draw" && (
            <h3 className="finished-state">
              {finishedState === playingAs
                ? "You won the game!" // Display win message for the player
                : `${opponentName} won the game`} 
            </h3>
          )}
        {finishedState &&
          finishedState !== "opponentLeftMatch" &&
          finishedState === "draw" && (
            <h3 className="finished-state">It's a Draw</h3> // Display draw message
          )}
      </div>
      {!finishedState && opponentName && (
        <h2>You are playing against {opponentName}</h2> // Display opponent's name during the game
      )}
      {finishedState && finishedState === "opponentLeftMatch" && (
        <h2>You won the match, Opponent has left</h2> // Display message when the opponent leaves
      )}
    </div>
  );
};

export default App; // Export the App component for use in other parts of the application
