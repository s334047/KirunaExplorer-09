import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { DescriptionComponent } from './components/AddDescription';
import ListDocumentLink from './components/Link';
import Login from './components/Login';
import MapViewer from './components/Map';
import NavHeader from './components/NavHeader';

function App() {
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [documents, setDocument] = useState([]);
  const [excludeDoc, setExcludeDoc] = useState("");
  const [mode, setMode] = useState("");
  const [formLink, setFormLink] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Logout function
  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleSaveNew = () => {
    console.log(formData);
    console.log(formLink);
    console.log(selectedArea);
    console.log(selectedPoint);
  };

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<Login setUser={setUser} />} />

      {/* Protected Routes */}
      {user && (
        <Route element={
          <>
            {/* Render NavHeader only if user is logged in */}
            <NavHeader user={user} onLogout={handleLogout} />
            <Container fluid className='mt-3 justify-content-center'>
              <Outlet />
            </Container>
          </>
        }>
          <Route index element={
            <>
              <MapViewer
                showAddDocument={showAddDocument}
                setShowAddDocument={setShowAddDocument}
                showAddLink={showAddLink}
                setShowAddLink={setShowAddLink}
                mode={mode}
                setMode={setMode}
                setSelectedArea={setSelectedArea}
                setSelectedPoint={setSelectedPoint}
                handleSaveNew={handleSaveNew}
              />
              <DescriptionComponent
                show={showAddDocument}
                setShow={setShowAddDocument}
                item={documents}
                setMode={setMode}
                setFormData={setFormData}
                setFormLink={setFormLink}
              />
              <ListDocumentLink
                item={documents}
                title={excludeDoc}
                show={showAddLink}
                setShow={setShowAddLink}
              />
            </>
          } />
        </Route>
      )}
    </Routes>
  );
}

export default App;
