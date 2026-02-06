# Maze Game — Project Documentation

## Introduction
- Purpose: Detailed documentation of the Maze-game project, covering architecture, implemented features, data flow, run instructions, and limitations.

## Project Summary
- Stack: Node.js + Express + MongoDB (backend); React + Vite (frontend); Axios for HTTP.
- Main features: User authentication (register/login with JWT), protected routes, level selection, client-side maze game engine (movement, timer, HP, coins, door/unlock, win/game-over states), UI components (HUD, D-pad, renderer), repository-pattern API client.

## Backend

- Entry & server: [backend/server.js](backend/server.js) — loads environment and starts the server.
- App setup: [backend/src/app.js](backend/src/app.js) — Express app configuration, CORS, JSON parsing, routes, and error handling.
- DB connection: [backend/src/config/db.js](backend/src/config/db.js) — MongoDB connector using `MONGODB_URI`.
- Auth endpoints: [backend/src/routes/authRoutes.js](backend/src/routes/authRoutes.js) — `POST /api/auth/register`, `POST /api/auth/login`.
- Auth logic: [backend/src/controllers/authController.js](backend/src/controllers/authController.js) — register and login controllers using `bcrypt` and JWT.
- JWT generation: [backend/src/utils/generateToken.js](backend/src/utils/generateToken.js).
- Model: [backend/src/models/User.js](backend/src/models/User.js) — Mongoose `User` schema with `username`, `email`, `password`.
- Error middleware: [backend/src/middleware/errorHandler.js](backend/src/middleware/errorHandler.js).
- Backend dependencies & scripts: See [backend/package.json](backend/package.json).

## Frontend

- Entry & Router: [frontend/src/main.jsx](frontend/src/main.jsx) and [frontend/src/router.jsx](frontend/src/router.jsx). Routes include `/login`, `/signup`, `/home`, `/levels`, `/game/:levelId`. Protected pages use `RequireAuth`.
- API client: [frontend/src/infrastructure/http/apiClient.js](frontend/src/infrastructure/http/apiClient.js) (Axios). Base URL from [frontend/src/infrastructure/config/env.js](frontend/src/infrastructure/config/env.js) (`VITE_API_URL` fallback to `http://localhost:5000/api`).
- Auth repository & usecases:
  - [frontend/src/data/repositories/AuthRepositoryImpl.js](frontend/src/data/repositories/AuthRepositoryImpl.js)
  - [frontend/src/domain/usecases/loginUser.js](frontend/src/domain/usecases/loginUser.js)
  - [frontend/src/domain/usecases/registerUser.js](frontend/src/domain/usecases/registerUser.js)
  - Login page: [frontend/src/presentation/pages/auth/LoginPage.jsx](frontend/src/presentation/pages/auth/LoginPage.jsx) — stores `maze_auth_token` and `maze_auth_user` in `localStorage`.
- Auth UI components: [frontend/src/presentation/components/auth/AuthLayout.jsx](frontend/src/presentation/components/auth/AuthLayout.jsx), `TextInput`, `PasswordInput`, `RequireAuth`.

## Game Implementation (Frontend)

- Game page: [frontend/src/presentation/pages/MazeGamePage.jsx](frontend/src/presentation/pages/MazeGamePage.jsx) — composes HUD, `MazeRenderer`, and `Dpad`.
- Level select: [frontend/src/presentation/pages/LevelSelectPage.jsx](frontend/src/presentation/pages/LevelSelectPage.jsx) — level previews, stats, and stars display.
- Core game engine: [frontend/src/presentation/hooks/useGameEngine.js](frontend/src/presentation/hooks/useGameEngine.js)
  - Responsibilities: initialize grid, set `playerPos`, track `hp`, `timeLeft`, `paused`, `gameOver`, `win`, `coinsCollected`, `totalCoins`, `doorUnlocked`.
  - Timer: decrements `timeLeft` each second; triggers `gameOver` at 0.
  - Movement: `movePlayer(dx, dy)` enforces walls, locked doors, collects coins, applies traps, sets win condition when reaching exit and door unlocked or all coins collected.
  - Reset, pause, and movement flags implemented for UI feedback.
- Renderer: [frontend/src/presentation/components/game/MazeRenderer.jsx](frontend/src/presentation/components/game/MazeRenderer.jsx) — renders tile grid and player position.
- Controls: [frontend/src/presentation/components/game/Dpad.jsx](frontend/src/presentation/components/game/Dpad.jsx) and keyboard handling in the game page.
- HUD: [frontend/src/presentation/components/game/HudBar.jsx](frontend/src/presentation/components/game/HudBar.jsx) — shows HP and time, pause control.

## Data Flow & Architecture

- Frontend request flow: UI → usecases → repositories → `apiClient` → Backend endpoints → MongoDB.
- Game flow: Level data (client-side) → `useGameEngine` (hook) manages game state → UI components render state and dispatch moves.
- Auth flow: Backend issues JWT on register/login; frontend stores token in `localStorage` and `RequireAuth` guards protected routes.

## How to Run Locally

Backend (example):

1. Create an `.env` in `backend/` with at least the following variables:
   - `MONGODB_URI` (MongoDB connection string)
   - `JWT_SECRET`
   - `CLIENT_URL` (frontend origin, e.g., http://localhost:5173)
   - optional: `JWT_EXPIRES_IN`, `PORT`

2. Install and run backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

1. Optionally set `VITE_API_URL` to your backend API base (e.g., `http://localhost:5000/api`) in a `.env` at `frontend/` root.

2. Install and run frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the app in the browser at the Vite dev server URL (usually `http://localhost:5173`).

## Dependencies (overview)

- Backend: `express`, `mongoose`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`. Dev: `nodemon`.
- Frontend: `react`, `react-dom`, `react-router-dom`, `axios`, `vite`. Note: `phaser` is listed but not used in inspected sources.

## Known Gaps and Limitations

- No server-side endpoints for level data or user progress persistence were found; levels and progress (stars) appear to be client-only.
- No token refresh flow or logout endpoint implemented; token expiry is not handled on the client.
- Some referenced game files (e.g., `levelData.js`, `starStorage.js`, `MazeScene.js`) were not found at inspected paths; verify locations if present elsewhere.
- No automated tests found in the repository.

## Suggested Improvements

- Persist level progress and stars per-user on the backend.
- Implement token refresh and logout for session security.
- Add automated tests and CI configuration.
- Consolidate level data into a single module and expose admin tools to add levels.
- Consider accessibility improvements for the controls and UI.

## File Map (key files)

- Backend: see above section for detailed file list. Key entry files:
  - [backend/server.js](backend/server.js)
  - [backend/src/app.js](backend/src/app.js)

- Frontend: key files include:
  - [frontend/src/main.jsx](frontend/src/main.jsx)
  - [frontend/src/router.jsx](frontend/src/router.jsx)
  - [frontend/src/infrastructure/http/apiClient.js](frontend/src/infrastructure/http/apiClient.js)
  - [frontend/src/presentation/hooks/useGameEngine.js](frontend/src/presentation/hooks/useGameEngine.js)

## Contact / Next Steps

- If you want, I can also:
  - Add `DOCUMENTATION.md` to Git and commit it (you previously requested not to commit; this file was created but not committed). 
  - Search for the missing game files and include them in the documentation.
  - Add a `.env.example` and a short `README.md` with the run commands.

---

File created locally at: [DOCUMENTATION.md](DOCUMENTATION.md)
---

**Acknowledgement**

This project was developed by the team working on the Maze Game. Thanks to open-source libraries and the maintainers of React, Vite, Express, Mongoose, Axios and related tooling which enabled rapid prototyping and deployment.

**Abstract**

This document describes the Maze Game project implementation, focusing only on components, libraries and techniques actually used in the repository. It summarizes architecture, data flow, implementation details, and gamification features present in the app.

**Keywords**

Maze game, React, Vite, Express, MongoDB, JWT, Axios, gamification, level design, client-side game engine

**Table Of Figures**

- Fig 1: Frontend routing and protected routes (router.jsx)
- Fig 2: Game state lifecycle (useGameEngine hook)
- Fig 3: Backend authentication flow (authController -> generateToken -> client)

**Introduction**

This repository contains a full-stack Maze Game with a Node/Express backend that provides user authentication and a React frontend that implements a grid-based maze game. The focus of the implemented system is a simple, client-driven game experience with basic backend user management.

**Problem Context and Motivation**

The Maze Game addresses the need for a simple interactive application demonstrating authenticated user flows and client-side game logic. Motivations include learning full-stack patterns, applying a repository/usecase architecture on the frontend, and building a compact example of gamified mechanics suited for web deployment.

**Biomechanical Principles and Behavioral Factors in Spin Bowling Performance**

Not applicable to this project. Replaced in scope by player interaction and UX behavior: keyboard and touch input (D-pad), responsiveness, and simple movement constraints governing how the player moves through the maze.

**Role of Data and Artificial Intelligence in Spin Bowling Performance Analysis**

Not applicable. In this project the data role is limited to authentication data stored in MongoDB and locally-managed level definitions; there is no AI or ML component.

**Research Aim**

Not applicable. Implementation aim: produce a maintainable, small-scale full-stack app demonstrating user auth and a client-side maze with gamification elements.

**Research Objectives**

Not applicable. Implementation objectives achieved:
- Provide secure user registration and login with hashed passwords and JWTs.
- Build a client-side, stateful maze engine with collisions, traps, coins, timed gameplay and win/lose conditions.
- Present a simple level selection UI with per-level stats and preview.

**Contribution and Significance**

This project contributes a compact example of integrating authentication and a web game in the same repository. It demonstrates practical usage of:
- `Express` + `Mongoose` for API and persistence (user accounts).
- `bcrypt` and `jsonwebtoken` for secure password hashing and token-based sessions.
- `React` with a composition-based UI and a custom hook (`useGameEngine`) to encapsulate game logic.
- Repository/usecase separation on the frontend to decouple UI from HTTP details.

The significance is educational: it serves as a template for small web games that require user accounts and simple progression.

**Justification of the Study**

Not applicable in academic terms. The practical justification is to provide an integrative example showing how to combine backend auth and frontend game logic using modern JavaScript tooling.

**Research Questions**

Not applicable. Instead, the repository addresses engineering questions such as:
- How to securely authenticate users for a web-based game.
- How to structure frontend code to separate API concerns from UI.
- How to implement deterministic grid movement and gamified mechanics in React.

**Research Hypotheses**

Not applicable.

**Research Methodology**

Implementation approach used:
- Iterative development with small modules.
- Backend: express controllers and routes; Mongoose models for persistence.
- Frontend: component-driven design; usecases and repositories for API interaction; a dedicated hook (`useGameEngine`) for game state.

**Ethical Considerations**

The project stores minimal user data (username, email, hashed password). Best practices used:
- Passwords hashed with `bcrypt` before storage.
- JWTs created with a secret key. Developers should keep `JWT_SECRET` private and rotate when necessary.
- No collection of behavioural or sensitive data beyond basic account info.

**Literature Review**

Not applicable. The project is a software prototype using widely adopted libraries; references are standard library documentation (React, Express, Mongoose, Axios).

**Case Study 1: Use of Markerless Pose Estimation in Sports Biomechanics**

Not applicable.

**Case Study 2: Deep-Learning Based Video Analysis for Cricket Bowling Segmentation and Tracking of Deliveries**

Not applicable.

**Case Study 3: AI & Computer Vision in General Sports Biomechanics for Injury Prevention**

Not applicable.

**Integration of Tools and Technologies in Model Design and Development**

This section lists and explains the tools actually used in this project and how they are integrated.

- Frontend stack:
  - React: component-based UI used for pages, components and hooks; main app mounted in `main.jsx`.
  - Vite: development server and build tool (fast hot reload).
  - React Router: client-side routing and route protection via `RequireAuth`.
  - Axios: HTTP client used in `apiClient.js` to call backend endpoints.
  - Repository pattern: `AuthRepositoryImpl` encapsulates API calls for authentication; used by domain usecases (`loginUser`, `registerUser`).

- Backend stack:
  - Express: minimal web framework to expose `POST /api/auth/register` and `POST /api/auth/login`.
  - Mongoose: models and connection to MongoDB for user storage.
  - bcrypt: password hashing for secure storage.
  - jsonwebtoken (JWT): token generation for stateless authentication.
  - dotenv: environment variable management.

**Pose Estimation & Biomechanical Analysis Framework**

Not applicable.

**Backend & Data Processing Layer**

Details of implemented backend pieces:
- `server.js` loads environment variables and starts the Express app.
- `src/app.js` configures CORS (allowed `CLIENT_URL`), JSON parsing and mounts auth routes.
- `src/controllers/authController.js` implements `register` and `login` flows: checks existing user, hashes password with `bcrypt`, persists with Mongoose, generates JWT via `generateToken`.
- `src/models/User.js` defines the user schema.
- Error handling middleware returns JSON error messages.

**Frontend & User Interface Integration**

Key UI components and how they work together:
- `router.jsx` defines routes and wraps protected pages with `RequireAuth` which reads `maze_auth_token` from `localStorage`.
- `LoginPage.jsx` and `SignupPage.jsx` (signup exists in code) use `loginUser` and `registerUser` usecases which call `AuthRepositoryImpl` to post to the API.
- `LevelSelectPage.jsx` lists levels (client-side data), shows preview tiles and navigates to `MazeGamePage`.
- `MazeGamePage.jsx` composes `HudBar`, `MazeRenderer`, and `Dpad`. Keyboard and touch inputs call `useGameEngine` actions.

**Machine Learning & Adaptive Feedback Module**

Not applicable. No ML or adaptive feedback was implemented.

**Findings**

From the implementation:
- Authentication: secure user creation and login works via Express + Mongoose + JWT.
- Game engine: a concise hook (`useGameEngine`) can encapsulate deterministic grid movement, timed mechanics, HP and collectible logic in React.
- UX: Combining keyboard and touch controls (D-pad) provides cross-device playability.

**Conclusion and future work**

Conclusions:
- The project successfully demonstrates a full-stack web app combining account-based auth and a client-side gamified maze.

Suggested future work:
- Persisting per-user progress, stars and level completion in the backend.
- Add session management and token refresh.
- Add analytics or telemetry (opt-in) to study play patterns.
- Add automated tests and CI pipeline.

**References**

- Project depends on documentation and best practices from the official guides of React, Vite, Express, Mongoose, Axios, bcrypt and jsonwebtoken.

**Appendix**

- GitHub link: (repository root)
- Video link: not provided.
- Ethical approval form: not applicable.
- Gantt chart: not applicable.
- System screenshots: available in `frontend/public/` if present.
