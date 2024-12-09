import { useState, useEffect } from "react";
import { Button, Form, Modal, Col, Row } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { useAppointments } from "../context/AppointmentsContext";
import Swal from "sweetalert2";

const UpdateModal = ({ show, handleClose, appointmentId, handleAddAppointment }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  const { token } = useAuth();
  const { fetchAppointments } = useAppointments();

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (appointmentId) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/appointments/${appointmentId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const { name, phone, appointmentType, date, hour } = response.data;
          const dbDate = date;
          const [day, month, year] = dbDate.split("/");
          const dateObject = new Date(`${year}-${month}-${day}`);
          setSelectedDate(dateObject);
          setName(name);
          setPhone(phone);
          setAppointmentType(appointmentType);
          setSelectedTime(hour);
        } catch (error) {
          console.error("Error fetching appointment details:", error);
          Swal.fire({
            icon: "error",
            title: "Error al obtener los detalles",
            text: "No se pudieron cargar los datos del turno.",
          });
        }
      }
    };

    if (show && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, token, show]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const updatedAppointment = {
        name,
        phone,
        appointmentType,
        date: `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`,
        hour: selectedTime,
      };

      await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        updatedAppointment,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      await handleAddAppointment();

      Swal.fire({
        icon: "success",
        title: "Turno actualizado",
        text: "El turno se modificó correctamente.",
      });

      await handleClose();
    } catch (error) {
      console.error("Error updating appointment:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "No se pudo modificar el turno. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (event) => {
    const time = event.target.value;
    setSelectedTime(time);
  };

  const generateTimes = () => {
    const times = [];
    const intervals = [
      { start: 9, end: 13 },
      { start: 16, end: 19 },
    ];
    const intervalMinutes = 30;

    intervals.forEach(({ start, end }) => {
      for (let hour = start; hour < end; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
          const hourFormatted = hour.toString().padStart(2, "0");
          const minuteFormatted = minute.toString().padStart(2, "0");
          const timeString = `${hourFormatted}:${minuteFormatted}`;
          times.push(timeString);
        }
      }
    });

    return times;
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Modificar Turno</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPhone">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAppointmentType">
            <Form.Label>Tipo de consulta</Form.Label>
            <Form.Control
              as="select"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="Consulta">Consulta</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Tratamiento">Tratamiento</option>
              <option value="Control">Control</option>
              <option value="Otro">Otro</option>
            </Form.Control>
          </Form.Group>

          <Row>
            <Col md="6">
              <Form.Group className="mb-3" controlId="formDate">
                <Form.Label>Fecha de la cita</Form.Label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => handleDateChange(date)}
                  dateFormat="dd/MM/yyyy"
                  locale={es}
                  className="form-control"
                />
              </Form.Group>
            </Col>
            <Col md="6">
              <Form.Group className="mb-3" controlId="formTime">
                <Form.Label>Hora de la cita</Form.Label>
                <select
                  value={selectedTime}
                  onChange={handleTimeChange}
                  className="form-control"
                >
                  <option value="">Seleccionar hora</option>
                  {generateTimes().map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </Form.Group>
            </Col>
          </Row>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cerrar
            </Button>
            <Button className="basic-btn" type="submit">
              Modificar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateModal;
