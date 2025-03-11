import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserSignIn from "./Users/Controllers/UserSignIn";
import UserSignUp from "./Users/Controllers/UserSignup";
import Balance from "./Users/Balance";
function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/api/v1/user/signin" element={<UserSignIn />} /> 
        <Route path="/api/v1/user/signup" element={<UserSignUp />} />
        <Route path="/api/v1/user/signin/balance" element={<Balance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;