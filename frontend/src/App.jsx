import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import Login from "./pages/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Navbar } from "react-bootstrap";
import NavBar from "./components/NavBar";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <NavBar></NavBar>
      <Container>
        <Routes>
          <Route path="/" element={user ? <Chat></Chat> : <Login></Login>}></Route>
          <Route path="/register" element={user ? <Chat></Chat> : <Register></Register>}></Route>
          <Route path="/login" element={user ? <Chat></Chat> : <Login></Login>}></Route>
          <Route path="*" element={<Navigate to="/"></Navigate>}></Route>
        </Routes>
      </Container>
    </>
  );
}

export default App;
