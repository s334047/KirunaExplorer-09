import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker,Polygon} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Modal, Button, Form } from 'react-bootstrap';
import API from '../../API.mjs';
import { useNavigate } from 'react-router-dom';

function ModifyGeoreference(props){
    const [mode,setMode]=useState(null);
    const [show,setShow]=useState(true);
    const [lat,setLat]=useState(null);
    const [lng,setLng]=useState(null);
    const [selectedArea, setSelectedArea] = useState(null)
    const [selectedPoint, setSelectedPoint] = useState(null)
    const [resetDrawing, setResetDrawing] = useState(false);
    const [errors, setErrors] = useState({});
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
    const navigate= useNavigate();
    const aree = props.areas;
    const handleChangeArea = (e) => {
        const selectedNome = e.target.value;
        const foundArea = aree.find(area => area.name === selectedNome);
        setSelectedArea(foundArea);
    }
    const handleChangeMode = (e) => {
        const { _, value } = e.target;
        setMode(value);
      }
    const handleSaveMode = ()=>{
        const newErrors = {};
        if (!mode) newErrors.mode = "The mode is mandatory.";
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          // Se ci sono errori, non proseguire
          return;
        }
        if(mode === 'Area' && !props.doc.area){
            setMode('AreaNew')
        }
        if(mode === 'Area' && props.doc.area){
            setSelectedArea(props.doc.area)
            setMode('AreaOld')
        }
        if(mode === 'Point' && props.doc.coordinate){
            setSelectedPoint(props.doc.coordinate)
            setMode('PointOld')
        }
        if(mode === 'Point' && !props.doc.coordinate){
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
    const handleDrawCreated = (e) => {
        const layer = e.layer;
        if (layer instanceof L.Marker) {
            const latlng = layer.getLatLng()
            setSelectedPoint([latlng.lat, latlng.lng])
        };

    }
    const handleLatLng = (value, setCoordinate)=>{
        const isValidNumber = /^-?\d*\.?\d*$/;
        if (isValidNumber.test(value)) {
            setCoordinate(value); // Update state only if valid
        }
    }
    const handleMarkerDragEnd = (event) => {
        const newLatLng = event.target.getLatLng(); // Ottieni la nuova posizione del marker
        setSelectedPoint([newLatLng.lat, newLatLng.lng]); // Aggiorna lo stato con le nuove coordinate
    };
    const handleDeleteDraw = () => {
        setSelectedPoint(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
    }
    const handleClose =()=>{
        navigate("/")
    }
    const handleSave =()=>{
        try {
            if(mode === 'PointOld'){
                API.modifyGeoreference(props.doc.title,selectedPoint,props.doc.coordinate,null,null)
            }
            if(mode === 'PointNew'){
                API.modifyGeoreference(props.doc.title,selectedPoint,null,null,null)
            } 
            if(mode === 'AreaNew'){
                API.modifyGeoreference(props.doc.title,null,null,selectedArea.vertex,null)
            } 
            if(mode === 'AreaOld'){
                API.modifyGeoreference(props.doc.title,null,null,selectedArea,props.doc.area)
            } 
        } catch (error) {
            console.log(error)
        }
        navigate("/")
    }
    useEffect(()=>{
        if(lat && lng){
            setSelectedPoint([lat,lng]);
        }
        else if(mode === 'PointOld'){
            setSelectedPoint(props.doc.coordinate)
        }
    },[lat,lng])
    return(   
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
            {mode === "PointOld" && <div style={{
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
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                    type="number"

                    onChange={(e)=>{handleLatLng(e.target.value,setLat)}}
                    placeholder="Enter latitude"
                />
            </Form.Group>
            <Form.Group controlId="longitude" style={{ marginTop: '10px' }}>
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                    type="number"

                    onChange={(e)=>{handleLatLng(e.target.value,setLng)}}
                    placeholder="Enter longitude"
                />
            </Form.Group>
        </Form>
                <div style={{ display: 'flex', marginTop: '10px', gap: "5px" }}>
                    <Button variant="primary" onClick={handleSave} disabled={!selectedPoint} style={{ backgroundColor: "#154109", borderColor: "#154109", flexGrow: 1 }}>Confirm</Button>{' '}
                    <Button variant="secondary" onClick={handleClose} style={{ flexGrow: 1 }}>Close</Button>
                </div>
            </div>}
            {mode === "PointNew" && <div style={{
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
                    <Modal show={show} onHide={handleClose} centered>
          <Modal.Header className="custom-modal" style={{ borderBottom: 'none' }} closeButton>
          <Modal.Title style={{ color: "#154109" }}>Georeference</Modal.Title>
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
        <Modal.Footer style={{paddingTop: '0.1rem', borderTop: 'none' }}>
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
            {(mode === 'PointNew' || mode === 'AreaOld') && <FeatureGroup key={resetDrawing ? 'reset' : 'normal'}>
                    <EditControl
                        position="topright"
                        onCreated={handleDrawCreated}
                        onDeleted={handleDeleteDraw}
                        onEdited={handleEdit}
                        draw={{
                            rectangle: false,
                            polyline: false,
                            circle: false,
                            circlemarker: false,
                            marker: !selectedPoint && mode === 'PointNew' ,
                            polygon:false
                        }}
                        edit={{
                            edit: mode === 'AreaOld' ? {} : false, 
                            remove: mode === 'PointNew'
                        }}
                    />
                    {mode === "AreaOld" && props.doc.area && <Polygon positions={props.doc.area} color="red"></Polygon>}
                </FeatureGroup >}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Sources: Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
                />
                {mode === "AreaNew" && selectedArea && <Polygon positions={selectedArea.vertex} color="red"></Polygon>}
                {mode === "PointOld" && selectedPoint  && <Marker position={selectedPoint} draggable={true} eventHandlers={{dragend: handleMarkerDragEnd}}></Marker>}
        </MapContainer>
   </div>
    )
}
export default ModifyGeoreference