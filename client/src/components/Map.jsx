import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, Polygon} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DocumentCard from './DocCard';
import API from '../../API.mjs';
import PropTypes from 'prop-types';


function MapViewer(props) {
    const navigate = useNavigate();
    const position = [67.8558, 20.2253];
    const bounds = [
        [67, 20],
        [68, 21]
    ];
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        const getDocs = async () => {
            const documents = await API.getAllDocs();
            setDocs(documents);
        };
        getDocs();
    }, []);

    const customIcon = new L.Icon({
        iconUrl: 'file.png',
        iconSize: [35, 35],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    const icons = {
        'Informative document': new L.Icon({ iconUrl: 'icon_doc_blue.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
        'Prescriptive document': new L.Icon({ iconUrl: 'icon_doc_green.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
        'Design document': new L.Icon({ iconUrl: 'icon_doc_orange.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
        'Technical document': new L.Icon({ iconUrl: 'icon_doc_red.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
        'Material effect': new L.Icon({ iconUrl: 'icon_doc_yellow.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34]}),
    };
    const getIconByType = (type) => icons[type];

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
                <LayersControl position="bottomright">
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

                {/* Marker Cluster Group */}
                <MarkerClusterGroup showCoverageOnHover={false} disableClusteringAtZoom={16} iconCreateFunction={createClusterCustomIcon}>
                    {docs.filter(doc => doc.coordinate != null).map(doc => (
                        <Marker key={doc.title} position={doc.coordinate} icon={getIconByType(doc.type)} eventHandlers={{
                            click: () => {
                                setSelectedDoc(doc);
                            },
                        }}>
                        </Marker>
                    ))}
                    {Array.from(documentsByArea.entries()).map(([areaKey, areaDocuments]) => {
                        const areaVertices = JSON.parse(areaKey);
                        const positions = generateNonOverlappingPositions(areaVertices, areaDocuments.length);

                        return (
                            <React.Fragment key={areaKey}>
                                {areaDocuments.map((document, index) => (
                                    <Marker key={document.id} position={positions[index]} icon={getIconByType(document.type)} eventHandlers={{
                                        click: () => {
                                            setSelectedDoc(document);
                                        },
                                    }}>
                                    </Marker>
                                ))}
                            </React.Fragment>
                        );
                    })}
                </MarkerClusterGroup>

                {/* Selected Area Polygon */}
                {selectedDoc && selectedDoc.area && (
                    <Polygon positions={selectedDoc.area} color="red"></Polygon>
                )}
                <Legend icons={icons} />
            </MapContainer>

            {/* Document Card */}
            {selectedDoc && (
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                }}>
                    <DocumentCard
                        selectedDoc={selectedDoc}
                        setSelectedDoc={setSelectedDoc}
                        setShowAddLink={props.setShowAddLink}
                        user={props.user}
                        excludeTitle={props.setTitle}
                    />
                </div>
            )}

            {/* Add Document Button */}
            {!selectedDoc && props.user.role === 'Urban Planner' && (
                <div style={{ position: 'absolute', bottom: '20px', left: '10px', zIndex: 1000 }}>
                    <Button
                        variant="light"
                        onClick={() => navigate("/addDoc")}
                        style={{
                            border: '2px solid gray',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: "100px"
                        }}
                    >
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ display: 'block', fontSize: '12px' }}>Add</span>
                            <span style={{ display: 'block', fontSize: '12px' }}>doc</span>
                        </div>
                        <i className="bi bi-file-earmark-plus fs-3" style={{ marginLeft: '15px' }}></i>
                    </Button>
                </div>
            )}

            {/* Add Area Button */}
            {!selectedDoc && props.user.role === 'Urban Planner' && (
                <div style={{ position: 'absolute', bottom: '80px', left: '10px', zIndex: 1000 }}>
                    <Button
                        variant="light"
                        onClick={() => navigate("/addArea")}
                        style={{
                            border: '2px solid gray',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: "100px"
                        }}
                    >
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ display: 'block', fontSize: '12px' }}>Draw</span>
                            <span style={{ display: 'block', fontSize: '12px' }}>area</span>
                        </div>
                        <i className="bi bi-bounding-box-circles fs-3" style={{ marginLeft: '15px' }}></i>
                    </Button>
                </div>
            )}
        </div>
    );
}

MapViewer.propTypes = {
    user: PropTypes.object.isRequired,
    setTitle: PropTypes.func.isRequired,
    setShowAddLink: PropTypes.func.isRequired,
};

function Legend({ icons }) {
    return (
        
            <Card style={{position: 'absolute', top: '15px', right: '15px', zIndex: 1000}}>
                <Card.Body>
                    <Card.Title>Legend:</Card.Title>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {Object.entries(icons).map(([type, icon]) => (
                            <div key={type} style={{ display: 'flex', alignItems: 'center', marginTop: '5px', marginBottom: '5px' }}>
                                <img src={icon.options.iconUrl} alt={type} style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                                <span>{type}</span>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        
    );
}

export default MapViewer;