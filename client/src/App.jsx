<<<<<<< HEAD
import { useState,useEffect } from 'react';
import './App.css';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavHeader from './components/NavHeader';
import MapViewer from './components/Map';
import 'bootstrap/dist/css/bootstrap.min.css';
=======
>>>>>>> 38475c77d9895a476704ed126983258a4741f71b
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
<<<<<<< HEAD
  const [showAddDocument, setShowAddDocument] = useState(false); //state for showing the modal for adding a document description
  const [showAddLink,setShowAddLink]=useState(false) //state for showing the modal for linking documents
  const [documents,setDocument]=useState([]);
  const [excludeDoc,setExcludeDoc]=useState("");
  const [mode,setMode]=useState("") // state for assigning an area or a point to a new document
  const [formLink, setFormLink] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedArea,setSelectedArea] = useState(null)
  const [selectedPoint,setSelectedPoint]=useState(null)
  const handleSaveNew = () => {
    console.log(formData)
    console.log(formLink)
    console.log(selectedArea)
    console.log(selectedPoint)
  }
  return (
    <Routes>
      <Route element={
        <>
          <NavHeader />
          <Container fluid className='mt-3 justify-content-center'>
            <Outlet />
          </Container>
        </>
      }>
        <Route index element={<>
          <MapViewer showAddDocument={showAddDocument} setShowAddDocument={setShowAddDocument} showAddLink={showAddLink} setShowAddLink={setShowAddLink} mode={mode} setMode={setMode} setSelectedArea={setSelectedArea} setSelectedPoint={setSelectedPoint} handleSaveNew={handleSaveNew}/>
          <DescriptionComponent show={showAddDocument} setShow={setShowAddDocument} item={documents} setMode={setMode} setFormData={setFormData} setFormLink={setFormLink}/>
          <ListDocumentLink item={documents} title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
=======
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
>>>>>>> 38475c77d9895a476704ed126983258a4741f71b
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
