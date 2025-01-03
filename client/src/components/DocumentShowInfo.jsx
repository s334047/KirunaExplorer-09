import { useState, useEffect } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import API from '../../API.mjs';
import dayjs from "dayjs";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';



function DocumentCard({ documents, selectedDoc, setSelectedDoc, user, excludeTitle, mapRef, setPosition }) {
    const [connections, setConnections] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const getConnections = async () => {
            const connectionsInfo = await API.GetDocumentInfoConnections(selectedDoc.id);
            setConnections(connectionsInfo);
        }
        getConnections();
    }, [selectedDoc])
    return (<>
        {console.log(selectedDoc)}
        <Card className="document-card">
            <Card.Header className="d-flex justify-content-between align-items-center" style={{ borderBottom: "none"}}>
                <button className="btn btn-dark"
                    onClick={()=>{navigate("/diagram", { state: { docFromMap: selectedDoc } })}}
                    style={{
                        backgroundColor: "#154109",
                        borderRadius: "50%"
                    }}>
                    <i class="bi bi-graph-up"></i>
                </button>
                <button
                    className="btn btn-close"
                    onClick={() => {
                        setSelectedDoc(null);
                        mapRef.current.setZoom(13)
                    }}
                    aria-label="Close"
                />
            </Card.Header>
            <Card.Body>
                <Row >
                    <Col md={connections.length > 0 ? 4 : 6} >
                        <ul style={{ listStyleType: 'none', paddingLeft: '30px' }}>
                            <li><strong>Title:</strong> {selectedDoc.title}</li>
                            <li><strong>Stakeholder:</strong> {selectedDoc.stakeholder}</li>
                            <li><strong>Scale:</strong> {selectedDoc.scale}</li>
                            <li><strong>Date:</strong> {selectedDoc.date}</li>
                            <li><strong>Type:</strong> {selectedDoc.type}</li>
                            {selectedDoc.language && <li><strong>Language:</strong> {selectedDoc.language}</li>}
                            {selectedDoc.page && <li><strong>Pages:</strong> {selectedDoc.page}</li>}
                        </ul>
                    </Col>
                    {connections.length > 0 &&
                        <Col md={4}>
                            <strong>Connections:</strong>
                            <ul>
                                {connections.map(connection => (
                                    <li key={`${connection.id}-${connection.type}`}>
                                        <Button
                                            variant="link"
                                            style={{ color: "#154109", textAlign: "left" }}
                                            onClick={() => {
                                                setSelectedDoc(documents.find((d) => d.id === connection.id));
                                                console.log("Passo di qui");
                                                setPosition(connection.id, documents)
                                            }}
                                        >
                                            {connection.title} - {connection.type}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </Col>
                    }
                    <Col md={connections.length > 0 ? 4 : 6}>
                        <ul style={{ listStyleType: 'none', paddingRight: '30px' }}>
                            <li><strong>Description:</strong><br />{selectedDoc.description}</li>
                        </ul>
                    </Col>

                </Row>
                {user.role === 'Urban Planner' &&
                    <div className="d-flex justify-content-end">
                        <Button variant="light" style={{ color: "#154109", borderColor: "#154109" }}
                            onClick={() => {
                                excludeTitle(selectedDoc)
                                navigate(`/modifyGeoreference`);
                            }}
                        >
                            <i className="bi bi-geo-alt-fill me-2"></i>Edit georeference</Button>
                    </div>
                }
            </Card.Body>
        </Card>
        </>);
}

DocumentCard.propTypes = {
    documents: PropTypes.array.isRequired,
    selectedDoc: PropTypes.object.isRequired,
    setSelectedDoc: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    excludeTitle: PropTypes.func.isRequired,
    mapRef: PropTypes.object,
    setPosition: PropTypes.func
}

function DocumentModal({ documents, selectedDoc, setSelectedDoc, maxHeight }) {
    const [connections, setConnections] = useState([]);
    const [resources, setResources] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getConnections = async () => {
            const connectionsInfo = await API.GetDocumentInfoConnections(selectedDoc.id);
            setConnections(connectionsInfo);
        }
        const fetchResources = async () => {
            try {
                const data = await API.getOriginalResources(selectedDoc.id);
                setResources(data);
            } catch (err) {
                console.error("Error fetching resources:", err);
            }
        };
        getConnections();
        fetchResources();
    }, [selectedDoc])

    const handleDownload = async (id) => {
        try {
            await API.downloadResource(id);
        } catch (err) {
            console.error("Error downloading resource:", err);
        }
    };

    return (
        <Card style={{ height: maxHeight, overflowY: "auto" }}>
            <Card.Header className="d-flex justify-content-between align-items-center" style={{ borderBottom: "none", backgroundColor: "inherit"}}>
                <button className="btn btn-dark"
                    onClick={()=>{navigate("/map", { state: { documentId: selectedDoc.id } })}}
                    style={{
                        backgroundColor: "#154109",
                        borderRadius: "50%"
                    }}>
                    <i class="bi bi-geo-alt"></i>
                </button>
                <button
                    className="btn btn-close"
                    onClick={() => {
                        setSelectedDoc(null);
                    }}
                    aria-label="Close"
                />
            </Card.Header>
            <Card.Body>
                <ul style={{ listStyleType: 'none', padding: "20px" }}>
                    <li><strong>Title:</strong> {selectedDoc.title}</li>
                    <li><strong>Stakeholder:</strong> {selectedDoc.stakeholder}</li>
                    <li><strong>Scale:</strong> {selectedDoc.scale}</li>
                    <li><strong>Date:</strong> {selectedDoc.date ? dayjs(selectedDoc.date).format('DD-MM-YYYY') : "N/A"}</li>
                    <li><strong>Type:</strong> {selectedDoc.type}</li>
                    <li><strong>Description:</strong><br />{selectedDoc.description}</li>
                    {selectedDoc.language && <li><strong>Language:</strong> {selectedDoc.language}</li>}
                    {selectedDoc.page && <li><strong>Pages:</strong> {selectedDoc.page}</li>}
                    {connections.length > 0 && (
                        <>
                            <li><strong>Connections:</strong></li>
                            <ul>
                                {connections.map(connection => (
                                    <li key={`${connection.id}-${connection.type}`}>
                                        <Button
                                            variant="link"
                                            style={{ color: "#154109", textAlign: "left" }}
                                            onClick={() => {
                                                setSelectedDoc(documents.find((d) => d.id === connection.id));
                                                console.log("Passo di qui 1");
                                                //setPosition(connection.id, documents);
                                            }}
                                        >
                                            {connection.title} - {connection.type}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {resources.length > 0 &&
                        <li><strong>Resources:</strong>
                            <ul>
                                {resources.map((resource) => (
                                    <li key={resource.id}>
                                        <Button
                                            variant="link"
                                            style={{ color: "#154109" }}
                                            onClick={() => handleDownload(resource.id)}
                                        >
                                            {resource.name}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    }
                </ul>
            </Card.Body>
        </Card >
    );
}

DocumentModal.propTypes = {
    selectedDoc: PropTypes.object.isRequired,
    setSelectedDoc: PropTypes.func.isRequired,
}

export { DocumentCard, DocumentModal };