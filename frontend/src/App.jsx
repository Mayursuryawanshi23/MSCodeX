import React, { Suspense, lazy, memo } from 'react'
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Lazy load pages for better performance - speeds up initial load
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const NoPage = lazy(() => import('./pages/NoPage'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Login = lazy(() => import('./pages/Login'));
const Editor = lazy(() => import('./pages/Editor'));

// Loading fallback component
const LoadingFallback = memo(() => (
  <div className="h-screen bg-black flex items-center justify-center text-gray-100">
    <div className="text-center">
      <div className="animate-spin mb-4">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-green-400 rounded-full"></div>
      </div>
      <p>Loading...</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <RouteHandler />
      </Suspense>
    </BrowserRouter>
  )
};

const RouteHandler = memo(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return (
    <>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to={"/home"}/> : <Landing />} />
        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to={"/login"}/>} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editor" element={isLoggedIn ? <Editor /> : <Navigate to={"/login"}/>} />
        <Route path="/editior/:id" element={isLoggedIn ? <Editor /> : <Navigate to={"/login"}/>} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </>
  )
});

RouteHandler.displayName = 'RouteHandler';

export default App