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

function App() {
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
        <Route index element={
          <MapViewer/>
        } />
      </Route>
    </Routes>
  )
}

export default App
