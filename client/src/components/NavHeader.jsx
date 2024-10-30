import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function NavHeader() {
    return (
        <Navbar expand="lg" className="custom-navbar" style={{ borderBottom: '1px solid #dee2e6' }}>
            <Container fluid> 
                <Navbar.Brand href="#home" style={{color: "#ffffff"}}>
                    Kiruna Explorer
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Map</Nav.Link>
                        <Nav.Link href="/page">Documents</Nav.Link>
                        <Nav.Link>Diagram</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavHeader;