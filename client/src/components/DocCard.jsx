import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import API from '../../API.mjs';
import { useNavigate } from 'react-router-dom';

function DocumentCard({selectedDoc, setSelectedDoc, setShowAddLink, user, excludeTitle}) {
    const [n, setN] = useState(0);
    const navigate= useNavigate();
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
                            <li><strong>Stakehooolder:</strong> {selectedDoc.stakeholder}</li>
                            <li><strong>Scale:</strong> {selectedDoc.scale}</li>
                            <li><strong>Date:</strong> {selectedDoc.date}</li>
                            <li><strong>Type:</strong> {selectedDoc.type}</li>
                            <li>
                                <strong>Connections:</strong> {n}
                                {/*{user.role === 'Urban Planner' && <a
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
                                </a>}*/}
                            </li>
                            {selectedDoc.language&&<li><strong>Language:</strong> {selectedDoc.language}</li>}
                            {selectedDoc.page&&<li><strong>Pages:</strong> {selectedDoc.page}</li>}
                        </ul>
                    </Col>
                    <Col md={6}>
                        <ul style={{ listStyleType: 'none', paddingRight: '30px' }}>
                            <li><strong>Description:</strong><br />{selectedDoc.description}</li>
                        </ul>
                    </Col>
                </Row>
                {user.role === 'Urban Planner' && <button
            className="btn btn-primary position-absolute bottom-0 end-0 m-3"
            onClick={()=>{   
                excludeTitle(selectedDoc)
                navigate(`/modifyGeoreference`);}}
        >
            Action
        </button>}
            </Card.Body>
        </Card> 
    );
}

export default DocumentCard;