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
  const [documents, setDocuments] = useState([]);
  const [excludeDoc, setExcludeDoc] = useState("");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route
        element={
          <>
            {user && <NavHeader />}
            <Container fluid className="mt-3 justify-content-center">
              <Outlet />
            </Container>
          </>
        }
      >
        <Route
          index
          element={
            <>
              <MapViewer
                showAddDocument={showAddDocument}
                setShowAddDocument={setShowAddDocument}
                showAddLink={showAddLink}
                setShowAddLink={setShowAddLink}
              />
              <DescriptionComponent show={showAddDocument} setShow={setShowAddDocument} item={documents} />
              <ListDocumentLink item={documents} title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
