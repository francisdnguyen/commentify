import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>  // Temporarily disabled to prevent double API calls in development
    <App />
  // </React.StrictMode>
);
