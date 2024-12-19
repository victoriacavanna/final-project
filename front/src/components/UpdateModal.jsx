import { useState, useEffect } from "react";
import { Button, Form, Modal, Col, Row } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { useAppointments } from "../context/AppointmentsContext";
import Swal from "sweetalert2";
import * as yup from "yup";

const UpdateModal = ({ show, handleClose, appointmentId, handleAddAppointment,updateAppointments }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [occupiedTimes, setOccupiedTimes] = useState([]);

  const { token } = useAuth();
  const { fetchAppointments } = useAppointments();

  const now = new Date();

  
  const schema = yup.object().shape({
    name: yup
      .string()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/, "El nombre solo puede contener letras")
      .required("Nombre es requerido"),
    phone: yup
      .string()
      .matches(
        /^\d{2,3}9\d{2,4}\d{6,8}$/,
        "Formato correcto: código país + 9 + código área + número (sin 0 ni 15). Ejemplo: 5493814752316"
      )
      .required("Teléfono es requerido"),
    date: yup
      .date()
      .min(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), "No puedes seleccionar el día actual ni fechas pasadas")
      .required("Fecha de cita es requerida"),
      hour: yup
          .string()
          .required("Hora es requerida"),
  });

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
          const [day, month, year] = dbDate.split("/"); // dd/MM/yyyy
          const dateObject = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
          setSelectedDate(dateObject);
          setName(name);
          setPhone(phone);
          setAppointmentType(appointmentType);
          setSelectedTime(hour);

          
          const allAppointmentsResponse = await axios.get("http://localhost:5000/api/appointments", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const allAppointments = allAppointmentsResponse.data;

          const occupiedTimes = allAppointments
            .filter(
              (appointment) =>
                appointment.date === date && appointment._id !== appointmentId 
            )
            .map((appointment) => appointment.hour);

          setOccupiedTimes(occupiedTimes);   
          
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


  const resetFields = () => {
    setName("");
    setPhone("");
    setAppointmentType("");
    setSelectedDate(new Date());
    setSelectedTime(null);
  };

  const handleCloseAndReset = () => {
    handleClose();
    resetFields();
    updateAppointments(); 
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    
    try {
      const values = { name, phone, date: selectedDate };
      await schema.validate(values, { abortEarly: false });

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
      updateAppointments(); 

      Swal.fire({
        icon: "success",
        title: "Turno actualizado",
        text: "El turno se modificó correctamente.",
      });

      await handleCloseAndReset();
    } catch (error) {
      if (error.name === "ValidationError") {
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: error.errors.join(", "),
        });
      } else {
        console.error("Error updating appointment:", error);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: "No se pudo modificar el turno. Por favor, inténtalo de nuevo.",
        });
      }
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
  
    
    try {
      const response = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allAppointments = response.data;
  
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      const occupiedTimes = allAppointments
        .filter((appointment) => appointment.date === formattedDate && appointment._id !== appointmentId)
        .map((appointment) => appointment.hour);
  
      setOccupiedTimes(occupiedTimes);
    } catch (error) {
      console.error("Error fetching occupied times:", error);
    }
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
  
          
          if (!occupiedTimes.includes(timeString)) {
            times.push(timeString);
          }
        }
      }
    });
  
    return times;
  };
  

  return (
    <Modal show={show} onHide={handleCloseAndReset}>
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
                  minDate={new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)} 
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
            <Button variant="secondary" onClick={handleCloseAndReset}>
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
