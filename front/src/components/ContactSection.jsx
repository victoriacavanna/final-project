import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        service: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        console.log(formData)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                console.log('Formulario enviado con éxito');
                setFormData({
                    name: '',
                    email: '',
                    service: '',
                    message: ''
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Mensaje enviado',
                    text: '¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.',
                });
            } else {
                console.error('Error al enviar el formulario');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.',
                });
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al enviar el formulario. Intenta nuevamente.',
            });
        }

        console.log(formData)

    };

    return (
        <section id="contact" className="contact-section d-flex align-items-center justify-content-center">
            <Container>
                <Row>
                    <Col lg={6} sm={12} md={6}>
                        <div>

                            <h3 className="contact-title mb-3">¡Estamos aquí para ayudarte!</h3>
                            <p className="mb-3 fw-medium">Contáctanos para programar tu próxima consulta dental y resolver cualquier pregunta que puedas tener.</p>
                            <div className="d-flex align-items-center mb-3">
                                <FontAwesomeIcon icon={faPhone} className="me-2" />
                                <p className="mb-0 fw-semibold">+54 381 347 8761</p>
                            </div>
                            <div className="d-flex align-items-center">
                                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                                <p className="mb-0 fw-semibold">contacto@tudentista.com</p>
                            </div>
                        </div>
                    </Col>
                    <Col lg={6} sm={12} md={6}>
                        <Form onSubmit={handleSubmit} className="contact-form d-flex flex-column align-items-center justify-content-center w-100">
                            <Form.Group controlId="formBasicName" className="mb-4 w-100">
                                <Form.Label className="fw-medium fs-5">Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ingrese su nombre"
                                    className="w-100"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicEmail" className="mb-4 w-100">
                                <Form.Label className="fw-medium fs-5">Correo Electrónico</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Ingrese su correo electrónico"
                                    className="w-100"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicService" className="mb-4 w-100">
                                <Form.Label className="fw-medium fs-5">Servicio Requerido</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    placeholder="Especifique el servicio deseado"
                                    className="w-100"
                                />
                            </Form.Group>

                            <Form.Group controlId="formBasicMessage" className="mb-4 w-100">
                                <Form.Label className="fw-medium fs-5">Mensaje</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Escriba su mensaje aquí"
                                    className="w-100"
                                />
                            </Form.Group>

                            <Button type="submit" className="btn btn-color btn-contact w-75">
                                Enviar
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ContactSection;

