import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {createBrowserRouter,RouterProvider} from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// const router=createBrowserRouter([
// ])

createRoot(document.getElementById('root')).render(
    <App />
);