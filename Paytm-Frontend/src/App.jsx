import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserSignIn from "./Users/Controllers/UserSignIn";
import UserSignUp from "./Users/Controllers/UserSignup";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/signin" element={<UserSignIn />} /> 
        <Route path="/user/signup" element={<UserSignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;