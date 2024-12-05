import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Container, Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import API from '../../API.mjs';
import ListDocumentLink from './Link';
import FileUploader from './AddResources';

function DocumentTable(props) {

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showAddLinkModal, setShowAddLinkModal] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [searchMode, setSearchMode] = useState("Simple");
    const [searchDoc, setSearchDoc] = useState("");
    const [searchStakeholder, setSearchStakeholder] = useState("");
    const [searchYear, setSearchYear] = useState("");
    const [searchDescription, setSearchDescription] = useState("");
    const [searchType, setSearchType] = useState("");
    const [searchScale, setSearchScale] = useState("");
    const [searchLanguage, setSearchLanguage] = useState("");
    useEffect(() => {
        const getDocs = async () => {
            const docs = await API.getAllDocs();
            setDocuments(docs);
        }
        getDocs()
    }, [])
    const handleRowClick = (docId) => {
        const doc = documents.find((d) => d.id === docId);
        setSelectedDoc((prevDoc) => (prevDoc?.id === doc.id ? null : doc));
    };
    return (
        <Container fluid className="p-4">
            <Card className="p-4 mb-4 shadow-sm">
                {searchMode === "Simple" &&
                    <Row>
                        <Col md={10}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search document's title"
                                    value={searchDoc}
                                    onChange={(e) => setSearchDoc(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="mb-3 d-flex">
                            <Button
                                className="w-100"
                                variant="light"
                                style={{ color: "#154109", borderColor: "#154109" }}
                                onClick={() => { setSearchMode("Advanced"); setSearchDoc(""); }}
                            >
                                <i className="bi bi-sliders me-2">&nbsp;Advanced</i>
                            </Button>
                        </Col>
                    </Row>}
                {searchMode === "Advanced" &&
                    <>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search document's stakeholder"
                                        value={searchStakeholder}
                                        onChange={(e) => setSearchStakeholder(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search document's year"
                                        value={searchYear}
                                        onChange={(e) => setSearchYear(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search document's description"
                                        value={searchDescription}
                                        onChange={(e) => setSearchDescription(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={4} className="mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Select onChange={(e) => setSearchType(e.target.value)}>
                                        <option value="">Select document&apos;s type</option>
                                        <option value="Technical document">Technical document</option>
                                        <option value="Informative document">Informative document</option>
                                        <option value="Material effect">Material effect</option>
                                        <option value="Prescriptive document">Prescriptive document</option>
                                        <option value="Design document">Design document</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3" onChange={(e) => setSearchScale(e.target.value)}>
                                <Form.Group className="mb-3">
                                    <Form.Select>
                                        <option value="">Select document&apos;s scale</option>
                                        <option value="blueprints/effects">Blueprints/effects</option>
                                        <option value="text">Text</option>
                                        <option value="concept">Concept</option>
                                        <option value="Numerical">Numerical</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Select onChange={(e) => setSearchLanguage(e.target.value)}>
                                        <option value="">Select document&apos;s language</option>
                                        <option value="English">English</option>
                                        <option value="Swedish">Swedish</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="justify-content-center">
                            <Col xs="auto">
                                <Button
                                    variant="light"
                                    style={{ color: "#154109", borderColor: "#154109" }}
                                    className="px-4 py-2"
                                    onClick={() => {
                                        setSearchMode("Simple"); setSearchDescription("");
                                        setSearchStakeholder(""); setSearchYear("");
                                        setSearchType(""); setSearchLanguage(""); setSearchScale("");
                                    }}
                                >
                                    <i className="bi bi-arrow-counterclockwise me-2">&nbsp;Default</i>
                                </Button>
                            </Col>
                        </Row>
                    </>
                }
            </Card>

            <Card className="p-4 shadow-sm">
                <h5 className="mb-3" style={{ color: '#154109' }}>Document List</h5>
                <Table bordered hover responsive className="custom-table" style={{ height: '100%' }}>
                    <thead>
                        <tr>
                            <th >Title</th>
                            <th >Stakeholder</th>
                            <th>Date</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.filter((doc) => !searchDoc || doc.title.toLowerCase().includes(searchDoc.toLowerCase()))
                            .filter((doc) => !searchDescription || doc.description.toLowerCase().includes(searchDescription.toLowerCase()))
                            .filter((doc) => !searchYear || doc.date.toLowerCase().includes(searchYear.toLowerCase()))
                            .filter((doc) => !searchStakeholder || doc.stakeholder.toLowerCase().includes(searchStakeholder.toLowerCase()))
                            .filter((doc) => !searchLanguage || doc.language === searchLanguage)
                            .filter((doc) => !searchType || doc.type === searchType)
                            .filter((doc) => {
                                if (!searchScale) {
                                    // Caso 1: Se searchType è null o undefined, includi tutti i documenti
                                    return true;
                                } else if (searchScale === 'Numerical') {
                                    // Caso 2: Filtro per un tipo specifico
                                    return doc.scale.includes("1:");
                                } else {
                                    // Caso 3: Esegui un'altra condizione (ad esempio, controlla una proprietà diversa)
                                    return doc.scale === searchScale;
                                }
                            })
                            .map((doc) => (
                                <React.Fragment key={doc.id} >
                                    <tr
                                        onClick={() => handleRowClick(doc.id)}
                                        style={{ cursor: 'pointer' }}
                                        className={selectedDoc?.id === doc.id ? 'selected-row' : ''}
                                    >
                                        <td>{doc.title}</td>
                                        <td>{doc.stakeholder}</td>
                                        <td>{doc.date}</td>
                                        <td>{doc.type}</td>
                                    </tr>
                                    {selectedDoc?.id === doc.id && (
                                        <AdditionalInfo selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} documents={documents} setShowAddLinkModal={setShowAddLinkModal} user={props.user} />
                                    )}
                                </React.Fragment>
                            ))}
                    </tbody>
                </Table>
                {showAddLinkModal && <ListDocumentLink
                    show={showAddLinkModal}
                    setShow={setShowAddLinkModal}
                    title={selectedDoc}
                    item={documents}
                />}
            </Card>
        </Container>
    );
};

function AdditionalInfo({ selectedDoc, setSelectedDoc, documents, setShowAddLinkModal,user }) {
    const [showFileUploader, setShowFileUploader] = useState(false);
    const [triggerFileInput, setTriggerFileInput] = useState(false);
    const [resources, setResources] = useState([]);

    const handleDownload = async (id) => {
        try {
            await API.downloadResource(id);
        } catch (err) {
            console.error("Error downloading resource:", err);
        }
    };

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await API.getOriginalResources(selectedDoc.id);
                setResources(data);
            } catch (err) {
                console.error("Error fetching resources:", err);
            }
        };

        fetchResources();
    }, [selectedDoc]);

    const handleAddResourcesClick = () => {
        setTriggerFileInput(true);
        setShowFileUploader(true);
    };

    const [connections, setConnections] = useState([]);

    useEffect(() => {
        const getConnections = async () => {
            const connectionsInfo = await API.GetDocumentInfoConnections(selectedDoc.id);
            setConnections(connectionsInfo);
        }
        getConnections();
    }, [selectedDoc])

    return (
        <>
            <tr style={{ paddingBottom: '40px' }} className='selected-row'>
                <td colSpan="5">
                    <ul style={{ listStyleType: 'none', paddingLeft: '40px', paddingRight: '40px', paddingTop: '40px', paddingBottom: '30px' }}>

                        <li><strong>Scale:</strong> {selectedDoc.scale}</li>
                        <li><strong>Type:</strong> {selectedDoc.type}</li>
                        {selectedDoc.language && <li><strong>Language:</strong> {selectedDoc.language}</li>}
                        {selectedDoc.page && <li><strong>Pages:</strong> {selectedDoc.page}</li>}

                        <li><strong>Description:</strong>{selectedDoc.description}</li>

                        {connections.length > 0 &&
                            <li><strong>Connections:</strong>
                                <ul>
                                    {connections.map(connection => (
                                        <li key={`${connection.id}-${connection.type}`}>
                                            <Button
                                                variant="link"
                                                style={{ color: "#154109" }}
                                                onClick={() => setSelectedDoc(documents.find((d) => d.id === connection.id))}
                                            >
                                                {connection.title} - {connection.type}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        }

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
                    {user.role=="Urban Planner" &&
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            variant="light"
                            style={{ color: "#154109", borderColor: "#154109", marginRight: "10px" }}
                            onClick={() => { setShowAddLinkModal(true); }}
                        >
                            <i className="bi bi-plus-circle-fill me-2"></i>Add link
                        </Button>
                        <Button
                            variant="light"
                            style={{ color: "#154109", borderColor: "#154109", marginRight: "10px" }}
                            onClick={handleAddResourcesClick}
                        >
                            <i className="bi bi-paperclip me-2"></i>Add original resources
                        </Button>
                    </div>}
                </td>
            </tr>

            <FileUploader
                show={showFileUploader}
                documentId={selectedDoc.id}
                onClose={() => {
                    setShowFileUploader(false);
                    setTriggerFileInput(false);
                }}
                triggerFileInput={triggerFileInput}
            />
        </>
    );
}
AdditionalInfo.propTypes = {
    selectedDoc: PropTypes.object.isRequired,
    setShowAddLinkModal: PropTypes.func.isRequired,
    setSelectedDoc: PropTypes.func.isRequired,
    documents: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired
};
export default DocumentTable;