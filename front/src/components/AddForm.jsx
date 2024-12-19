import { useState } from "react";
import { Form, Button, Col, Row } from "react-bootstrap";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import Swal from "sweetalert2";

const AddForm = ({ fetchAppointments, handleCloseModal }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [occupiedTimes, setOccupiedTimes] = useState([]);


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
    appointmentType: yup.string().required("Tipo de consulta es requerido"),
    date: yup
    .date()
    .required("Fecha de cita es requerida")
    .nullable(),  
    hour: yup
    .string()
    .required("Hora es requerida"),
  });


  // Obtener la fecha y hora actual
  const now = new Date();

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

      Swal.fire({
        icon: "success",
        title: "Turno agregado",
        text: "El turno se agregó correctamente",
      });

      await fetchAppointments();
      resetForm();
      handleCloseModal(); 
    } catch (error) {
      console.error("Error al agregar turno:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error al agregar turno: ${error.message}`,
      });
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
  
    try {
      const response = await axios.get("http://localhost:5000/api/appointments", {
        withCredentials: true,
      });
      const allAppointments = response.data;
  
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      const occupiedTimesForDate = allAppointments
        .filter((appointment) => appointment.date === formattedDate)
        .map((appointment) => appointment.hour);
  
      setOccupiedTimes(occupiedTimesForDate);
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
  
   
    if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      return times.filter((time) => {
        const [hour, minute] = time.split(":").map(Number);
        return (
          hour > currentHour ||
          (hour === currentHour && minute >= currentMinute + 30)
        );
      });
    }
  
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
                  className={`form-control ${errors.date && touched.date ? "is-invalid" : ""}`}
                  minDate={now}
                />
                <Form.Control.Feedback type="invalid">
                {errors.date && touched.date && (
    <div className="invalid-feedback">{errors.date}</div>
  )}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Seleccionar Hora</Form.Label>
                <Form.Select
                  value={selectedTime}
                  onChange={(event) => {
                    handleTimeChange(event);
                    setFieldValue("hour", event.target.value);
                  }}
                  className={`form-control ${errors.hour && touched.hour ? "is-invalid" : ""}`}
                >
                  <option value="">Seleccionar hora</option>
                  {generateTimes().map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.hour}
                </Form.Control.Feedback>
              </Form.Group>

            </Col>
          </Row>
          <Row className="d-flex justify-content-center">
            <Button type="submit" className="btn btn-table w-50 mt-3">
              Agregar
            </Button>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default AddForm;
