import { useState } from 'react';
import './App.css';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavHeader from './components/NavHeader';
import MapViewer from './components/Map';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'leaflet/dist/leaflet.css';
import './App.css'
import { DescriptionComponent } from './components/AddDescription';
import ListDocumentLink from './components/Link';


function App() {
  const [showAddDocument, setShowAddDocument] = useState(false); //state for showing the modal for adding a document description
  const [showAddLink,setShowAddLink]=useState(false) //state for showing the modal for linking documents
  const [documents,setDocument]=useState([]);
  const [excludeDoc,setExcludeDoc]=useState("");

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
          <MapViewer showAddDocument={showAddDocument} setShowAddDocument={setShowAddDocument} showAddLink={showAddLink} setShowAddLink={setShowAddLink} />
          <DescriptionComponent show={showAddDocument} setShow={setShowAddDocument}/>
          <ListDocumentLink item={documents} title={excludeDoc} show={showAddLink} setShow={setShowAddLink} />
          </>
        } />
      </Route>
    </Routes>
  )
}

export default App
