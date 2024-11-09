import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Popup, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Card, Button, Row, Col, Form } from 'react-bootstrap';
import API from '../../API.mjs';
import { useNavigate } from 'react-router-dom';


function MapViewer(props) {
    const navigate=useNavigate();
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
    const aree = props.areas;
    const docs = props.documents;

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
    const documentsByArea = new Map();

    docs.filter(doc => doc.coordinate == null).forEach((doc) => {
        const areaKey = JSON.stringify(doc.area);
        if (!documentsByArea.has(areaKey)) {
            documentsByArea.set(areaKey, []);
        }
        documentsByArea.get(areaKey)?.push(doc);
    });
    function generateNonOverlappingPositions(vertices, count) {
        const bounds = L.latLngBounds(vertices);
        const positions = [];
        const padding = 0.0001; // Distanza minima tra i marker
    
        for (let i = 0; i < count; i++) {
            // Posizionamento radiale per evitare sovrapposizioni
            const angle = (i / count) * 2 * Math.PI;
            const offsetX = padding * Math.cos(angle);
            const offsetY = padding * Math.sin(angle);
            const center = bounds.getCenter();
            
            positions.push([center.lat + offsetX, center.lng + offsetY]);
        }
    
        return positions;
    }
    const [selectedDoc, setSelectedDoc] = useState(null);
    const { BaseLayer } = LayersControl;
    return (
        <div style={{ display: 'flex', flex: 1, position: 'relative', height: '90vh' }}>
            <MapContainer
                center={position}
                minZoom={12}
                zoom={13}
                maxBounds={bounds}
                style={{ flex: 1, height: "100%", width: "100%", borderRadius: '10px' }}
                scrollWheelZoom={false}
            >
                 <LayersControl position="topright">
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
                </LayersControl>
                 {docs.filter(doc => doc.coordinate != null).map(doc => (
                    <Marker key={doc.title} position={doc.coordinate} icon={customIcon} eventHandlers={{
                        click: () => {
                            setSelectedDoc(doc);
                        },
                    }}>
                    </Marker>
                ))}
  {Array.from(documentsByArea.entries()).map(([areaKey, areaDocuments]) => {
    const areaVertices = JSON.parse(areaKey);

    // Crea posizioni per i documenti nell'area in modo da non sovrapporli
    const positions = generateNonOverlappingPositions(areaVertices, areaDocuments.length);

    return (
        <React.Fragment key={areaKey}>
            {areaDocuments.map((document, index) => (
                <Marker key={document.id} position={positions[index]} icon={customIcon} eventHandlers={{
                    click: () => {
                        setSelectedDoc(document);
                    },
                }}>
                </Marker>
            ))}
        </React.Fragment>
    );
    })}
                {selectedDoc && selectedDoc.area && <Polygon positions={selectedDoc.area} color="red"></Polygon>}
            </MapContainer>

            {selectedDoc && (
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                }}>
                    <DocumentCard selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} setShowAddLink={props.setShowAddLink} user={props.user} excludeTitle={props.setTitle} />
                </div>
            )}
            {/*Only a Urban Planner can add a document, see props.user.role*/}
            {!selectedDoc  && props.user.role === 'Urban Planner' && <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000 }}>
                <Button variant="light" onClick={() => { navigate("/addDoc") }} style={{ border: '2px solid gray', display: 'flex', justifyContent: 'center', alignItems: 'center', width: "100px" }}>
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '12px' }}>Add</span>
                        <span style={{ display: 'block', fontSize: '12px' }}>doc</span>
                    </div>
                    <i className="bi bi-file-earmark-plus fs-3" style={{ marginLeft: '15px' }}></i>
                </Button>
            </div>}
            {!selectedDoc && props.user.role === 'Urban Planner' && <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <Button variant="light" onClick={() => {navigate("/addArea") }} style={{ border: '2px solid gray', display: 'flex', justifyContent: 'center', alignItems: 'center', width: "100px" }}>
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

function DocumentCard({ selectedDoc, setSelectedDoc, setShowAddLink, user, excludeTitle}) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const getNConnection = async () => {
            const n = await API.GetDocumentConnections(selectedDoc.title);
            setN(n);
        }
        getNConnection();
    }, [selectedDoc])
    return (
        <Card className="document-card">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={{ flex: 1 }} />
                    <button
                        className="btn btn-close"
                        onClick={() => {
                            setSelectedDoc(null);
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

export default MapViewer;