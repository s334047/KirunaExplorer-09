import { useState,useEffect } from 'react';
import './App.css';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavHeader from './components/NavHeader';
import MapViewer from './components/Map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'leaflet/dist/leaflet.css';
import { DescriptionComponent } from './components/AddDescription';
import ListDocumentLink from './components/Link';

function App() {
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
          </>
        }
      >
      </Route>
      </Route>
    </Routes>
  );
}

export default App;
