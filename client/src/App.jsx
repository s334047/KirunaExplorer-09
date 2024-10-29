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
  const [show, setShow] = useState(false); //state for showing the modal for adding a document description
  const [showLink,setShowLink]=useState(false) //state for showing the modal for linking documents
  const [documents,setDocument]=useState([]);
  const [excludeDoc,setExcludeDoc]=useState("")
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseLink = () => setShowLink(false);
  const handleShowLink = () => setShowLink(true);
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
          <MapViewer handleShow={handleShow}/>
          <DescriptionComponent show={show} handleClose={handleClose}/>
          <ListDocumentLink item={documents} title={excludeDoc} show={showLink} handleClose={handleCloseLink}/>
          </>
        } />
      </Route>
    </Routes>
  )
}

export default App
