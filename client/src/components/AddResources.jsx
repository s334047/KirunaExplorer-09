import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const FileUploader = ({ show, onClose, triggerFileInput, documentId }) => {
    const [files, setFiles] = useState([]);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (triggerFileInput) {
            document.getElementById('file-input').click();
        }
    }, [triggerFileInput]);

    return (
        <>

            <input
                id="file-input"
                type="file"
                style={{ display: 'none' }}
                multiple
                onChange={handleFileChange}
            />

            <Modal show={show} onHide={onClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: "#154109" }}>Add original resources</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3 d-flex justify-content-end">
                        <Button
                            variant="light"
                            style={{ color: "#154109", borderColor: "#154109", width: '100%'}}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <i className="bi bi-plus-circle-fill me-2"></i>
                            Add files
                        </Button>
                    </div>
                    <ListGroup>
                        {files.map((file, index) => (
                            <ListGroup.Item
                                key={index}
                                className="d-flex justify-content-between align-items-center"
                                style={{ fontSize: '0.7rem' }}
                            >
                                <div>{file.name}</div>
                                <span onClick={() => handleRemoveFile(index)}>
                                    <i className="bi bi-x"></i>
                                </span>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        style={{ backgroundColor: "#154109", borderColor: "#154109" }}
                        onClick={() => { /* INSERIRE FUNZIONE PER CHIAMATA API*/ }}
                    >
                        Upload Files
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default FileUploader;