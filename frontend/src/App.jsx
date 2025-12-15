import React, { Suspense, lazy } from 'react'
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// Theme provider removed per request

// Lazy load pages for better performance - speeds up initial load
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const NoPage = lazy(() => import('./pages/NoPage'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Login = lazy(() => import('./pages/Login'));
const Editor = lazy(() => import('./pages/Editor'));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-gray-100">Loading...</div>}>
        <RouteHandler />
      </Suspense>
    </BrowserRouter>
  )
};

const RouteHandler = () => {
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
}

export default App