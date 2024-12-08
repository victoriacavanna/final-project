import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import Icons from "./Icons";
import LogoDiente from "../assets/img/LogoDiente.png";
import "../assets/css/FooterStyles.css";

const Footer = () => {
  return (
    <footer>
      <Container fluid className="footer">
        <Row className="footer-cont">
          <Col
            xs={12}
            md={4}
            className="footer-col p-0 d-flex flex-column justify-content-center align-items-center align-items-md-start"
          >
            <ul className="footer-nav d-flex flex-column align-items-center align-items-md-end">
              <li className="footer-item">
                <Link to={"/"}>Inicio</Link>
              </li>
              <li className="footer-item">
                <Link to={"/servicios"}>Servicios</Link>
              </li>
              <li className="footer-item">
                <Link to={"/turnos"}>Turnos</Link>
              </li>
              <li className="footer-item">
                <Link to={"/contactos"}>Contactos</Link>
              </li>
            </ul>
          </Col>
          <Col
            xs={12}
            md={4}
            className="footer-col p-0 d-flex flex-column justify-content-center align-items-center position-relative"
          >
            <img src={LogoDiente} alt="Logo Diente" className="tooth-logo" />
            <p className="text-muted">
              © {new Date().getFullYear()} San Miguel de Tucumán
            </p>
          </Col>
          <Col
            xs={12}
            md={4}
            className="footer-col p-0 d-flex flex-column justify-content-center align-items-center position-relative align-items-md-start"
          >  
              <Icons />
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;

