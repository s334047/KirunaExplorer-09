import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Popup,FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import API from '../../API.mjs';


function MapViewer(props) {
    const [drawingMode,setDrawingMode]=useState(false)
    const [selectedArea,setSelectedArea] = useState(null)
    const [selectedPoint,setSelectedPoint]=useState(null)
    const [areaName,setAreaName]=useState(null);
    const [areaToDraw,setAreaToDraw]=useState(null);
    const [resetDrawing, setResetDrawing] = useState(false); 
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
    const aree=props.areas;
    const docs= props.documents;
      
    const customIcon = new L.Icon({
        iconUrl: 'file.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    const areaIcon = new L.Icon({
        iconUrl: 'drawing.svg',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    
    // this function create the area or the marker
    const handleDrawCreated = (e) =>{
        const layer = e.layer;
        if (layer instanceof L.Marker) {
            const latlng=layer.getLatLng()
            setSelectedPoint(latlng)
            props.setSelectedPoint([latlng.lat,latlng.lng])
        };
        if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs();
            const newPolygon = latlngs[0].map((latlng) => [latlng.lat, latlng.lng]);
            setSelectedArea(newPolygon);
        }
    
    }
    // this function close the mode for selecting an area or a point for a new document resetting all parameters
    const handleCloseSelectArea = ()=>{
        props.setMode("")
        props.setSelectedPoint(null)
        props.setSelectedArea(null)
        setSelectedArea(null)
        setSelectedPoint(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
    }
    const [selectedDoc, setSelectedDoc] = useState(null);
    const { BaseLayer } = LayersControl;
    const [polygons, setPolygons] = useState(() => {
        // Carica i poligoni salvati da localStorage
        const savedPolygons = localStorage.getItem("polygons");
        return savedPolygons ? JSON.parse(savedPolygons) : [];
    });
    // this function handle the change in selecting an area for a new document
    const handleChangeArea = (e) =>{
        const selectedNome = e.target.value;
        const foundArea = aree.find(area => area.name === selectedNome);
        setSelectedArea(foundArea);
        props.setSelectedArea(foundArea)
    }
      // this function saves an area for a new document
    const handleSaveArea = ()=>{
        setSelectedArea(null)
        props.handleSaveNew()
        props.setMode(null)
    }
    // this function saves a point for a new document
    const handleSavePoint = () =>{
        props.handleSaveNew()
        props.setMode(null)
        setSelectedPoint(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
    }
    // this function handle the change of a name for a new area
    const handleChangeName=(e)=>{
        setAreaName(e.target.value);
    }
    // this function saves the name and the coordinates for a new area
    const handleSaveName = async() =>{
        setDrawingMode(false);
        await API.addArea(areaName,selectedArea);
        setSelectedArea(null)
        setAreaName(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
    }
    // this function close the mode for drawing an area resetting all paramaters
    const handleCloseName = () =>{
        setDrawingMode(false);
        setSelectedArea(null)
        setAreaName(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
    }
    //this function reset the parameter when cleaning a point or area for inserting a new one
    const handleDeleteDraw = () =>{ 
        setSelectedArea(null)
        setSelectedPoint(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
       
    }
    return (
        <div style={{ display: 'flex', flex: 1, position: 'relative', height: '90vh' }}>
            {props.mode === "Area" &&  <div style={{ 
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
              <div style={{display: 'flex', marginTop: '10px',gap:"5px" }}>
                        <Button variant="primary" onClick={handleSaveArea} disabled={!selectedArea} style={{ backgroundColor: "#154109", borderColor:"#154109",flexGrow: 1}}>Confirm</Button>{' '}
                        <Button variant="secondary" onClick={handleCloseSelectArea} style={{flexGrow: 1}}>Close</Button>
                    </div>
              </div>}
              {props.mode === "Point" && <div style={{ 
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
              <div style={{display: 'flex', marginTop: '10px',gap:"5px" }}>
                        <Button variant="primary" onClick={handleSavePoint} disabled={!selectedPoint} style={{ backgroundColor: "#154109", borderColor:"#154109",flexGrow: 1}}>Confirm</Button>{' '}
                        <Button variant="secondary" onClick={handleCloseSelectArea} style={{flexGrow: 1}}>Close</Button>
                    </div>
              </div>}
              {drawingMode &&  <div style={{ 
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
              <div style={{display: 'flex', marginTop: '10px', gap:"5px" }}>
                        <Button variant="primary" onClick={handleSaveName} disabled={areaName === null || selectedArea === null} style={{ backgroundColor: "#154109", borderColor:"#154109",flexGrow: 1}}>Confirm</Button>{' '}
                        <Button variant="secondary" onClick={handleCloseName} style={{flexGrow: 1}}>Close</Button>
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
                 <FeatureGroup key={resetDrawing ? 'reset' : 'normal'}>
                 {(drawingMode===true || props.mode === "Point")  && <EditControl
                    position="topright"
                    onCreated={handleDrawCreated}
                    onDeleted={handleDeleteDraw}
                    draw={{
                        rectangle: false,
                        polyline: false,
                        circle: false,
                        circlemarker: false,
                        marker:props.mode === "Point" && selectedPoint == null,
                        polygon : drawingMode && selectedArea == null
                    }}
                    edit={{
                        edit: false
                    }}
                />}
                </FeatureGroup >
                 {drawingMode===false && !props.mode && <LayersControl position="topright">
                    <BaseLayer name="Street">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    </BaseLayer>
                    <BaseLayer checked name="Satellite">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Sources: Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
                        />
                    </BaseLayer>
                </LayersControl>}
                {(drawingMode===true || props.mode )&&           <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Sources: Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
                        />}
                {/*<MapWithDraw polygons={polygons} setPolygons={setPolygons} />*/}
                {drawingMode===false && !props.mode && docs.filter(doc=>doc.coordinate!=null).map(doc => (
                   <Marker key={doc.title} position={doc.coordinate} icon={customIcon} eventHandlers={{
                        click: () => {
                            setAreaToDraw(null);
                            setSelectedDoc(doc);
                        },
                    }}>
                    </Marker>
                ))}
                {drawingMode===false && !props.mode && aree.map(area => (
                   <Marker key={area.name} position={L.polygon(area.vertex).getBounds().getCenter()} icon={areaIcon} eventHandlers={{
                        /*click: async () => {
                            setAreaToDraw(area);
                            const docTitle = await API.getAreasDoc(area.name);
                            const doc = docs.find(item=>item.title == docTitle);
                            setSelectedDoc(doc)
                        },*/
                        click: () => {
                            setAreaToDraw(area);
                            setSelectedDoc(null);
                        },
                        
                    }}>
                    {<PopUpAea area={areaToDraw} documents={docs} setSelectedDoc={setSelectedDoc} setArea={setAreaToDraw}></PopUpAea>}
                    </Marker>
                ))}
                {areaToDraw != null && <Polygon positions={areaToDraw.vertex} color="red"></Polygon>}
                {props.mode ==="Area"  && selectedArea && <Polygon positions={selectedArea.vertex}></Polygon>}
            </MapContainer>

            {selectedDoc && (
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                }}>
                    <DocumentCard selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} setShowAddLink={props.setShowAddLink} user={props.user} excludeTitle={props.setTitle} setArea={setAreaToDraw}/>
                </div>
            )}
            {/*Only a Urban Planner can add a document, see props.user.role*/}
            {!selectedDoc && drawingMode===false && !props.mode && props.user.role === 'Urban Planner' &&  <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000 }}>
                <Button variant="light" onClick={() => {props.setShowAddDocument(true);setAreaToDraw(null)}} style={{ border: '2px solid gray', display: 'flex',justifyContent: 'center', alignItems: 'center', width:"100px" }}>
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '12px' }}>Add</span>
                        <span style={{ display: 'block', fontSize: '12px' }}>doc</span>
                    </div>
                    <i className="bi bi-file-earmark-plus fs-3" style={{ marginLeft: '15px' }}></i>
                </Button>
            </div>}
            {!selectedDoc && drawingMode===false && !props.mode && props.user.role === 'Urban Planner' && <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <Button variant="light" onClick={() => {setDrawingMode(true);setAreaToDraw(null)}} style={{ border: '2px solid gray', display: 'flex', justifyContent: 'center', alignItems: 'center', width:"100px" }}>
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '12px' }}>Draw</span>
                        <span style={{ display: 'block', fontSize: '12px' }}>area</span>
                    </div>
                    
                    <i className="bi bi-bounding-box-circles fs-3" style={{ marginLeft: '15px' }}></i>
                </Button>
            </div>}



        </div>
    );
}

function DocumentCard({ selectedDoc, setSelectedDoc, setShowAddLink, user,excludeTitle,setArea }) {
    const [n,setN]=useState(0);
    useEffect(()=>{
        const getNConnection= async()=>{
            const n=await API.GetDocumentConnections(selectedDoc.title);
            setN(n);
        }
        getNConnection();
    },[selectedDoc])
    return (
        <Card className="document-card">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={{ flex: 1 }} />
                    <button
                        className="btn btn-close"
                        onClick={() => {setSelectedDoc(null);
                            setArea(null)
                        }}
                        aria-label="Close"
                    />
                </div>
                <Row >
                    <Col md={6} >
                        <ul style={{ listStyleType: 'none', paddingLeft: '30px' }}>
                            <li><strong>Title:</strong> {selectedDoc.title}</li>
                            <li><strong>Stakeholder:</strong> {selectedDoc.stakeholder}</li>
                            <li><strong>Scale:</strong> {selectedDoc.scale}</li>
                            <li><strong>Date:</strong> {selectedDoc.date}</li>
                            <li><strong>Type:</strong> {selectedDoc.type}</li>
                            <li>
                                <strong>Connections:</strong> {n}
                                {user.role === 'Urban Planner' && <a
                                    href="#"
                                    style={{
                                        textDecoration: 'underline',
                                        color: 'green',
                                        marginLeft: '5px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        setShowAddLink(true);
                                        excludeTitle(selectedDoc.title)
                                    }}
                                >
                                    <i className="bi bi-plus-circle-fill"></i>
                                </a>}
                            </li>
                            <li><strong>Language:</strong> {selectedDoc.language}</li>
                            {selectedDoc.coordinate != null && <li><strong>Coordinates:</strong> {selectedDoc.coordinate[0]} N, {selectedDoc.coordinate[1]} E </li>}
                        </ul>
                    </Col>
                    <Col md={6}>
                        <ul style={{ listStyleType: 'none', paddingRight: '30px' }}>
                            <li><strong>Description:</strong><br />{selectedDoc.description}</li>
                        </ul>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
function PopUpAea ({area,documents, setSelectedDoc,setArea}){
    const [docs,setDocs]=useState([]);
    useEffect(()=>{
        const getAreaDocs= async()=>{
            if(area){
                const doc=await API.getAreasDoc(area.name);
                setDocs(doc)
            }
        }
        getAreaDocs();
    },[area])

    const handleChange=(e)=>{
        const doc=e.target.value;
        const filtered=documents.filter(item=>item.title==doc);
        setSelectedDoc(filtered[0])
    }

    return(
        <Popup  className="area-popup" closeButton={false} eventHandlers={{remove:()=>{setArea(null)}}}>
            <Form.Group className="mb-3">
                <Form.Label className="custom-label-color" style={{ fontWeight: 'bold' }}>Docs:</Form.Label>
                <Form.Select
                  name="docs"
                  onChange={handleChange}
                >
                  <option value="">Select a doc</option>
                  {docs.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
                </Form.Select>
              </Form.Group>
      </Popup>
    )
}

function showCardForArea(area, setSelectedDoc){
    const doc = API.getAreasDoc(area.name);
    setSelectedDoc(doc);
}

export default MapViewer;