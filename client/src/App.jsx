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
import DescriptionComponent from './components/AddDescription';
import ListDocumentLink from './components/Link';
import LoginComponent from './components/Auth';
import API from '../API.mjs'

function App() {
  const [showAddDocument, setShowAddDocument] = useState(false); //state for showing the modal for adding a document description
  const [showAddLink, setShowAddLink] = useState(false) //state for showing the modal for linking documents
  const [documents, setDocument] = useState([]);
  const [excludeDoc, setExcludeDoc] = useState("");
  const [mode, setMode] = useState("") // state for assigning an area or a point to a new document
  const [formLink, setFormLink] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const[message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState('')

  const nav = useNavigate();

  const handleSaveNew = () => {
    if(selectedArea == null){
      console.log(formData.title,formData.stakeholders,formData.scale,formData.issuanceDate,formData.type,formData.language,formData.pages,selectedPoint,formData.description)
      API.addDocument(formData.title,formData.stakeholders,formData.scale,formData.issuanceDate,formData.type,formData.language,formData.pages,selectedPoint,formData.description)
    }
    else if(selectedArea!=null){
      API.addDocument(formData.title,formData.stakeholders,formData.scale,formData.issuanceDate,formData.type,formData.language,formData.pages,selectedPoint,formData.description)
      console.log(formData.title, selectedArea.nome);
      API.addAreaToDoc(formData.title,selectedArea.nome)
    }
    setFormData(null);
    setFormLink(null);
    setSelectedArea(null)
    setSelectedPoint(null)
  }

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
      setMessage({ msg: `Benvenuto, ${user.username}!`, type: 'success' });
      setUser(user);
    } catch (err) {
      console.log(err);
      setMessage({ msg: err, type: 'danger' });
    }
  };
  const handleLogout = async () => {
    await API.logOut();
    setFormData(null);
    setFormLink(null);
    setSelectedArea(null)
    setSelectedPoint(null)
    setMode("")
    setShowAddDocument(false)
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
          <NavHeader loggedIn={loggedIn} logout={handleLogout}/>
          <Container fluid className='mt-3 justify-content-center align-items-center'>
          {message && <Row>
            <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
          </Row>}
            <Outlet />
          </Container>
        </>
      }>
        <Route index element={<>
          <MapViewer user={user} showAddDocument={showAddDocument} setShowAddDocument={setShowAddDocument} showAddLink={showAddLink} setShowAddLink={setShowAddLink} mode={mode} setMode={setMode} setSelectedArea={setSelectedArea} setSelectedPoint={setSelectedPoint} handleSaveNew={handleSaveNew} />
          <DescriptionComponent show={showAddDocument} setShow={setShowAddDocument} item={documents} setMode={setMode} setFormData={setFormData} setFormLink={setFormLink} />
          <ListDocumentLink item={documents} title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
        </>
        }
        >
        </Route>
        <Route path='/login' element={
          loggedIn ? <Navigate replace to='/' /> : <LoginComponent login={handleLogin} />
        } />
      </Route>
    </Routes>
  );
}

export default App;
