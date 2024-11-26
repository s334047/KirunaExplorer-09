import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Polygon } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Modal, Button, Form } from 'react-bootstrap';
import API from '../../API.mjs';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ModifyGeoreference(props) {
    const [mode, setMode] = useState(null);
    const [show, setShow] = useState(true);
    const [lat, setLat] = useState(67.8525);
    const [lng, setLng] = useState(20.2255);
    const [selectedArea, setSelectedArea] = useState(null)
    const [selectedPoint, setSelectedPoint] = useState()
    const [resetDrawing, setResetDrawing] = useState(false);
    const [errors, setErrors] = useState({});
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
const createClusterCustomIcon = (cluster) => {
        const count = cluster.getChildCount();

        // Stile personalizzato del cluster
        return L.divIcon({
            html: `<div style="
                background-color: #4285F4; /* Colore del cluster */
                color: white; /* Colore del testo */
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 2px solid white;
            ">
                ${count}
            </div>`,
            className: 'custom-cluster-icon', // Classe opzionale per ulteriori stili
            iconSize: L.point(40, 40), // Dimensione del cluster
        });
    };
    const redIcon =
        new L.Icon({
            iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
                  <path d="M12.5,0c-2.8,0-5,2.2-5,5c0,2.8,5,10.4,5,10.4s5-7.7,5-10.4C17.5,2.2,15.3,0,12.5,0z M12.5,9.8 c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S13.9,9.8,12.5,9.8z" fill="red"/>
                  <path d="M12.5,11.3c-4.1,0-7.5,3.4-7.5,7.5c0,5.1,7.5,19.7,7.5,19.7s7.5-14.6,7.5-19.7C20,14.7,16.6,11.3,12.5,11.3z" fill="red"/>
                </svg>
              `),
            iconSize: [35, 35],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
    const navigate = useNavigate();
    const [aree, setAree] = useState([]);
    const [docs, setDocs] = useState([]);
    useEffect(() => {
        const getAreas = async () => {
            const documents = await API.getAllDocs();
            setDocs(documents)
            const areas = await API.getAllAreas()
            setAree(areas)
        }
        getAreas()
    }, [])
    const handleChangeArea = (e) => {
        const selectedNome = e.target.value;
        const foundArea = aree.find(area => area.name === selectedNome);
        setSelectedArea(foundArea);
    }
    const handleChangeMode = (e) => {
        const { value } = e.target;
        setMode(value);
    }
    const handleSaveMode = () => {
        const newErrors = {};
        if (!mode) newErrors.mode = "The mode is mandatory.";
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            // Se ci sono errori, non proseguire
            return;
        }
        if (mode === 'Area' && !props.doc.area) {
            setMode('AreaNew')
        }
        if (mode === 'Area' && props.doc.area) {
            setSelectedArea(props.doc.area)
            setMode('AreaOld')
        }
        if (mode === 'Point' && props.doc.coordinate) {
            setSelectedPoint(props.doc.coordinate)
            setLat(props.doc.coordinate[0])
            setLng(props.doc.coordinate[1])
            setMode('PointOld')
        }
        if (mode === 'Point' && !props.doc.coordinate) {
            setMode('PointNew')
        }
        setShow(false)
    }
    const handleEdit = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const latlngs = layer.getLatLngs(); // Ottieni le nuove coordinate dell'area modificata
            const newPolygon = latlngs[0].map((latlng) => [latlng.lat, latlng.lng]);
            setSelectedArea(newPolygon); // Aggiorna lo stato con le nuove coordinate
        });
    };
    const handleMarkerDragEnd = (event) => {
        const newLatLng = event.target.getLatLng(); // Ottieni la nuova posizione del marker
        setLat(newLatLng.lat.toFixed(4))
        setLng(newLatLng.lng.toFixed(4))
        setSelectedPoint([newLatLng.lat, newLatLng.lng]); // Aggiorna lo stato con le nuove coordinate
    };
    const handleClose = () => {
        navigate("/")
    }
    const handleSave = () => {
        try {
            if (mode === 'PointOld') {
                API.modifyGeoreference(props.doc.title, selectedPoint, props.doc.coordinate, null, null)
            }
            if (mode === 'PointNew') {
                API.modifyGeoreference(props.doc.title, selectedPoint, null, null, null)
            }
            if (mode === 'AreaNew') {
                API.modifyGeoreference(props.doc.title, null, null, selectedArea.vertex, null)
            }
            if (mode === 'AreaOld') {
                API.modifyGeoreference(props.doc.title, null, null, selectedArea, props.doc.area)
            }
        } catch (error) {
            console.log(error)
        }
        navigate("/")
    }
    useEffect(() => {
        setSelectedPoint([lat, lng]);
    }, [lat, lng])
    return (
        <div style={{ display: 'flex', flex: 1, position: 'relative', height: '90vh' }}>
            {mode === "AreaNew" && <div style={{
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
            {mode === "AreaOld" && <div style={{
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
                    <Button variant="primary" onClick={handleSave} disabled={!selectedArea} style={{ backgroundColor: "#154109", borderColor: "#154109", flexGrow: 1 }}>Confirm</Button>{' '}
                    <Button variant="secondary" onClick={handleClose} style={{ flexGrow: 1 }}>Close</Button>
                </div>
            </div>}
            {(mode === "PointOld" || mode == "PointNew") && <div style={{
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
                    </Form.Group>
                    <Form.Group controlId="longitude" style={{ marginTop: '10px' }}>
                        <Form.Label>Longitude: {lng} </Form.Label>
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
                <Modal show={show} onHide={handleClose} centered>
                    <Modal.Header className="custom-modal" style={{ borderBottom: 'none' }} closeButton>
                        <Modal.Title style={{ color: "#154109" }}>Edit georeference</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ color: "#154109" }}><strong>Mode:</strong></Form.Label>
                                <Form.Select name="type" onChange={handleChangeMode} isInvalid={!!errors.mode}>
                                    <option value="">Select a mode</option>
                                    <option value="Point">Point</option>
                                    <option value="Area">Area</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.mode}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer style={{ paddingTop: '0.1rem', borderTop: 'none' }}>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            style={{ backgroundColor: "#154109", borderColor: "#154109" }}
                            onClick={handleSaveMode}
                        >
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
                {(mode === 'AreaOld') && <FeatureGroup key={resetDrawing ? 'reset' : 'normal'}>
                    <EditControl
                        position="topright"
                        onEdited={handleEdit}
                        draw={{
                            rectangle: false,
                            polyline: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polygon: false
                        }}
                        edit={{
                            edit: mode === 'AreaOld' ? {} : false,
                            remove: false
                        }}
                    />
                    {mode === "AreaOld" && props.doc.area && <Polygon positions={props.doc.area} color="red"></Polygon>}
                </FeatureGroup >}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Sources: Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
                />
                {mode === "AreaNew" && selectedArea && <Polygon positions={selectedArea.vertex} color="red"></Polygon>}
                {(mode === "PointOld" || mode === 'PointNew') && <MarkerClusterGroup showCoverageOnHover={false} disableClusteringAtZoom={16} iconCreateFunction={createClusterCustomIcon}>
                    {docs.filter(doc => doc.coordinate != null).filter(doc => doc.title != props.doc.title).map(doc => (
                        <Marker key={doc.title} position={doc.coordinate} eventHandlers={{
                            click: () => {
                                setSelectedPoint(doc.coordinate)
                                setLat(doc.coordinate[0])
                                setLng(doc.coordinate[1])
                            },
                        }}>
                        </Marker>
                    ))}
                                    {(mode === "PointOld" || mode === 'PointNew') && <Marker position={selectedPoint} draggable={true} icon={redIcon} eventHandlers={{ dragend: handleMarkerDragEnd }}></Marker>}
                </MarkerClusterGroup>}
            </MapContainer>
        </div>
    )
}

ModifyGeoreference.propTypes = {
    doc: PropTypes.object.isRequired,
};

export default ModifyGeoreference