import { useState } from "react";
import { Form, Button, Col, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";

const AddForm = ({ fetchAppointments, handleCloseModal  }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const schema = yup.object().shape({
    name: yup.string().required("Nombre es requerido"),
    phone: yup.string().required("Teléfono es requerido"),
    appointmentType: yup.string().required("Tipo de consulta es requerido"),
    date: yup.date().required("Fecha de cita es requerida"),
  });

   // Obtener la fecha de hoy para la restricción de fechas
   const today = new Date();

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const appointmentData = {
        ...values,
        date: `${selectedDate.getDate()}/${
          selectedDate.getMonth() + 1
        }/${selectedDate.getFullYear()}`,
        hour: selectedTime,
      };

      await axios.post(
        "http://localhost:5000/api/appointments",
        appointmentData,
        { withCredentials: true }
      );

      await fetchAppointments();
      resetForm();
      handleCloseModal();  // Cerrar el modal después de agregar el turno
    } catch (error) {
      console.error("Error al agregar turno:", error);
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
    <Formik
      validationSchema={schema}
      initialValues={{
        name: "",
        phone: "",
        appointmentType: "",
        date: selectedDate,
        hour: selectedTime,
      }}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, handleChange, values, touched, errors, setFieldValue }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md="6">
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name && touched.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  isInvalid={!!errors.phone && touched.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Consulta</Form.Label>
                <Form.Select
                  name="appointmentType"
                  value={values.appointmentType}
                  onChange={handleChange}
                  isInvalid={!!errors.appointmentType && touched.appointmentType}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Control">Control</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.appointmentType}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="6">
              <Form.Group className="mb-3">
                <Form.Label>Seleccionar Fecha</Form.Label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    handleDateChange(date);
                    setFieldValue("date", date);
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={es}
                  className="form-control"
                  minDate={today}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Seleccionar Hora</Form.Label>
                <Form.Select
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
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="d-flex justify-content-center">
            <Button type="submit" className="btn-primary w-50 mt-3">
              Agregar
            </Button>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default AddForm;
