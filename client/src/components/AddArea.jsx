import { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import {  Button,  Form } from 'react-bootstrap';
import API from '../../API.mjs';
import { useNavigate } from 'react-router-dom';

function AddArea(){
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
    const navigate= useNavigate();
    const [selectedArea, setSelectedArea] = useState(null)
    const [areaName, setAreaName] = useState(null);
    const [resetDrawing, setResetDrawing] = useState(false);
    const handleSaveName = async () => {
        await API.addArea(areaName, selectedArea);
        setSelectedArea(null)
        setAreaName(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
        navigate("/")
    }
    const handleChangeName = (e) => {
        setAreaName(e.target.value);
    }
    const handleCloseName = () => {
        setSelectedArea(null)
        setAreaName(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
        navigate("/");
    }
    const handleDrawCreated = (e) => {
        const layer = e.layer;
        if (layer instanceof L.Polygon) {
            const GeoJSON = layer.toGeoJSON();
            setSelectedArea(GeoJSON);
        }

    }
    const handleDeleteDraw = () => {
        setSelectedArea(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);

    }
    return(
        <div style={{ display: 'flex', flex: 1, position: 'relative', height: '90vh' }}>
        <div style={{
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
                <Form.Label className="custom-label-color">Insert the name for the new area:</Form.Label>
                <Form.Control
                    type="text"
                    name="scale"
                    onChange={handleChangeName}
                />
            </Form.Group>
            <div style={{ display: 'flex', marginTop: '10px', gap: "5px" }}>
                <Button variant="primary" onClick={handleSaveName} disabled={!areaName || selectedArea === null} style={{ backgroundColor: "#154109", borderColor: "#154109", flexGrow: 1 }}>Confirm</Button>{' '}
                <Button variant="secondary" onClick={handleCloseName} style={{ flexGrow: 1 }}>Close</Button>
            </div>
        </div>
        <MapContainer
                center={position}
                minZoom={12}
                zoom={13}
                maxBounds={bounds}
                style={{ flex: 1, height: "100%", width: "100%", borderRadius: '10px' }}
                scrollWheelZoom={false}
            >
                <FeatureGroup key={resetDrawing ? 'reset' : 'normal'}>
                    <EditControl
                        position="topright"
                        onCreated={handleDrawCreated}
                        onDeleted={handleDeleteDraw}
                        draw={{
                            rectangle: false,
                            polyline: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polygon:selectedArea == null
                        }}
                        edit={{
                            edit: false
                        }}
                    />
                </FeatureGroup >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Sources: Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
                />
        </MapContainer>
        </div>
    )
}
export  default AddArea