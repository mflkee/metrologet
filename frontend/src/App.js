import React from 'react';
import AppRoutes from './routes';
import './styles/App.scss';

function App() {
  return (
    <div className="App">
      {/* Фоновая секция */}
      <header className="header">
          <h1 className="title">metrologet.mkair</h1>
      </header>
      <AppRoutes />
    </div>
  );
}

export default App;
