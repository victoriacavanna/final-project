import { useState, useEffect } from 'react';
import { Container, Row, Button, Modal } from 'react-bootstrap';
import AddForm from "../components/AddForm";
import Table from "../components/TableAppointment";
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments', { credentials: "include" });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <Container>
      <section className="appointment-section d-flex flex-column align-items-center justify-content-center">
        <Row className='w-100 py-5 d-flex justify-content-center'>
          <h2 className="text-center subtitle">Lista de turnos</h2>
          <Button onClick={handleShowModal} className="btn-form-add">Agregar Turno</Button> 
        </Row>
        <Row className='py-5'>
          <Table appointments={appointments} /> 
        </Row>
      </section>

      {/* Modal para agregar turno */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Turno</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <AddForm fetchAppointments={fetchAppointments} handleCloseModal={handleCloseModal} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Appointments;
