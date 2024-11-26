
import { useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../../API.mjs';
import PropTypes from 'prop-types';


function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    // Input validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true); 

    try {
      const response = await API.login(username, password);
      if (response.user) {
        setUser(response.user);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        navigate('/');
      } else {
        setError('Unexpected error, please try again.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Container>
      <h2>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading} 
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
    </Container>
  );
}

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
