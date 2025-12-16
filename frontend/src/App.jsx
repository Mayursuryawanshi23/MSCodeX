import React, { Suspense, lazy, memo } from 'react'
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SkipToContent from './components/SkipToContent';

// Lazy load pages for better performance - speeds up initial load
// also attach a .preload method so links can trigger prefetch on hover/focus
const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

const Landing = lazyWithPreload(() => import('./pages/Landing'));
const Home = lazyWithPreload(() => import('./pages/Home'));
const NoPage = lazyWithPreload(() => import('./pages/NoPage'));
const SignUp = lazyWithPreload(() => import('./pages/SignUp'));
const Login = lazyWithPreload(() => import('./pages/Login'));
const Editor = lazyWithPreload(() => import('./pages/Editor'));

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
      <SkipToContent />
      <Suspense fallback={<LoadingFallback />}>
        <RouteHandler />
      </Suspense>
    </BrowserRouter>
  )
};

const RouteHandler = memo(() => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        {/* fixed route name to /editor/:id */}
        <Route path="/editor/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </>
  )
});

RouteHandler.displayName = 'RouteHandler';

export default App