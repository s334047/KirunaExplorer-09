import { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import NavHeader from './components/NavHeader';
import MapViewer from './components/Map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'leaflet/dist/leaflet.css';
import ListDocumentLink from './components/Link';
import LoginComponent from './components/Auth';
import AddArea from './components/AddArea';
import API from '../API.mjs'
import AddDocument from './components/AddDocument';
import DocumentTable from './components/ListDocuments';
import ModifyGeoreference from './components/ModifyGeorefernce';
import TimelineDiagram from './components/Diagram';
import HomePage from './components/HomePage';

function App() {
  const [showAddLink, setShowAddLink] = useState(false) //state for showing the modal for linking documents
  const [excludeDoc, setExcludeDoc] = useState({});
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({})
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [connections, setConnections] = useState([]);

  const nav = useNavigate();
  const location = useLocation();

  const setFeedbackFromError = (error) => {
    setMessage( `Error: ${error.message}`);
  };

  useEffect(() => {
    API.getUserInfo()
      .then(user => {
        setLoggedIn(true);
        setUser(user);
      }).catch(e => {
        if (loggedIn)
          setFeedbackFromError(e);
        setLoggedIn(false);
        setUser({});
      });
  }, [loggedIn]);


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setShowLoginModal(false);
      setMessage(`Benvenuto, ${user.username}!`);
      setUser(user);
      nav(location.pathname || '/');
    } catch (err) {
      setMessage(`Incorrect username or password\n`);
    }
  };
  const handleLogout = async () => {
    await API.logOut();
    setShowAddLink(false)
    setUser({});
    setLoggedIn(false);
    setMessage('');
    nav(location.pathname || '/');
  };

  useEffect(() => {
    const fetchDocumentsAndConnections = async () => {
      try {
        const documents = await API.getAllDocs();
        setDocuments(documents);
        const allConnections = await API.GetConnections();
        setConnections(allConnections);
      } catch (error) {
        console.error('Error fetching documents and connections:', error);
      }
    };
    fetchDocumentsAndConnections();
  }, []);

  return (
    <Routes>
      <Route element={
        <>
          <NavHeader loggedIn={loggedIn} logout={handleLogout} setShow={() => setShowLoginModal(true)} />
            <Outlet />
        </>
      }>
        <Route path='/' element={<>
          <HomePage user={user}/>
          <LoginComponent message={message} login={handleLogin} show={showLoginModal} setShow={setShowLoginModal} />
        </>}/>
        <Route path='/map' element={<>
          <MapViewer user={user} setTitle={setExcludeDoc} showAddLink={showAddLink} setShowAddLink={setShowAddLink} />
          <ListDocumentLink title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
          <LoginComponent message={message} login={handleLogin} show={showLoginModal} setShow={setShowLoginModal} />
        </>
        }
        >
        </Route>
        <Route path='/addArea' element={<AddArea />} />
        <Route path='/addDoc' element={<AddDocument />} />
        <Route path='/modifyGeoreference' element={<ModifyGeoreference doc={excludeDoc} />} />
        <Route path='/diagram' element={<>
        <TimelineDiagram setTitle={setExcludeDoc} documents={documents} user={user} connections={connections}/>
        <LoginComponent message={message} login={handleLogin} show={showLoginModal} setShow={setShowLoginModal} />
        </>}/>

        <Route path='/documents' element={<>
          <DocumentTable user={user} setTitle={setExcludeDoc} showAddLink={showAddLink} setShowAddLink={setShowAddLink} />
          <LoginComponent message={message} login={handleLogin} show={showLoginModal} setShow={setShowLoginModal} />
          <ListDocumentLink title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
        </>
        }></Route>
      </Route>
    </Routes>
  );
}

export default App;
