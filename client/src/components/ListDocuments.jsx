import React, { useState } from 'react';
import { Table, Card, Col } from 'react-bootstrap';
import DocumentCard from './DocCard';

function DocumentTable({ setTitle, documents, user, setShowAddLink }) {

    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleRowClick = (docId) => {
        const doc = documents.find((d) => d.id === docId);
        setSelectedDoc((prevDoc) => (prevDoc?.id === doc.id ? null : doc));
    };

    return (

        <div>
            <h2 className="my-4">Documents List</h2>
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Stakeholder</th>
                        <th>Scale</th>
                        <th>Date</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <React.Fragment key={doc.id}>
                            <tr
                                onClick={() => handleRowClick(doc.id)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: selectedDoc?.id === doc.id ? '#d1e7dd' : 'transparent',
                                }}
                            >
                                <td>{doc.title}</td>
                                <td>{doc.stakeholder}</td>
                                <td>{doc.scale}</td>
                                <td>{doc.date}</td>
                                <td>{doc.type}</td>
                            </tr>
                            {selectedDoc?.id === doc.id && (
                                <AdditionalInfo selectedDoc={selectedDoc} />
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>

            {/*selectedDoc && (
                <DocumentCard selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} setShowAddLink={setShowAddLink} user={user} excludeTitle={setTitle} />
            )*/}
        </div>
    );
};

function AdditionalInfo({ selectedDoc }) {
    return (
            <tr>
                <td colSpan="5">
                    <ul style={{ listStyleType: 'none', paddingLeft: '30px' }}>
                        <li><strong>Title:</strong> {selectedDoc.title}</li>
                        <li><strong>Stakehooolder:</strong> {selectedDoc.stakeholder}</li>
                        <li><strong>Scale:</strong> {selectedDoc.scale}</li>
                        <li><strong>Date:</strong> {selectedDoc.date}</li>
                        <li><strong>Type:</strong> {selectedDoc.type}</li>
                        {/*<li>
                    <strong>Connections:</strong> {n}
                    {<a
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
                </li>*/}
                        {selectedDoc.language && <li><strong>Language:</strong> {selectedDoc.language}</li>}
                        {selectedDoc.page && <li><strong>Pages:</strong> {selectedDoc.page}</li>}
                
                    <li><strong>Description:</strong>{selectedDoc.description}</li>
                    </ul>
                </td>
        </tr>
    );
}

export default DocumentTable;
