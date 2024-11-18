import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Toast } from 'react-bootstrap';
import API from '../../API.mjs';

const FileUploader = ({ show, onClose, triggerFileInput, documentId }) => {
    const [files, setFiles] = useState([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

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

    const handleUploadFiles = async () => {
        if (files.length === 0) return;

        let success = true;

        for (let file of files) {
            try {
                const response = await API.addOriginalResoource(file, documentId);
                console.log(response);
                console.log(response.ok)
                if (!response.status === 200) {
                    console.log("ciaooo");
                    success = false;
                    setUploadMessage(`Failed to upload: ${file.name}`);
                    break;
                }
            } catch (error) {
                success = false;
                setUploadMessage(`Error uploading: ${file.name}`);
                break;
            }
        }

        if (success) {
            setUploadMessage('All files uploaded successfully');
            setShowToast(true);
        }

        setFiles([]);
        setShowToast(true);
        onClose();
    };

    return (
        <>
            <Modal show={show} onHide={onClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: "#154109" }}>Add original resources</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3 d-flex justify-content-end">
                        <Button
                            variant="light"
                            style={{ color: "#154109", borderColor: "#154109", width: '100%' }}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <i className="bi bi-plus-circle-fill me-2"></i>
                            Add files
                        </Button>
                    </div>
                    <input
                        id="file-input"
                        type="file"
                        style={{ display: 'none' }}
                        multiple
                        onChange={handleFileChange}
                    />
                    <ListGroup>
                        {files.map((file, index) => (
                            <ListGroup.Item
                                key={index}
                                className="d-flex justify-content-between align-items-center"
                                style={{ fontSize: '0.7rem' }}
                            >
                                <div>{file.name}</div>
                                <Button variant='transparent' onClick={() => handleRemoveFile(index)}>
                                    <i className="bi bi-x"></i>
                                </Button>
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
                        onClick={handleUploadFiles}
                    >
                        Upload Files
                    </Button>
                </Modal.Footer>
            </Modal>

            <Toast show={showToast} onClose={() => setShowToast(false)}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    zIndex: 9999,
                    width: 'auto',
                    maxWidth: '300px',
                }}>
                <Toast.Body>{uploadMessage}</Toast.Body>
            </Toast>
        </>
    );
};

export default FileUploader;
