import {useState} from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';

function LoginComponent(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const credentials = { username, password };

        props.login(credentials);
    };

    return (
        <Container className="d-flex justify-content-center align-items-center">
            <Card style={{ width: '78%' }}>
                <Row>
                    <Col md={7}>
                        <img
                            src="Kiruna.jpg"
                            alt="login form"
                            className="w-100"
                            style={{ borderTopLeftRadius: '0.25rem', borderBottomLeftRadius: '0.25rem' }}
                        />
                    </Col>

                    <Col md={5} className="d-flex align-items-center">
                        <Card.Body className="w-100">

                            <div>
                                <i className="fas fa-cubes fa-3x me-3" style={{ color: '#ff6219' }}></i>
                                <h1 className="fw-bold mb-0" style={{ color: "#154109" }}>Kiruna Explorer</h1>
                            </div>

                            <h5 className="fw-normal my-4 pb-3 text-center" style={{ letterSpacing: '1px' }}>Sign into your account</h5>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Username:</Form.Label>
                                    <Form.Control type="text" value={username} onChange={ev => setUsername(ev.target.value)} required={true} size="lg" placeholder="Enter your username" />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password:</Form.Label>
                                    <Form.Control type="password"  onChange={ev => setPassword(ev.target.value)} required={true} size="lg" placeholder="Enter your password" />
                                </Form.Group>

                                <Button type='submit' variant="dark" size="lg" style={{ backgroundColor: "#154109", borderColor: "#154109" }} className="w-100 mb-4">LOGIN</Button>
                            </Form>

                        </Card.Body>
                    </Col>

                </Row>
            </Card>
        </Container>
    );
}

export default LoginComponent;
