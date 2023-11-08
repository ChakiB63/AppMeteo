import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './screens/login/login';
import Home from './screens/home/home';

const App = () => {
  return (
    <Router>
    <Routes>
      <Route path="/" exact element={<Login/>} />
      <Route path="/home/:id_user" element={<Home/>} />
      </Routes>
    </Router>
  );
};

export default App;
