import { Modal, Button, Card, Form,Row,Col } from 'react-bootstrap';
import React, {  useState } from 'react';
export function DescriptionComponent(props){
    const [errors, setErrors] = useState({});
      const [formData, setFormData] = useState({
      title: '',
      stakeholders: '',
      scale: '',
      issuanceDate: '',
      type: '',
      language: '',
      pages: '',
      description: ''
    });
  
    const hanldeSave = () =>{
      const newErrors = {};
  
      // Validazione dei campi obbligatori
      if (!formData.title) newErrors.title = "The title is mandatory.";
      if (!formData.stakeholders) newErrors.stakeholders = "The stakeholders are mandatory.";
      if (!formData.scale) newErrors.scale = "The scale is mandatory.";
      if (!formData.type) newErrors.type = "The type is mandatory.";
      if (!formData.type) newErrors.description = "The description is mandatory.";
      if (!formData.type) newErrors.date = "The date is mandatory.";
      setErrors(newErrors);
  
      if (Object.keys(newErrors).length > 0) {
        // Se ci sono errori, non proseguire
        return;
      }
      props.handleClose();
    }
    // Handle form data changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
    return(
        <Modal show={props.show} onHide={props.handleClose} size="lg" centered>
        <Modal.Body className="p-4">
          {/* Editable form */}
            <Card className="mb-3 p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><strong>Title:</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      onChange={handleChange}
                      isInvalid={!!errors.title}
                    />
                   <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Stakeholders:</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="stakeholders"
                      onChange={handleChange}
                      isInvalid={!!errors.stakeholders}
                    />
                  <Form.Control.Feedback type="invalid">
                    {errors.stakeholders}
                  </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Scale:</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="scale"
                      onChange={handleChange}
                      isInvalid={!!errors.scale}
                    />
                  <Form.Control.Feedback type="invalid">
                    {errors.scale}
                  </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Issuance date:</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="issuanceDate"
                      onChange={handleChange}
                      isInvalid={!!errors.date}
                    />
                  <Form.Control.Feedback type="invalid">
                    {errors.date}
                  </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Type:</strong></Form.Label>
                  <Form.Select name="type" onChange={handleChange} isInvalid={!!errors.type}>
                    <option value="">Select a type</option>
                    <option value="Technical document">Technical document</option>
                    <option value="Report">Informative document</option>
                    <option value="Manual">Prescriptive document</option>
                    <option value="Guide">Material effect</option>
                    <option value="Specification">Design document</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type}
                  </Form.Control.Feedback>
                </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Language:</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="language"
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Pages:</strong></Form.Label>
                    <Form.Control
                      type="text"
                      name="pages"
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Description box */}
          <Card className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Form.Group className="mb-3">
              <Form.Label><strong>Description:</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                isInvalid={!!errors.description}

              />
              <Form.Control.Feedback type="invalid">
              {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Card>
        </Modal.Body>

        {/* Modal footer with close and save buttons */}
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>
            Close
          </Button>
          <Button style={{backgroundColor:"#154109", border:"#154109"}} onClick={() => {  hanldeSave(); }}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    );
}