import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, useMap,FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Card, Button, Row, Col, Form } from 'react-bootstrap';


/*function MapWithDraw({ polygons, setPolygons }) {
    const map = useMap();

    useEffect(() => {
        // Controlla se leaflet-draw è stato caricato correttamente
        if (L.Control.Draw === undefined) {
            console.error("Leaflet-draw non è stato caricato correttamente.");
            return;
        }

        // Inizializza il controllo di disegno una sola volta
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            position: 'bottomright',
            draw: {
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false,
                polygon: true,
            }
        });

        map.addControl(drawControl);
        // Aggiungi un poligono disegnato al FeatureGroup e salva i suoi dati
        map.on(L.Draw.Event.CREATED, (event) => {
            const { layer } = event;
            const latlngs = layer.getLatLngs(); // Ottieni i punti del poligono

            // Aggiungi il poligono al gruppo di disegno
            drawnItems.addLayer(layer);

            // Salva il poligono nello stato
            const newPolygon = latlngs[0].map((latlng) => [latlng.lat, latlng.lng]);
            setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);

            // Aggiorna anche il localStorage
            localStorage.setItem("polygons", JSON.stringify([...polygons, newPolygon]));
        });

        // Carica i poligoni salvati
        polygons.forEach((polygonCoords) => {
            const polygon = L.polygon(polygonCoords);
            drawnItems.addLayer(polygon);
        });

        // Aggiungi il layer quando un nuovo poligono viene disegnato
        map.on(L.Draw.Event.CREATED, (event) => {
            const { layer } = event;
            drawnItems.addLayer(layer);
        });

        // Pulisci il controllo quando il componente viene smontato
        return () => {
            map.removeControl(drawControl);
        };
    }, []);
    return null;
}*/

function MapViewer(props) {
    const [drawingMode,setDrawingMode]=useState(false)
    const [selectedArea,setSelectedArea] = useState(null)
    const [selectedPoint,setSelectedPoint]=useState(null)
    const [areaName,setAreaName]=useState(null);
    const [resetDrawing, setResetDrawing] = useState(false); 
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
    const aree = [
        {
            nome: "Area 1",
            vertici: [
                [67.8565, 20.2250],
                [67.8570, 20.2270],
                [67.8550, 20.2275],
                [67.8545, 20.2260],
                [67.8550, 20.2245],
            ]
        },
        {
            nome: "Area 2",
            vertici: [
                [67.8580, 20.2240],
                [67.8585, 20.2260],
                [67.8570, 20.2275],
                [67.8560, 20.2265],
                [67.8555, 20.2255],
                [67.8560, 20.2240],
            ]
        },
        {
            nome: "Area 3",
            vertici: [
                [67.8555, 20.2230],
                [67.8555, 20.2255],
                [67.8540, 20.2265],
                [67.8535, 20.2245],
                [67.8540, 20.2230],
            ]
        },
        {
            nome: "Area 4",
            vertici: [
                [67.8570, 20.2265],
                [67.8580, 20.2280],
                [67.8565, 20.2290],
                [67.8555, 20.2280],
                [67.8555, 20.2270],
            ]
        },
        {
            nome: "Area 5",
            vertici: [
                [67.8535, 20.2230],
                [67.8530, 20.2250],
                [67.8520, 20.2250],
                [67.8525, 20.2235],
                [67.8535, 20.2225],
            ]
        }
    ];
    
      useEffect(()=>{console.log(selectedArea)},[selectedArea,selectedPoint])
      
    const customIcon = new L.Icon({
        iconUrl: 'file.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    // this function create the area or the marker
    const handleDrawCreated = (e) =>{
        const layer = e.layer;
        if (layer instanceof L.Marker) {
            setSelectedPoint(layer.getLatLng())
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
        setSelectedArea(null)
        setSelectedPoint(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
    }
    //FAKE DOCUMENT, USE THE API that get docuemnts with coordinates or areas, to put them on the map
    const documents = [
        {
            id: 1,
            title: 'Detail plan for square and commercial ',
            coordinate: [67.8558, 20.2253],
            stakeholder: "Kiruna kommun",
            scale: "1 : 1,000",
            date: "22/06/2016",
            type: "Prescriptive document",
            connections: "7",
            language: "Swedish",
            description: `This plan, approved in July 2016, is the first detailed
                            plan to be implemented from the new masterplan
                            (Adjusted development plan). The document
                            defines the entire area near the town hall, comprising
                            a total of 9 blocks known for their density.
                            Among these are the 6 buildings that will face the
                            main square. The functions are mixed, both public
                            and private, with residential being prominent, as
                            well as the possibility of incorporating accommodation
                            facilities such as hotels. For all buildings in this
                            plan, the only height limit is imposed by air traffic.`,
        }
    ];

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
        const foundArea = aree.find(area => area.nome === selectedNome);
        setSelectedArea(foundArea);
    }
      // this function saves an area for a new document
    const handleSaveArea = ()=>{
        props.setSelectedArea(selectedArea);
        setSelectedArea(null)
        props.handleSaveNew()
        props.setMode(null)
    }
    // this function saves a point for a new document
    const handleSavePoint = () =>{
        props.setSelectedPoint(selectedPoint);
        props.handleSaveNew()
        props.setMode(null)
        setSelectedPoint(null)
        setResetDrawing(true);
        setTimeout(() => setResetDrawing(false), 0);
    }
    // this function handle the change of a name for a new area
    const handleChangeName=(e)=>{
        setAreaName(e.value);
    }
    // this function saves the name and the coordinates for a new area
    const handleSaveName = () =>{
        setDrawingMode(false);
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
                <Form.Label className="custom-label-color" style={{ fontWeight: 'bold' }}>Area:</Form.Label>
                <Form.Select
                  name="area"
                  onChange={handleChangeArea}
                >
                  <option value="">Select an area</option>
                  {aree.map((item) => (
                <option key={item.nome} value={item.nome}>{item.nome}</option>
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
                <Form.Label className="custom-label-color">Name:</Form.Label>
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
                {drawingMode===false && !props.mode && documents.map(doc => (
                    <Marker key={doc.id} position={doc.coordinate} icon={customIcon} eventHandlers={{
                        click: () => {
                            setSelectedDoc(doc);
                        },
                    }}>
                    </Marker>
                ))}
                {props.mode ==="Area"  && selectedArea && <Polygon positions={selectedArea.vertici}></Polygon>}
            </MapContainer>

            {selectedDoc && (
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                }}>
                    <DocumentCard selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} setShowAddLink={props.setShowAddLink} user={props.user} />
                </div>
            )}
            {/*Only a Urban Planner can add a document, see props.user.role*/}
            {!selectedDoc && drawingMode===false && !props.mode && props.user.role === 'Urban Planner' &&  <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000 }}>
                <Button variant="light" onClick={() => props.setShowAddDocument(true)} style={{ border: '2px solid gray', display: 'flex', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '12px' }}>Add</span>
                        <span style={{ display: 'block', fontSize: '12px' }}>Document</span>
                    </div>
                    <img src="file.png" alt="Add" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                </Button>
            </div>}
            {!selectedDoc && drawingMode===false && !props.mode && props.user.role === 'Urban Planner' && <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <Button variant="light" onClick={() => setDrawingMode(true)} style={{ border: '2px solid gray', display: 'flex', alignItems: 'center', width:"120px" }}>
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '12px' }}>Draw</span>
                        <span style={{ display: 'block', fontSize: '12px' }}>Area</span>
                    </div>
                    <img src="drawing.png" alt="Draw" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                </Button>
            </div>}



        </div>
    );
}

function DocumentCard({ selectedDoc, setSelectedDoc, setShowAddLink, user }) {
    return (
        <Card className="document-card">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={{ flex: 1 }} />
                    <button
                        className="btn btn-close"
                        onClick={() => setSelectedDoc(null)}
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
                                <strong>Connections:</strong> {selectedDoc.connections}
                                {user.role === 'Urban Planner' && <a
                                    href="#"
                                    style={{
                                        textDecoration: 'underline',
                                        color: 'green',
                                        marginLeft: '5px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setShowAddLink(true)}
                                >
                                    <i className="bi bi-plus-circle-fill"></i>
                                </a>}
                            </li>
                            <li><strong>Language:</strong> {selectedDoc.language}</li>
                            <li><strong>Coordinates:</strong> {selectedDoc.coordinate[0]} N, {selectedDoc.coordinate[1]} E </li>
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

export default MapViewer;