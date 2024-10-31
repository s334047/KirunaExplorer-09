import { Modal, Button, Form, Container } from 'react-bootstrap';
import React, {  useState } from 'react';
import API from '../../API.mjs';

export function DescriptionComponent(props){
    const [errors, setErrors] = useState({});
    const [mode, setMode]=useState("normal");
    const [item, setItem] = useState({ document: "", type: "" });
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

    const [currentStep, setCurrentStep] = useState(1); // Step tracking state
    const filteredItems = props.item;
    const closeModal = () => {
      setCurrentStep(1);
      setErrors({});
      setFormData({
        title: '',
        stakeholders: '',
        scale: '',
        issuanceDate: '',
        type: '',
        language: '',
        pages: '',
        description: ''
      })
      props.setShow(false);
      setCurrentStep(1);
      setMode("normal")
    };
  
    const handleSave = () =>{
      const newErrors = {};
      // Validazione dei campi obbligatori
      if (currentStep === 1 && mode==="normal") {
      if (!formData.title) newErrors.title = "The title is mandatory.";
      if (!formData.stakeholders) newErrors.stakeholders = "The stakeholders are mandatory.";
      if (!formData.scale) newErrors.scale = "The scale is mandatory.";
      if (!formData.type) newErrors.type = "The type is mandatory.";
      if (!formData.issuanceDate) newErrors.date = "The date is mandatory.";
    }
    else if(currentStep === 2 && mode==="normal"){
      if (!formData.description) newErrors.description = "The description is mandatory.";
    }
      setErrors(newErrors);
  
      if (Object.keys(newErrors).length > 0) {
        // Se ci sono errori, non proseguire
        return;
      }
      if (currentStep === 1 && mode==="normal") {
        setCurrentStep(2);
        setMode("link")
      } 
      else if(mode==="link"){
        setMode("normal")
      }
      else {
        API.addDocument(formData.title, formData.stakeholders, formData.scale, formData.issuanceDate, formData.type, formData.language, formData.pages, null, null, formData.description);
        props.setShow(false); // Close the modal
        setFormData({
          title: '',
          stakeholders: '',
          scale: '',
          issuanceDate: '',
          type: '',
          language: '',
          pages: '',
          description: ''
        })
        setErrors({});
        setCurrentStep(1);
      }
    }
    // Handle form data changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };

    const handleChangeLink = (e) => {
      const { name, value } = e.target;
      setItem({
        ...item,
        [name]: value,
      });
    };
    return(
      <Container>
     { mode==="normal" && <Modal show={props.show} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{color:"#154109"}}>Creating new document</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
            <Form>
            {currentStep === 1 ? (
            // First step: General Information
            <>
                  <Form.Group className="mb-3">
                  <Form.Label className="custom-label-color">Title:</Form.Label>
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
                <Form.Label className="custom-label-color">Stakeholders:</Form.Label>
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
                <Form.Label className="custom-label-color">Scale:</Form.Label>
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
                <Form.Label className="custom-label-color">Issuance date:</Form.Label>
                <Form.Control
                  type="date"
                  name="issuanceDate"
                  onChange={handleChange}
                  isInvalid={!!errors.date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.date}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="custom-label-color">Type:</Form.Label>
                <Form.Select
                  name="type"
                  onChange={handleChange}
                  isInvalid={!!errors.type}
                >
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
                <Form.Label className="custom-label-color">Language:</Form.Label>
                <Form.Control
                  type="text"
                  name="language"
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="custom-label-color">Pages:</Form.Label>
                <Form.Control
                  type="text"
                  name="pages"
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          ) : (
            // Second step: Description
            <Form.Group className="mb-3">
              <Form.Label className="custom-label-color">Description:</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={7}
                isInvalid={!!errors.description}
                type="text"
                onChange={handleChange}

              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>

      {/* Modal footer with buttons */}
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
        <Button
          style={{ backgroundColor: "#154109", borderColor:"#154109"}}
          onClick={handleSave}
        >
          {currentStep === 1 ? "Next" : "Add"}
        </Button>
      </Modal.Footer>
      {/*Modal for linking*/}
  </Modal>}
  {mode==="link" && <Modal show={props.show} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#154109" }}>Creating new document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <strong>Add link</strong> 
          <Form.Group className="mb-3">
            <Form.Label><strong>Document:</strong></Form.Label>
            <Form.Select name="document" onChange={handleChangeLink}>
              <option value="">Select a document</option>
              {filteredItems.map((item) => (
                <option key={item.title} value={item.title}>{item.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label><strong>Type:</strong></Form.Label>
            <Form.Select name="type" onChange={handleChangeLink}>
              <option value="">Select a type</option>
              <option value="Collateral Consequence">Collateral Consequence</option>
              <option value="Direct Consequence">Direct Consequence</option>
              <option value="Projection">Projection</option>
              <option value="Update">Update</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          <Button style={{ backgroundColor: "#154109", border: "#154109" }} onClick={() => { handleSave() }}>Next</Button>
        </Modal.Footer>
      </Modal>}
      </Container>
  );
}
