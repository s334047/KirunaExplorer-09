import { Modal, Button, Form, Container, Row, Col, ListGroup, Dropdown } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import API from '../../API.mjs';
import PropTypes from 'prop-types';

dayjs.extend(customParseFormat);
function DescriptionComponent(props) {
  const navigate = useNavigate();
  const [scaleType,setScaleType] = useState("Text")
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("")
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [day, setDay] = useState(null);
  const [links, setLinks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [filteredItems, setFilteredItems] = useState([]);
  useEffect(() => {
    const getDocs = async () => {
      const docs = await API.getAllDocs();
      setFilteredItems(docs)
    }
    getDocs()
  }, [])
  const closeModal = () => {
    navigate("/")
  };
  const checkDate = () => {
    const newErrors = {};
    //Validation of year (mandatory)
    if (!year) {
      newErrors.date = "The year is mandatory";
    } else if (!dayjs(year, 'YYYY', true).isValid()) {
      newErrors.date = "Year format is not correct";
    }
    //Validation of month (if there is)
    if (month && !dayjs(`${year}-${month}`, 'YYYY-MM', true).isValid()) {
      newErrors.date = "Month format is not correct";
    }
    //Validation of day (if there is)
    if (day && !dayjs(`${year}-${month}-${day}`, 'YYYY-MM-DD', true).isValid()) {
      newErrors.date = "Day format is not correct";
    }

    if (!newErrors.date) {
      let issuanceDate = year;
      if (month) issuanceDate += `-${month}`;
      if (day) issuanceDate += `-${day}`;

      setFormData({ ...formData, issuanceDate });
    }

    return newErrors.date;
  }
  const checkStep1 = () => {
    const allowedScales = ["blueprint/effects", "concept", "text"]; // sostituisci con le stringhe consentite
    const scaleRegex = /^1:\d+([.,]\d+)?$/;
    const newErrors = {};
    if (!formData.title) newErrors.title = "The title is mandatory.";
    if (!formData.stakeholders) newErrors.stakeholders = "The stakeholders are mandatory.";
    if (!formData.scale) newErrors.scale = "The scale is mandatory.";
    if (!scaleRegex.test(formData.scale) && !allowedScales.includes(formData.scale) && formData.scale) newErrors.scale = "The format is not correct.";
    if (!formData.type) newErrors.type = "The type is mandatory.";
    let dateError = checkDate();
    if (dateError) {
      newErrors.date = dateError
    }
    if (formData.pages !== undefined && formData.pages !== null) {
      if (isNaN(Number(formData.pages))) {
        newErrors.pages = "The field must be a number.";
      }
    }
    return newErrors;
  }
  const checkStep2 = () => {
    const newErrors = {};
    if (!formData.description) newErrors.description = "The description is mandatory.";
    return newErrors;
  }
  const checkStep3 = () => {
    const newErrors = {};
    if ((!item.document && item.type)) newErrors.linkTitle = "All two field are mandatoriy.";
    if ((item.document && !item.type)) newErrors.linkType = "All two field are mandatoriy.";
    return newErrors;
  }
  const checkStep4 = () => {
    const newErrors = {};
    if (!mode) newErrors.mode = "The mode is mandatory.";
    return newErrors;
  }
  const checkSteps = () => {
    let newErrors = {};
    // Validazione dei campi obbligatori
    if (currentStep === 1) {
      newErrors = checkStep1();
    }
    else if (currentStep === 2) {
      newErrors = checkStep2();
    }
    else if (currentStep === 3) {
      newErrors = checkStep3();
    }
    else if (currentStep === 4) {
      newErrors = checkStep4();
    }
    return newErrors;
  }
  const handleSave = () => {
    const newErrors = checkSteps();
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
  const changeScaleType = () =>{
    if(scaleType === 'Text'){
      setScaleType("List")
    }
    else if(scaleType === 'List'){
      setScaleType("Text")
    }
    setFormData({ ...formData, scale:"" });
  }
  const handleStakeholders = (e) => {
    const { value, checked } = e.target;
    let stakeholdersArray = formData.stakeholders ? formData.stakeholders.split("/") : [];

    if (checked) {
      stakeholdersArray.push(value);
    } else {
      stakeholdersArray = stakeholdersArray.filter(item => item !== value);
    }
    setFormData({ ...formData, stakeholders: stakeholdersArray.join("/") })
  };

  const handleChangeLink = (e) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: value,
    });
  };
  const handleChangeMode = (e) => {
    const { value } = e.target;
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
                  <fieldset>
                    <Row>
                      {["Kiruna kommun", "LKAB", "White Arkitekter", "Residents"].map((stakeholder) => (
                        <Col md={3} key={stakeholder}>
                          <Form.Check
                            className='custom-checkbox'
                            key={stakeholder}
                            type="checkbox"
                            label={stakeholder}
                            value={stakeholder}
                            checked={formData.stakeholders.includes(stakeholder)}
                            onChange={handleStakeholders}
                          />
                        </Col>
                      ))}
                    </Row>
                    {errors.stakeholders && (
                      <div className="invalid-feedback d-block">{errors.stakeholders}</div>
                    )}
                  </fieldset>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Row>
                  <Form.Label className="custom-label-color">Scale:</Form.Label>
                  <Col md={10}>
                  {scaleType==='Text' ?(
                  <Form.Control
                    type="text"
                    name="scale"
                    onChange={handleChange}
                    isInvalid={!!errors.scale}
                  />):( <Form.Select
                    name="scale"
                    onChange={handleChange}
                    isInvalid={!!errors.scale}
                  >
                    <option value="">Select a scale</option>
                    <option value="blueprint/effects">Blueprint/effects</option>
                    <option value="concept">Concept</option>
                    <option value="text">Text</option>
                  </Form.Select>)}
                  <Form.Control.Feedback type="invalid">
                    {errors.scale}
                  </Form.Control.Feedback>
    
                  </Col>
                  <Col>
                  <Form.Switch onClick={changeScaleType}></Form.Switch>
                  </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Row>
                    <Form.Label className="custom-label-color">Issuance date:</Form.Label>
                    <Col md={4} className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        placeholder="dd"
                        onChange={(e) => setDay(e.target.value)}
                        isInvalid={!!errors.date}
                      />
                    </Col>
                    <Col md={4} className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        placeholder="mm"
                        onChange={(e) => setMonth(e.target.value)}
                        isInvalid={!!errors.date}
                      />
                    </Col>
                    <Col md={4} className="d-flex align-items-center">
                      <Form.Control
                        type="text"
                        placeholder="yyyy"
                        onChange={(e) => setYear(e.target.value)}
                        isInvalid={!!errors.date}
                      />
                    </Col>
                  </Row>
                  <Form.Control.Feedback type="invalid" className="d-block">
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
              <div className="mb-3"></div>
              <div className="row">
                <div className="col-12">
                  <Form.Control
                    type="text"
                    placeholder="Search title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3"></div>
              <div className="row">
                <div className="col-4">
                  <Form.Label className="custom-label-color">Document:</Form.Label>
                  <Form.Select name="document" onChange={handleChangeLink} isInvalid={!!errors.document}>
                    <option value="">Select a doc</option>
                    {filteredItems.filter((item) => item.title !== props.title).filter((doc) => !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
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
                {links.map((link) => (
                  <ListGroup.Item key={`${link.document}-${link.type}`}
                    className="d-flex justify-content-between align-items-center"
                    style={{ fontSize: '0.7rem' }}>
                    <div>{link.document} - {link.type}</div>
                    <button
                      onClick={() => handleDeleteLink(links.findIndex(l => l === link))}
                      className="btn btn-link p-0 text-black"
                    >
                      <i className="bi bi-x"></i>
                    </button>
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

        <Modal.Footer style={{ paddingTop: '0.1rem', borderTop: 'none' }}>
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

DescriptionComponent.propTypes = {
  setMode: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  setFormLink: PropTypes.func.isRequired,
  setShow: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

export default DescriptionComponent;
