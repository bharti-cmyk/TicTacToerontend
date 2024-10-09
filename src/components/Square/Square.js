import React, { useState } from "react"; // Importing React and useState hook
import "./Square.css"; // Importing CSS for styling the square component

// SVG for the circle icon
const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff" // Stroke color for the circle
        stroke-width="2" // Stroke width for the circle
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </g>
  </svg>
);

// SVG for the cross icon
const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff" // Stroke color for the cross
        stroke-width="1.5" // Stroke width for the cross
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </g>
  </svg>
);

const Square = ({
  gameState,
  setGameState,
  socket,
  playingAs,
  currentElement,
  finishedArrayState,
  setFinishedState,
  finishedState,
  id,
  currentPlayer,
  setCurrentPlayer,
}) => {
  const [icon, setIcon] = useState(null); // State to track the icon of the square

  // Function to handle square click events
  const clickOnSquare = () => {
    // Check if the current player is allowed to make a move
    if (playingAs !== currentPlayer) {
      return; // Exit if it's not the player's turn
    }

    // Check if the game has already finished
    if (finishedState) {
      return; // Exit if the game is finished
    }

    // If the square is empty, set the icon based on the current player
    if (!icon) {
      if (currentPlayer === "circle") {
        setIcon(circleSvg); // Set circle icon for current player
      } else {
        setIcon(crossSvg); // Set cross icon for current player
      }

      const myCurrentPlayer = currentPlayer; // Store the current player
      // Emit the player's move to the server
      socket.emit("playerMoveFromClient", {
        state: {
          id, // ID of the clicked square
          sign: myCurrentPlayer, // Current player's symbol
        },
      });

      // Switch to the next player
      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");

      // Update the game state with the current player's move
      setGameState((prevState) => {
        let newState = [...prevState]; // Create a copy of the previous state
        const rowIndex = Math.floor(id / 3); // Calculate the row index
        const colIndex = id % 3; // Calculate the column index
        newState[rowIndex][colIndex] = myCurrentPlayer; // Set the current player's symbol in the new state
        return newState; // Return the updated state
      });
    }
  };

  return (
    <div
      onClick={clickOnSquare} // Handle square click
      className={`square ${finishedState ? "not-allowed" : ""} // Disable clicks if the game is finished
      ${currentPlayer !== playingAs ? "not-allowed" : ""} // Disable clicks if it's not the player's turn
       ${finishedArrayState.includes(id) ? finishedState + "-won" : ""} // Apply winning styles if the square is part of the winning combination
       ${finishedState && finishedState !== playingAs ? "grey-background" : ""} // Apply styles for opponent's win
       `}
    >
      {/* Render the appropriate icon based on the current element or the state */}
      {currentElement === "circle"
        ? circleSvg // Render circle if the current element is a circle
        : currentElement === "cross"
        ? crossSvg // Render cross if the current element is a cross
        : icon} 
    </div>
  );
};

export default Square; // Export the Square component for use in other parts of the application
