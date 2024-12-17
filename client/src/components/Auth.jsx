import { useState } from 'react';
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

function LoginComponent(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const credentials = { username, password };

        props.login(credentials);
    };

    return (
        <Modal show={props.show} onHide={() => props.setShow(false)} backdropClassName="custom-backdrop" centered>
            <Modal.Body>
                <Row>
                    <Col className="d-flex flex-column justify-content-center align-items-center p-4">
                        <div>
                            <div className="text-center">
                                <h1 className="fw-bold" style={{ color: "#154109" }}>Kiruna Explorer</h1>
                            </div>

                            <h5 className="fw-normal my-4 text-center" style={{ letterSpacing: '1px' }}>
                                Sign into your account
                            </h5>

                            <Form onSubmit={handleSubmit} className="flex-column align-items-center">
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Username:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={username}
                                        onChange={ev => setUsername(ev.target.value)}
                                        className="mx-auto"
                                        required
                                        placeholder="Enter your username"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={ev => setPassword(ev.target.value)}
                                        className="mx-auto"
                                        required
                                        placeholder="Enter your password"
                                    />
                                </Form.Group>

                                <div
                                    style={{
                                        color: props.message.type === 'success' ? 'green' : 'red',
                                        fontSize: '0.875rem',
                                        marginBottom: '1rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {props.message}
                                </div>

                                <Button
                                    type="submit"
                                    variant="dark"
                                    className="w-100 mb-4"
                                    style={{ backgroundColor: "#154109", borderColor: "#154109" }}
                                >
                                    LOGIN
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>

    );
}
LoginComponent.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
};

export default LoginComponent;
