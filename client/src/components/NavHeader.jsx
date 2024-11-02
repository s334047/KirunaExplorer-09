import {Nav, Navbar, Container, Button } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom';

function NavHeader() {
    const location = useLocation();
    return (
        <Navbar expand="lg" className="custom-navbar" style={{ borderBottom: '1px solid #dee2e6' }}>
            <Container fluid> 
                <Navbar.Brand href="#home" style={{color: "#ffffff"}}>
                    Kiruna Explorer
                </Navbar.Brand>
                {props.loggedIn&&<>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Map</Nav.Link>
                        <Nav.Link href="/page">Documents</Nav.Link>
                        <Nav.Link>Diagram</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </>}
            {location.pathname !== '/login'&& !props.loggedIn && <Link to="/login" className="btn btn-outline-light">Login</Link>}
            {props.loggedIn && <Button variant='outline-light' onClick={props.logout}>Logout</Button>}
            </Container>
        </Navbar>
    );
}

export default NavHeader;
