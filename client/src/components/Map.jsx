import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { Card, Button, Row, Col } from 'react-bootstrap';

function MapViewer(props) {
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];

    const customIcon = new L.Icon({
        iconUrl: 'file.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

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

                

                {documents.map(doc => (
                    <Marker key={doc.id} position={doc.coordinate} icon={customIcon} eventHandlers={{
                        click: () => {
                            setSelectedDoc(doc);
                        },
                    }}>
                    </Marker>
                ))}

            </MapContainer>

            {selectedDoc && (
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                }}>
                    <DocumentCard selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />
                </div>
            )}

            {!selectedDoc && <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000 }}>
                <Button variant="light" onClick={props.handleShow} style={{ border: '2px solid gray', display: 'flex', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '12px' }}>Add</span>
                        <span style={{ display: 'block', fontSize: '12px' }}>Document</span>
                    </div>
                    <img src="file.png" alt="Add" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                </Button>
            </div>}



        </div>
    );
}

function DocumentCard({ selectedDoc, setSelectedDoc }) {
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
                            <li><strong>Connections:</strong> {selectedDoc.connections}</li>
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