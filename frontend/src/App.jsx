import React, { Suspense } from 'react'
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Editor from './pages/Editor';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div className="h-screen bg-theme-bg flex items-center justify-center text-theme-text">Loading...</div>}>
          <RouteHandler />
        </Suspense>
      </BrowserRouter>
    </>
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