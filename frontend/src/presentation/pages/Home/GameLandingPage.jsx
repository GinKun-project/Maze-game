import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/landing.css";

const pattern = [
  "########################",
  "#P....#......#.....#..E#",
  "##.##.#.####.#.##.#.####",
  "#..#..#....#.#..#.#....#",
  "#T.#.######.#M.#.####.#T",
  "#..#......#.#..#......##",
  "####.####.#.####.####..#",
  "#C..#..T.#C......#..T..#",
  "#....#....#......#.....#",
  "#.##.#.####.####.#.####",
  "#..#.#....#....#.#....#",
  "#T.#.######.##.#.####.#",
  "#..#......#..#..#.....##",
  "####.####.#.####.####..#",
  "#C..#..T.#C......#..T..#",
  "########################",
];

const tile = {
  "#": "wall",
  ".": "path",
  P: "player",
  E: "exit",
  T: "trap",
  M: "enemy",
  C: "coin",
};

const GameLandingPage = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("maze_auth_token");
    localStorage.removeItem("maze_auth_user");
    navigate("/login");
  };

  const goPlay = () => {
    navigate("/levels");
  };

  return (
    <div className="retro-shell">
      <div className="retro-hud">
        <span>07/11</span>
        <span>⚔︎ 03 +2</span>
        <span>◎ 01 +0</span>
      </div>
      <div className="retro-window">
        <div className="maze-grid">
          {pattern.map((row, r) => (
            <div className="maze-row" key={r}>
              {row.split("").map((cell, c) => (
                <span
                  key={`${r}-${c}`}
                  className={`maze-cell cell-${tile[cell]}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="maze-console">
          <button onClick={goPlay}>PLAY</button>
          <button>CONTINUE</button>
          <button>OPTIONS</button>
          <button onClick={logout}>EXIT</button>
        </div>
      </div>
      <div className="retro-footer">
        <span>HP ████░░░░</span>
        <span>ENERGY ██░░</span>
        <span>COINS 0036</span>
      </div>
    </div>
  );
};

export default GameLandingPage;
