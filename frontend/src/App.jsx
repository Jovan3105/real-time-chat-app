import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import Login from "./pages/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Navbar } from "react-bootstrap";
import NavBar from "./components/NavBar";

function App() {

  return (
    <>
      <NavBar></NavBar>
      <Container className="text-secondary">
        <Routes>
          <Route path="/" element={<Chat></Chat>}></Route>
          <Route path="/register" element={<Register></Register>}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route path="*" element={<Navigate to="/"></Navigate>}></Route>
        </Routes>
      </Container>
    </>
  );
}

export default App;
