import React, { useState, useEffect} from 'react';
import { Table, Button} from 'react-bootstrap';
import API from '../../API.mjs';
import ListDocumentLink from './Link';

function DocumentTable({ setTitle, documents, user, setShowAddLink }) {

    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showAddLink, setShowAddLinkModal] = useState(false);

    const handleRowClick = (docId) => {
        const doc = documents.find((d) => d.id === docId);
        setSelectedDoc((prevDoc) => (prevDoc?.id === doc.id ? null : doc));
    };

    return (
        <div className="table-container">
            <Table className="custom-table"  style={{ height: '100%' }} bordered hover>
                <thead>
                    <tr>
                        <th >Title</th>
                        <th >Stakeholder</th>
                        <th>Date</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
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
                                <AdditionalInfo selectedDoc={selectedDoc} setShowAddLinkModal={setShowAddLinkModal}/>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
            <ListDocumentLink
                show={showAddLink}
                setShow={setShowAddLinkModal}
                title={selectedDoc?.title}
                item={documents}
            />
            </div>
    );
};

function AdditionalInfo({ selectedDoc, setShowAddLinkModal}) {
    const [file, setFile] = useState(null);
    const [n, setN] = useState(0);
    useEffect(() => {
        const getNConnection = async () => {
            const n = await API.GetDocumentConnections(selectedDoc.title);
            setN(n);
        }
        getNConnection();
    }, [selectedDoc])

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };
    const handleAddOriginalResourcesClick = () => {
        document.getElementById('file-input').click(); // Simula il clic sull'input file
    };
    return (
            <tr style={{paddingBottom: '40px'}} className='selected-row'>
                <td colSpan="5">
                    <ul style={{ listStyleType: 'none', paddingLeft: '40px', paddingRight: '40px', paddingTop: '40px', paddingBottom: '30px'}}>
                        
                        <li><strong>Scale:</strong> {selectedDoc.scale}</li>
                        <li><strong>Type:</strong> {selectedDoc.type}</li>
                        <li><strong>Connections:</strong> {n}</li>
                        {selectedDoc.language && <li><strong>Language:</strong> {selectedDoc.language}</li>}
                        {selectedDoc.page && <li><strong>Pages:</strong> {selectedDoc.page}</li>}
                
                    <li><strong>Description:</strong>{selectedDoc.description}</li>

                </ul>

                <div style={{ textAlign: 'right' }}>
                    <Button variant="light" style={{ color: "#154109", borderColor: "#154109", marginRight: "10px" }} onClick={() => { setShowAddLinkModal(true); }}><i className="bi bi-plus-circle-fill me-2"></i>Add link</Button>
                    <Button variant="light" style={{ color: "#154109", borderColor: "#154109", marginRight: "10px"  }}><i className="bi bi-geo-alt-fill me-2"></i>Edit georeference</Button>
                    <Button variant="light" style={{ color: "#154109", borderColor: "#154109" }} onClick={handleAddOriginalResourcesClick}><i className="bi bi-paperclip me-2"></i>Add original resources</Button>
                </div>

                <input 
                    id="file-input" 
                    type="file" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                />
                
                {file && (
                    <div>
                        <h5>Selected File:</h5>
                        <p>{file.name}</p>
                    </div>
                )}
                </td>
        </tr>
    );
}

export default DocumentTable;
