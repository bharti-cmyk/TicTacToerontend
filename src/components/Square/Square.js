import React, { useState } from "react";
import "./Square.css";

// SVG for Circle Icon
const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </g>
  </svg>
);

// SVG for Cross Icon
const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  // Local state to hold the icon for the square
  const [icon, setIcon] = useState(null);

  // Handler for clicking on a square
  const clickOnSquare = () => {
    // Prevent clicking if it's not the player's turn
    if (playingAs !== currentPlayer) return;

    // Prevent clicking if the game has finished
    if (finishedState) return;

    // If square is empty, set the icon based on the current player
    if (!icon) {
      setIcon(currentPlayer === "circle" ? circleSvg : crossSvg);

      const myCurrentPlayer = currentPlayer;
      // Emit the move to the server
      socket.emit("playerMoveFromClient", {
        state: { id, sign: myCurrentPlayer },
      });

      // Switch the current player after move
      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");

      // Update the game state with the new move
      setGameState((prevState) => {
        let newState = [...prevState];
        const rowIndex = Math.floor(id / 3);
        const colIndex = id % 3;
        newState[rowIndex][colIndex] = myCurrentPlayer;
        console.log(currentPlayer);
        return newState;
      });
    }
  };

  return (
    <div
      onClick={clickOnSquare}
      className={`square ${finishedState ? "not-allowed" : ""}
        ${currentPlayer !== playingAs ? "not-allowed" : ""}
        ${finishedArrayState.includes(id) ? `${finishedState}-won` : ""}
        ${finishedState && finishedState !== playingAs ? "grey-background" : ""}
      `}
    >
      {/* Display the appropriate icon for the square */}
      {currentElement === "circle"
        ? circleSvg
        : currentElement === "cross"
        ? crossSvg
        : icon}
    </div>
  );
};

export default Square;
