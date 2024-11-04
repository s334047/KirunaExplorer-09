import React, { useState } from 'react';
import {  Modal, Button, Form } from 'react-bootstrap';
import API from '../../API.mjs';

const ListDocumentLink = (props) => {

  // Filtra gli elementi per escludere quelli con il titolo specificato
  const filteredItems = props.item;
  const [errors, setErrors] = useState({});
  const [item, setItem] = useState({ document: "", type: "" });
  const handleSubmit = () => {
    const newErrors = {};

    // Validazione dei campi obbligatori
    if (!item.document) newErrors.document = "The documentis mandatory.";
    if (!item.type) newErrors.type = "The type is mandatory.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Se ci sono errori, non proseguire
      return;
    }
    API.SetDocumentsConnection(props.title,item.document,item.type);
    setErrors({});
    setItem({ document: "", type: "" })
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

  return (
    <Modal show={props.show} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#154109" }}>Creating new link</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label><strong>Document:</strong></Form.Label>
          <Form.Select name="document" onChange={handleChange} isInvalid={!!errors.document}>
            <option value="">Select a document</option>
            {filteredItems.filter((item) => item.title !== props.title).map((item) => (
              <option key={item.title} value={item.title}>{item.title}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.document}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label><strong>Type:</strong></Form.Label>
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
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>Close</Button>
        <Button style={{ backgroundColor: "#154109", border: "#154109" }} onClick={() => { handleSubmit() }}>Add</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ListDocumentLink;