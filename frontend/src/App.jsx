import React from "react";
import { HashRouter   as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Model from "./pages/Model/Model";
import Result from "./pages/Results/Result";
import Login from "./pages/Login/Login";
import History from "./pages/History/History";
import ProtectedRoute from "./Components/Protected/ProtectedRoute";
import AutoLogout from "./Components/Autologout";

const App = () => {
  return (
    <>
      <Router>
        <AutoLogout />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/model" element={<ProtectedRoute><Model /></ProtectedRoute>}/>
          <Route path="/result" element={ <ProtectedRoute> <Result /> </ProtectedRoute>}/>
          <Route path="/history" element={ <ProtectedRoute> <History /> </ProtectedRoute>}/>
          <Route path="/login" element={<Login />}/>
        </Routes>
      </Router>
    </>
  );
};
  
export default App;
