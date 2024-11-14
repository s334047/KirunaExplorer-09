import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Popup, FeatureGroup, Polygon } from 'react-leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import API from '../../API.mjs';
import { useNavigate } from 'react-router-dom';
import DescriptionComponent from './AddDescription';


function AddDocument(props){
    
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
    const [lat,setLat]=useState(67.8525);
    const [lng,setLng]=useState(20.2255);
    const [mode,setMode]=useState(null);
    const [show,setShow]=useState(true);
    const [selectedArea, setSelectedArea] = useState(null)
    const [selectedPoint, setSelectedPoint] = useState([lat,lng])
    const [formLink, setFormLink] = useState([]);
    const [formData, setFormData] = useState(null);
    const [aree,setAree]=useState([]) 
    const [docs,setDocs]=useState([]); 
    const navigate= useNavigate();

    useEffect(()=>{
        const getDocsAreas = async()=>{
          const documents = await API.getAllDocs();
          setDocs(documents)
          const areas = await API.getAllAreas()
          setAree(areas)
        }
        getDocsAreas();
      },[]); 

    const handleChangeArea = (e) => {
        const selectedNome = e.target.value;
        const foundArea = aree.find(area => area.name === selectedNome);
        setSelectedArea(foundArea);
    }
    const handleClose =()=>{
        navigate("/")
    }
    const handleSave =()=>{
        try {
            if (mode === 'Point') {
              API.addDocument(formData.title, formData.stakeholders, formData.scale, formData.issuanceDate, formData.type, formData.language, formData.pages, selectedPoint, null, formData.description);
            } else if(mode === 'Area') {
               API.addDocument(formData.title, formData.stakeholders, formData.scale, formData.issuanceDate, formData.type, formData.language, formData.pages, null, selectedArea.name, formData.description);
            }
            
            formLink.forEach((link) => {
                API.SetDocumentsConnection(formData.title, link.document, link.type)
                  .catch((error) => {
                    console.error("Error submitting link:", error);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      submit: "An error occurred while submitting the links.",
                    }));
                  });
              });
            
        
            // Reset degli stati
            setFormData(null);
            setFormLink(null);
            setSelectedArea(null);
            setSelectedPoint(null);
        
          } catch (error) {
            console.error("Errore catturato in handleSaveNew:", error);
          }
        navigate("/")
    }
    useEffect(()=>{
        setSelectedPoint([lat,lng])
    },[lat,lng])
    const handleMarkerDragEnd = (event) => {
        const newLatLng = event.target.getLatLng(); // Ottieni la nuova posizione del marker
        setLat(newLatLng.lat.toFixed(4))
        setLng(newLatLng.lng.toFixed(4))
        setSelectedPoint([newLatLng.lat, newLatLng.lng]); // Aggiorna lo stato con le nuove coordinate
    };
    return(        
    <div style={{ display: 'flex', flex: 1, position: 'relative', height: '90vh' }}>
        {mode === "Area" && <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: '300px',
                backgroundColor: 'white', // Add a background for better visibility
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)' // Optional: shadow effect
            }}>
                <Form.Group className="mb-3">
                    <Form.Label className="custom-label-color" style={{ fontWeight: 'bold' }}>Areas already created:</Form.Label>
                    <Form.Select
                        name="area"
                        onChange={handleChangeArea}
                    >
                        <option value="">Select an area</option>
                        {aree.map((item) => (
                            <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <div style={{ display: 'flex', marginTop: '10px', gap: "5px" }}>
                    <Button variant="primary" onClick={handleSave} disabled={!selectedArea} style={{ backgroundColor: "#154109", borderColor: "#154109", flexGrow: 1 }}>Confirm</Button>{' '}
                    <Button variant="secondary" onClick={handleClose} style={{ flexGrow: 1 }}>Close</Button>
                </div>
            </div>}
            {mode === "Point" && <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: '300px',
                backgroundColor: 'white', // Add a background for better visibility
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)' // Optional: shadow effect
            }}>
                                    <Form>
                    <Form.Group controlId="latitude">
                <Form.Label>Latitude: {lat}</Form.Label>
                <Form.Range
                    min={67.8211}
                    max={67.8844}
                    step={0.0001}
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                />
            </Form.Group>

            <Form.Group controlId="longitude" style={{ marginTop: '10px' }}>
                <Form.Label>Longitude: {lng} </Form.Label>
                <Form.Range
                   min={20.1098}
                   max={20.3417}
                   step={0.0001}
                value={lng}
                    onChange={(e) => setLng(e.target.value)}
                />
            </Form.Group>
        </Form>
                <div style={{ display: 'flex', marginTop: '10px', gap: "5px" }}>
                    <Button variant="primary" onClick={handleSave} disabled={!selectedPoint} style={{ backgroundColor: "#154109", borderColor: "#154109", flexGrow: 1 }}>Confirm</Button>{' '}
                    <Button variant="secondary" onClick={handleClose} style={{ flexGrow: 1 }}>Close</Button>
                </div>
            </div>}
                <MapContainer
                center={position}
                minZoom={12}
                zoom={13}
                maxBounds={bounds}
                style={{ flex: 1, height: "100%", width: "100%", borderRadius: '10px' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Sources: Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
                />
             {mode === "Area" && selectedArea && <Polygon positions={selectedArea.vertex} color="red"></Polygon>}
             {mode === "Point" && selectedPoint && <Marker position={selectedPoint} draggable={true} eventHandlers={{dragend: handleMarkerDragEnd}}></Marker>}
            <DescriptionComponent show={show} setShow={setShow} item={docs} setMode={setMode} setFormData={setFormData} setFormLink={setFormLink} />
        </MapContainer>
    </div>)
}

export default AddDocument