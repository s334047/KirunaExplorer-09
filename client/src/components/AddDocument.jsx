import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Popup, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
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
    const [mode,setMode]=useState(null);
    const [show,setShow]=useState(true);
    const [selectedArea, setSelectedArea] = useState(null)
    const [selectedPoint, setSelectedPoint] = useState(null)
    const [formLink, setFormLink] = useState(null);
    const [formData, setFormData] = useState(null);
    const [resetDrawing, setResetDrawing] = useState(false);
    const aree = props.areas;
    const docs = props.documents;
    const navigate= useNavigate();

    const handleDrawCreated = (e) => {
        const layer = e.layer;
        if (layer instanceof L.Marker) {
            const latlng = layer.getLatLng()
            setSelectedPoint([latlng.lat, latlng.lng])
        };

    }
    const handleDeleteDraw = () => {
        setSelectedPoint(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);

    }
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
            if (selectedArea == null) {
              API.addDocument(formData.title, formData.stakeholders, formData.scale, formData.issuanceDate, formData.type, formData.language, formData.pages, selectedPoint, selectedArea, formData.description);
            } else {
               API.addDocument(formData.title, formData.stakeholders, formData.scale, formData.issuanceDate, formData.type, formData.language, formData.pages, selectedPoint, selectedArea.name, formData.description);
            }
            if (formLink.document != '' || formLink.type != '') {
              API.SetDocumentsConnection(formData.title, formLink.document, formLink.type);
            }
        
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
            {mode === 'Point' && <FeatureGroup key={resetDrawing ? 'reset' : 'normal'}>
                    <EditControl
                        position="topright"
                        onCreated={handleDrawCreated}
                        onDeleted={handleDeleteDraw}
                        draw={{
                            rectangle: false,
                            polyline: false,
                            circle: false,
                            circlemarker: false,
                            marker: !selectedPoint,
                            polygon:false
                        }}
                        edit={{
                            edit: false
                        }}
                    />
                </FeatureGroup >}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Sources: Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
                />
            <DescriptionComponent show={show} setShow={setShow} item={docs} setMode={setMode} setFormData={setFormData} setFormLink={setFormLink} />
        </MapContainer>
    </div>)
}

export default AddDocument