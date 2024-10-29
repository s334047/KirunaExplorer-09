import React, { useState } from 'react';
import { Card, Modal,Button,Form } from 'react-bootstrap';

const ListDocumentLink = (props) => {

  // Filtra gli elementi per escludere quelli con il titolo specificato
  const filteredItems = props.item;
  const [errors, setErrors] = useState({});
  const [item,setItem]=useState({document:"",type:""});
  const handleSubmit= () =>{
    const newErrors = {};
  
    // Validazione dei campi obbligatori
    if (!item.document) newErrors.document = "The documentis mandatory.";
    if (!item.type) newErrors.type = "The type is mandatory.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Se ci sono errori, non proseguire
      return;
    }
    props.handleClose();
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: value,
    });
  };
  return (
    <Modal show={props.show} onHide={props.handleClose} centered style={{ maxWidth: "100%" }}>
      <Modal.Body>
            <Card  className="text-center">
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title>SELECT DOCUMENT AND LINK TYPE</Card.Title>
                <Form.Group  className="mb-3 w-75">
                  <Form.Label><strong>Document:</strong></Form.Label>
                  <Form.Select name="document"  onChange={handleChange} isInvalid={!!errors.document}>
                    <option value="">Select a document</option>
                    {filteredItems.filter((item) => item.title !== props.title).map((item) => (
                      <option key={item.title} value={item.title}>{item.title}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.document}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3 w-75">
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
                <Button style={{backgroundColor:"#154109", border:"#154109"}} onClick={()=>{handleSubmit()}}>Link</Button>
              </Card.Body>
            </Card>
            </Modal.Body>
      </Modal>
  );
};

export default ListDocumentLink;