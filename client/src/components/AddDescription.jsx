import { Modal, Button, Form, Container, Row, Col,ListGroup } from 'react-bootstrap';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function DescriptionComponent(props) {
  const navigate= useNavigate();
  const [errors, setErrors] = useState({});
  const [isDate, setIsDate] = useState(true);
  const [mode, setMode] = useState("")
  const [links, setLinks] = useState([]);
  const [item, setItem] = useState({ document: "", type: "" });
  const [formData, setFormData] = useState({
    title: '',
    stakeholders: '',
    scale: '',
    issuanceDate: '',
    type: '',
    language: null,
    pages: null,
    description: ''
  });

  const getTitleByStep = () => {
    switch (currentStep) {
      case 1:
      case 2:
        return "Add info of the card";
      case 3:
        return "Add link";
      case 4:
        return "Add georeference";
      default:
        return "";
    }
  };

  const [currentStep, setCurrentStep] = useState(1); // Step tracking state
  const filteredItems = props.item;
  const closeModal = () => {
    navigate("/")
  };

  const handleSave = () => {
    const allowedScales = ["blueprint/effects", "concept","text"]; // sostituisci con le stringhe consentite
    const scaleRegex = /^1:\d+$/;
    const newErrors = {};
    // Validazione dei campi obbligatori
    if (currentStep === 1) {
      if (!formData.title) newErrors.title = "The title is mandatory.";
      if (!formData.stakeholders) newErrors.stakeholders = "The stakeholders are mandatory.";
      if (!formData.scale) newErrors.scale = "The scale is mandatory.";
      if (!scaleRegex.test(formData.scale) && !allowedScales.includes(formData.scale)) newErrors.scale = "The format is not correct.";
      if (!formData.type) newErrors.type = "The type is mandatory.";
      if (isDate && !formData.issuanceDate) newErrors.date = "The date is mandatory.";
      if (!isDate && !formData.issuanceDate) newErrors.year = "The year is mandatory.";
      if (formData.pages !== undefined && formData.pages !== null) {
        if (isNaN(Number(formData.pages))) {
          newErrors.pages = "The field must be a number.";
        }
      }
    }
    else if (currentStep === 2) {
      if (!formData.description) newErrors.description = "The description is mandatory.";
    }
    else if(currentStep === 3){
      if ((!item.document && item.type)) newErrors.linkTitle = "All two field are mandatoriy.";
      if ((item.document && !item.type)) newErrors.linkType = "All two field are mandatoriy.";

    }
    else if (currentStep === 4) {
      if (!mode) newErrors.mode = "The mode is mandatory.";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Se ci sono errori, non proseguire
      return;
    }
    if (currentStep === 1) {
      setCurrentStep(2);
    }
    else if (currentStep === 2) {
      setCurrentStep(3);
    }
    else if (currentStep === 3) {
      setCurrentStep(4);
    }
    else {
      props.setMode(mode)
      props.setFormData(formData);
      props.setFormLink(links)
      props.setShow(false); // Close the modal
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
  const handleChangeMode = (e) => {
    const { _, value } = e.target;
    setMode(value);
  }
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
  const renderProgressLines = () => {
    return (
      <div className="progress-line-container">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`progress-line ${currentStep >= step ? 'active' : ''}`}
          />
        ))}
      </div>
    );
  };

  const handleToggleDate = () => {
    setIsDate(!isDate);
    setFormData({
      ...formData,
      issuanceDate: "",
    });
  };

  return (
    <Container>
      <Modal show={props.show} onHide={closeModal} centered>
        <Modal.Header className="custom-modal" style={{ borderBottom: 'none' }} closeButton>
        <Modal.Title style={{ color: "#154109" }}>{getTitleByStep()}</Modal.Title>
        </Modal.Header>

        {renderProgressLines()}

        <Modal.Body>
          <Form>
            {currentStep === 1 && (
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
                  <Row>
                  <Form.Label className="custom-label-color">Issuance {isDate?'date':'year'}:</Form.Label>
                    <Col md={8}>
                    {isDate ? (
                      <Form.Control
                        type="date"
                        name="issuanceDate"
                        onChange={handleChange}
                        isInvalid={!!errors.date}
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        name="issuanceDate"
                        placeholder="aaaa"
                        onChange={handleChange}
                        isInvalid={!!errors.year}
                      />
                  )}
                  <Form.Control.Feedback type="invalid">
                    {errors.date || errors.year}
                  </Form.Control.Feedback>
                  </Col>

                  <Col md={4} className="d-flex align-items-center">
                  <Form.Check
                    type="switch"
                    id="date-format-switch"
                    label={'Full date'}
                    onChange={handleToggleDate}
                    checked={isDate}
                    className="custom-toggle"
                  />
                  </Col>
                  </Row>
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
                    <option value="Informative document">Informative document</option>
                    <option value="Material Effect">Material effect</option>
                    <option value="Prescriptive document">Prescriptive document</option>
                    <option value="Design document">Design document</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="custom-label-color">Language:</Form.Label>
                  <Form.Select
                    name="language"
                    onChange={handleChange}
                  >
                    <option value="">Select a language</option>
                    <option value="English">English</option>
                    <option value="Swedish">Swedish</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="custom-label-color">Pages:</Form.Label>
                  <Form.Control
                    type="text"
                    name="pages"
                    onChange={handleChange}
                    isInvalid={!!errors.pages}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.pages}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )} {currentStep === 2 && (
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
            {currentStep === 3 && (<><Form.Group>
          <div className="row">
            <div className="col-4">
              <Form.Label className="custom-label-color">Document:</Form.Label>
              <Form.Select name="document" onChange={handleChangeLink} isInvalid={!!errors.document}>
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
              <Form.Select name="type" onChange={handleChangeLink} isInvalid={!!errors.type}>
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
        </ListGroup></>)}
            {currentStep === 4 && (<><div style={{ textAlign: 'center' }}>
            </div>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#154109" }}><strong>Georeference mode:</strong></Form.Label>
                <Form.Select name="type" onChange={handleChangeMode} isInvalid={!!errors.mode}>
                  <option value="">Select a mode</option>
                  <option value="Point">Point</option>
                  <option value="Area">Area</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.mode}
                </Form.Control.Feedback>
              </Form.Group>
            </>)}
          </Form>
        </Modal.Body>
       
        <Modal.Footer style={{paddingTop: '0.1rem', borderTop: 'none' }}>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button
            style={{ backgroundColor: "#154109", borderColor: "#154109" }}
            onClick={handleSave}
          >
            Next
          </Button>
        </Modal.Footer>
        
      </Modal>
    </Container>
  );
}
export default DescriptionComponent;
