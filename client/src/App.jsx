import { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Alert } from 'react-bootstrap';
import NavHeader from './components/NavHeader';
import MapViewer from './components/Map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import ListDocumentLink from './components/Link';
import LoginComponent from './components/Auth';
import AddArea from './components/AddArea';
import API from '../API.mjs'
import AddDocument from './components/AddDocument';
import DocumentTable from './components/ListDocuments';
import ModifyGeoreference from './components/ModifyGeorefernce';

function App() {
  const [showAddLink, setShowAddLink] = useState(false) //state for showing the modal for linking documents
  const [excludeDoc, setExcludeDoc] = useState({});
  const[message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({})
  const [showLoginModal, setShowLoginModal] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    API.getUserInfo()
        .then(user => {
            setLoggedIn(true);
            setUser(user); 
        }).catch(e => {
            if(loggedIn)
                setFeedbackFromError(e);
            setLoggedIn(false); 
            setUser('');
        });
}, []);


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setShowLoginModal(false);
      setMessage({msg: `Benvenuto, ${user.username}!`, type:'success'});
      setUser(user);
      setAuthFailed(false);
    } catch (err) {
      setMessage({msg:`Incorrect username or password`, type: 'alert'});
    }
  };
  const handleLogout = async () => {
    await API.logOut();
    setShowAddLink(false)
    setUser('');
    setLoggedIn(false);
    setMessage('');
    nav('/');
  };

  return (
    <Routes>
      <Route element={
        <>
          <NavHeader loggedIn={loggedIn} logout={handleLogout} setShow={() => setShowLoginModal(true)}/>
          <Container fluid className='mt-3 justify-content-center align-items-center'>
            <Outlet />
          </Container>
        </>
      }>
        <Route index element={<>
          <MapViewer user={user}  setTitle={setExcludeDoc}  showAddLink={showAddLink} setShowAddLink={setShowAddLink}/>
          <ListDocumentLink title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
          <LoginComponent message={message} login={handleLogin} show={showLoginModal} setShow={setShowLoginModal}/>
        </>
        }
        >
        </Route>
        <Route path='/addArea' element={<AddArea/>}/>
        <Route path='/addDoc' element={<AddDocument/>}/>
        <Route path='/modifyGeoreference' element={<ModifyGeoreference doc={excludeDoc}/>}/>

        {user.role === 'Urban Planner' && <Route path='/documents' element={<>
          <DocumentTable user={user} setTitle={setExcludeDoc} showAddLink={showAddLink}setShowAddLink={setShowAddLink}/>
          <ListDocumentLink  title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
          </>
          }></Route>}
      </Route>
    </Routes>
  );
}

export default App;
