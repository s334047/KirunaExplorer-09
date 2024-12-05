import { Nav, Navbar, Container, Button } from 'react-bootstrap'
import PropTypes from 'prop-types';

function NavHeader(props) {
    return (
        <Navbar expand="lg" className="custom-navbar" style={{ borderBottom: '1px solid #dee2e6' }}>
            <Container fluid>
                <Navbar.Brand href="#home" style={{ color: "#ffffff" }}>
                    Kiruna Explorer
                </Navbar.Brand>
                <>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Map</Nav.Link>
                            <Nav.Link href="/documents">Documents</Nav.Link>
                            <Nav.Link href="/diagram">Diagram</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </>
                {!props.loggedIn ? (
                    <Button variant="outline-light" onClick={props.setShow}>
                        Login
                    </Button>
                ) : (
                    <Button variant="outline-light" onClick={props.logout}>
                        Logout
                    </Button>
                )}
            </Container>
        </Navbar>
    );
}

NavHeader.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
};

export default NavHeader;
