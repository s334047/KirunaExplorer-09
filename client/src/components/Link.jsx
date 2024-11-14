import React, { useState,useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import API from '../../API.mjs';

const ListDocumentLink = (props) => {

  // Filtra gli elementi per escludere quelli con il titolo specificato
  const [errors, setErrors] = useState({});
  const [item, setItem] = useState({ document: "", type: "" });
  const [links, setLinks] = useState([]);
  const [filteredItems,setItems]=useState([]);
  useEffect(()=>{
    const getDocs = async()=>{
      const docs = await API.getAllDocs();
      setItems(docs)
    }
    getDocs()
  },[]) 
  const handleSubmit = () => {
    const newErrors = {};

    if (links.length === 0) {
      if (!item.document) newErrors.document = "The documentis mandatory.";
      if (!item.type) newErrors.type = "The type is mandatory.";
      setErrors(newErrors);
    }

    if (Object.keys(newErrors).length > 0) {
      // Se ci sono errori, non proseguire
      return;
    }

    setErrors({});

    links.forEach((link) => {
      API.SetDocumentsConnection(props.title, link.document, link.type)
        .catch((error) => {
          console.error("Error submitting link:", error);
          setErrors((prevErrors) => ({
            ...prevErrors,
            submit: "An error occurred while submitting the links.",
          }));
        });
    });

    setItem({ document: "", type: "" })
    setLinks([]);
    props.setShow(false)
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: value,
    });
  };

  const closeModal = () => {
    setErrors({});
    setItem({ document: "", type: "" })
    props.setShow(false);
  };

  const handleAddLink = () => {
    const newErrors = validateFields();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // If there are errors, do not proceed
    }

    // Add the new link to the list of links
    setLinks([...links, { document: item.document, type: item.type }]);
    setErrors({});
  };

  const validateFields = () => {
    const newErrors = {};
    if (!item.document) newErrors.document = "The document is mandatory.";
    if (!item.type) newErrors.type = "The type is mandatory.";
    return newErrors;
  };

  const handleDeleteLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <Modal show={props.show} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#154109" }}>Creating new link</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        <Form.Group>
          <div className="row">
            <div className="col-4">
              <Form.Label className="custom-label-color">Document:</Form.Label>
              <Form.Select name="document" onChange={handleChange} isInvalid={!!errors.document}>
                <option value="">Select a doc</option>
                {filteredItems.filter((item) => item.title !== props.title).map((item) => (
                  <option key={item.title} value={item.title}>{item.title}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.document}
              </Form.Control.Feedback>
            </div>

            <div className="col-4">
              <Form.Label className="custom-label-color">Type:</Form.Label>
              <Form.Select name="type" onChange={handleChange} isInvalid={!!errors.type}>
                <option value="">Select a type</option>
                <option value="Collateral Consequence">Collateral Consequence</option>
                <option value="Direct Consequence">Direct Consequence</option>
                <option value="Projection">Projection</option>
                <option value="Update">Update</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.type}
              </Form.Control.Feedback>
            </div>

            <div className="col-4 d-flex align-items-end">
              <Button
                variant="light"
                style={{ color: "#154109", borderColor: "#154109" }}
                onClick={handleAddLink}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-circle-fill me-2"></i> Create Link
              </Button>
            </div>
          </div>
        </Form.Group>

        <br /><ListGroup>
          {links.map((link, index) => (
            <ListGroup.Item key={index}
              className="d-flex justify-content-between align-items-center"
              style={{ fontSize: '0.7rem' }}>
              <div>{link.document} - {link.type}</div>
              <span
                onClick={() => handleDeleteLink(index)}
              >
                <i className="bi bi-x"></i>
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Close</Button>
        <Button style={{ backgroundColor: "#154109", border: "#154109" }} onClick={() => { handleSubmit() }}>Add</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ListDocumentLink;