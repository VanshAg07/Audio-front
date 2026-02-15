import { Routes, Route } from 'react-router-dom';
import IdentifyingSongs from './pages/IdentifyingSongs';
import Listening from './pages/Listening';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<IdentifyingSongs />} />
      <Route path="/listening" element={<Listening />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
