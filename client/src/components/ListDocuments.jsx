import React, { useState } from 'react';
import { Table, Card } from 'react-bootstrap';
import DocumentCard from './DocCard';

const DocumentTable = ({ setTitle, documents, user, setShowAddLink }) => {

    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleRowClick = (docId) => {
        const doc = documents.find((d) => d.id === docId);
        setSelectedDoc(doc);
    };

    return (

        <div>
            <h2 className="my-4">Documents List</h2>
            {console.log(documents)}
            <Table striped bordered hover>
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
                        <tr
                            key={doc.id}
                            onClick={() => handleRowClick(doc.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td>{doc.title}</td>
                            <td>{doc.stakeholder}</td>
                            <td>{doc.scale}</td>
                            <td>{doc.date}</td>
                            <td>{doc.type}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {selectedDoc && (
                <DocumentCard selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} setShowAddLink={setShowAddLink} user={user} excludeTitle={setTitle} />
            )}
        </div>
    );
};

export default DocumentTable;
