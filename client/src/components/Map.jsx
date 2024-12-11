import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, GeoJSON, useMap, Tooltip as LeafletTooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import { Button, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { DocumentCard } from './DocumentShowInfo';
import API from '../../API.mjs';
import propTypes from "prop-types";


function MoveMapToMarker({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
                map.setView(position, 17);
        }
    }, [position, map]);

    return null;
}

function MapViewer(props) {
    const navigate = useNavigate();
    const position = [67.8558, 20.2253];
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [documentsByArea, setDocumentsByArea] = useState(new Map());
    const [activePosition, setActivePosition] = useState(null);
    const location = useLocation();
    const documentId = location.state?.documentId;
    const markerClusterRef = useRef();
    const mapRef = useRef();

    useEffect(() => {
        const getDocs = async () => {
            const documents = await API.getAllDocs();
            setDocs(documents);
            const areaMap = new Map();

            documents.filter(doc => doc.area).forEach((doc) => {
                const areaKey = JSON.stringify(doc.area);
                if (!areaMap.has(areaKey)) {
                    areaMap.set(areaKey, []);
                }
                areaMap.get(areaKey)?.push(doc);
            });

            setDocumentsByArea(areaMap);
            if (documentId && documents.length > 0) {
  
                const doc = documents.find(d => d.id === documentId);

                if (doc) {
                    setSelectedDoc(doc);
                    if (doc.coordinate) {
                        setActivePosition({ lat: doc.coordinate[0], lng: doc.coordinate[1] });
                    }
                    else if (doc.area) {
                        const areaKey = JSON.stringify(doc.area);
                        const areaDocuments = areaMap.get(areaKey);
                        if (areaDocuments) {
                            const positions = generateNonOverlappingPositions(doc.area, areaDocuments.length);
                            const docIndex = areaDocuments.findIndex(d => d.id === doc.id);
                            if (docIndex !== -1) {
                                setActivePosition({
                                    lat: positions[docIndex][0],
                                    lng: positions[docIndex][1],
                                });
                            }
                        }
                    }
                }

            }
        };

        getDocs();
        navigate(location.pathname, { replace: true, state: null });
    }, []);
    const icons = {
        'Informative document': new L.Icon({ iconUrl: 'icon_doc_blue.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34] }),
        'Prescriptive document': new L.Icon({ iconUrl: 'icon_doc_green.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34] }),
        'Design document': new L.Icon({ iconUrl: 'icon_doc_orange.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34] }),
        'Technical document': new L.Icon({ iconUrl: 'icon_doc_red.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34] }),
        'Material effect': new L.Icon({ iconUrl: 'icon_doc_yellow.png', iconSize: [35, 35], iconAnchor: [12, 41], popupAnchor: [1, -34] }),
    };
    const getIconByType = (type, selectedDoc, docTitle) => {
        const baseIcon = icons[type];
        let size = baseIcon.options.iconSize; // Dimensione maggiore se selezionato
        let anchor = baseIcon.options.iconAnchor; // Ancoraggio adattato alla nuova dimensione
        if (selectedDoc) {
            if (selectedDoc.title === docTitle) {
                size = [50, 50];
                anchor = [25, 50];
            }
        }

        return new L.Icon({
            iconUrl: baseIcon.options.iconUrl, // URL originale
            iconSize: size,                   // Dimensione dinamica
            iconAnchor: anchor,               // Ancoraggio dinamico
            popupAnchor: baseIcon.options.popupAnchor, // Rimane invariato
        });
    };

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


    function generateNonOverlappingPositions(geojson, count) {
        // Estrai i vertici dalla geometria GeoJSON
        let vertices = [];
        if (geojson.type === "FeatureCollection") {
            geojson.features.forEach(feature => {
                vertices.push(...extractVertices(feature.geometry));
            });
        } else if (geojson.type === "Feature") {
            vertices = extractVertices(geojson.geometry);
        } else {
            vertices = extractVertices(geojson);
        }

        if (vertices.length === 0) {
            throw new Error("Il GeoJSON non contiene vertici validi.");
        }

        const bounds = L.latLngBounds(vertices.map(([lng, lat]) => L.latLng(lat, lng)));
        const positions = [];
        const padding = 0.0001; // Distanza minima tra i marker

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const offsetX = padding * Math.cos(angle);
            const offsetY = padding * Math.sin(angle);
            const center = bounds.getCenter();

            positions.push([center.lat + offsetX, center.lng + offsetY]);
        }

        return positions;
    }

    // Funzione di supporto per estrarre i vertici dalla geometria GeoJSON
    function extractVertices(geometry) {
        let vertices = [];

        switch (geometry.type) {
            case "Polygon":
                vertices = geometry.coordinates[0]; // Prendi il primo anello del poligono
                break;
            case "MultiPolygon":
                geometry.coordinates.forEach(polygon => {
                    vertices.push(...polygon[0]); // Unisci i vertici del primo anello di ogni poligono
                });
                break;
            default:
                throw new Error(`Tipo di geometria ${geometry.type} non supportato.`);
        }

        return vertices;
    }

    const { BaseLayer } = LayersControl;

    return (
        <div style={{ display: 'flex', flex: 1, position: 'relative', height: '90vh' }}>
            <MapContainer
                ref={mapRef}
                center={position}
                zoom={13}
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
                <MarkerClusterGroup ref={markerClusterRef} showCoverageOnHover={false} disableClusteringAtZoom={20} iconCreateFunction={createClusterCustomIcon}>
                    {docs.filter(doc => doc.coordinate != null).map(doc => (
                        <Marker key={doc.title} position={doc.coordinate} icon={getIconByType(doc.type, selectedDoc, doc.title)} eventHandlers={{
                            click: () => {
                                setSelectedDoc(null)
                                setSelectedDoc(doc);
                                setActivePosition({ lat: doc.coordinate[0], lng: doc.coordinate[1] })
                            },
                        }}>
                            <LeafletTooltip direction="top" offset={[5, -30]} opacity={1}>
                                <span>{doc.title}</span>
                            </LeafletTooltip>
                        </Marker>
                    ))}
                    {Array.from(documentsByArea.entries()).map(([areaKey, areaDocuments]) => {
                        const areaVertices = JSON.parse(areaKey);
                        const positions = generateNonOverlappingPositions(areaVertices, areaDocuments.length);

                        return (
                            <React.Fragment key={areaKey}>
                                {areaDocuments.map((document, index) => (
                                    <Marker key={document.id} position={positions[index]} icon={getIconByType(document.type, selectedDoc, document.title)} eventHandlers={{
                                        click: () => {
                                            setSelectedDoc(null)
                                            setSelectedDoc(document);
                                            setActivePosition({ lat: positions[index][0], lng: positions[index][1] })

                                        },
                                    }}>
                                        <LeafletTooltip direction="top" offset={[5, -30]} opacity={1}>
                                            <span>{document.title}</span>
                                        </LeafletTooltip>
                                    </Marker>
                                ))}
                            </React.Fragment>
                        );
                    })}
                </MarkerClusterGroup>

                {/* Selected Area Polygon */}
                {selectedDoc && selectedDoc.area && (
                    <GeoJSON key={selectedDoc.id} data={selectedDoc.area} color="red" />
                )}
                <Legend icons={icons} />
                {/* Sposta la mappa quando viene selezionato un marker */}
                {activePosition && (
                    <MoveMapToMarker
                        position={activePosition}

                    />
                )}
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
                        mode='map'
                        excludeTitle={props.setTitle}
                        mapRef={mapRef}
                    />
                </div>
            )}

            {/* Add Document Button */}
            {!selectedDoc && props.user.role === 'Urban Planner' && (
                <div style={{ position: 'absolute', bottom: '20px', left: '10px', zIndex: 1000 }}>
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="tooltip-draw-area">
                                Add document
                            </Tooltip>
                        }
                    >
                        <Button
                            variant="light"
                            onClick={() => navigate("/addDoc")}
                            style={{ borderRadius: '50%' }}
                        >
                            <i className="bi bi-file-earmark-plus fs-3"></i>
                        </Button>
                    </OverlayTrigger>
                </div>
            )}

            {/* Add Area Button */}
            {!selectedDoc && props.user.role === 'Urban Planner' && (
                <div style={{ position: 'absolute', bottom: '80px', left: '10px', zIndex: 1000 }}>
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="tooltip-draw-area">
                                Draw area
                            </Tooltip>
                        }
                    >
                        <Button
                            variant="light"
                            onClick={() => navigate("/addArea")}
                            style={{ borderRadius: '50%' }}
                            title="Draw Area"
                        >
                            <i className="bi bi-bounding-box-circles fs-3"></i>
                        </Button>
                    </OverlayTrigger>
                </div>
            )}
        </div>
    );
}

function Legend({ icons }) {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    return (
        <>
            {!isVisible && (
                <Button variant="light" onClick={toggleVisibility} style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000 }}>
                    Show Legend
                </Button>
            )}
            {isVisible && (
                <Card style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000 }}>
                    <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Legend</span>
                        <Button
                            variant="link"
                            onClick={toggleVisibility}
                            style={{ padding: 0, border: 'none', background: 'none', color: 'black' }}
                        >
                            <i className="bi bi-x-lg"></i>
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {Object.entries(icons).map(([type, icon]) => (
                                <div key={type} style={{ display: 'flex', alignItems: 'center', marginTop: '1px', marginBottom: '1px' }}>
                                    <img src={icon.options.iconUrl} alt={type} style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                                    <span>{type}</span>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}
        </>
    );
}

MapViewer.propTypes = {
    user: propTypes.object.isRequired,
    setTitle: propTypes.func.isRequired,
    setShowAddLink: propTypes.func.isRequired,
};

Legend.propTypes = {
    icons: propTypes.object.isRequired,
};
MoveMapToMarker.propTypes = {
    position: propTypes.object.isRequired,
}

export default MapViewer;