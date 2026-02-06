import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./presentation/pages/Auth/LoginPage.jsx";
import SignupPage from "./presentation/pages/Auth/SignupPage.jsx";
import GameLandingPage from "./presentation/pages/Home/GameLandingPage.jsx";
import LevelSelectPage from "./presentation/pages/LevelSelectPage.jsx";
import MazeGamePage from "./presentation/pages/MazeGamePage.jsx";
import RequireAuth from "./presentation/components/auth/RequireAuth.jsx";
import OptionsPage from "./presentation/pages/OptionsPage.jsx";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/home"
        element={
          <RequireAuth>
            <GameLandingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/levels"
        element={
          <RequireAuth>
            <LevelSelectPage />
          </RequireAuth>
        }
      />
      <Route
        path="/options"
        element={
          <RequireAuth>
            <OptionsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/game/:levelId"
        element={
          <RequireAuth>
            <MazeGamePage />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export default AppRouter;
