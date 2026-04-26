// src/main.jsx
// React entry point — mounts the App to the DOM

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';  // Global styles must be imported first
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
