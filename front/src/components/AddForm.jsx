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
      {({
        handleSubmit,
        handleChange,
        values,
        touched,
        errors,
        setFieldValue,
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="form-row">
            <Col md="4" className="form-input-col">
              <Form.Group className="mb-3" controlId="validationFormik01">
                <Form.Label className="add-form-label">Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isValid={touched.name && !errors.name}
                  isInvalid={touched.name && !!errors.name}
                />
                <Form.Control.Feedback>Válido</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="validationFormik03">
                <Form.Label className="add-form-label">Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="validationFormik04">
                <Form.Label className="add-form-label">
                  Tipo de consulta
                </Form.Label>
                <Form.Control
                  as="select"
                  name="appointmentType"
                  value={values.appointmentType}
                  onChange={handleChange}
                  isInvalid={!!errors.appointmentType}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Control">Control</option>
                  <option value="Otro">Otro</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.appointmentType}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md="4" className="form-calendar-col d-flex flex-column">
              <h5 className="add-form-label">Seleccionar fecha</h5>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  handleDateChange(date);
                  setFieldValue("date", date);
                }}
                dateFormat="dd/MM/yyyy"
                locale={es}
                className="form-control"
              />
              <h5 className="add-form-label mt-3">Seleccionar hora</h5>
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
            </Col>
          </Row>
          <Row className="d-flex justify-content-center">
            <Button type="submit" className="btn-form-add mt-4">
              Agregar
            </Button>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default AddForm;
