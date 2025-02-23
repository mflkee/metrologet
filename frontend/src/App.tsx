import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import NodePage from './NodePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nodes/:nodeId" element={<NodePage />} />
      </Routes>
    </Router>
  );
};

export default App;
