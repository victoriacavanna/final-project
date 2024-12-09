import { useState, useEffect } from "react";
import { Button, Modal, Table, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faArrowDown, faArrowUp, faMinus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import UpdateModal from "./UpdateModal";
import Swal from "sweetalert2";

const TableAppointment = ({ appointments }) => {
  const [show, setShow] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState(appointments);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [sortOrder, setSortOrder] = useState("none"); // Estado para el orden (ascendente o descendente)

  const handleClose = () => setShow(false);
  const handleShow = (appointment) => {
    setSelectedAppointment(appointment);
    setShow(true);
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/appointments",
        { withCredentials: true }
      );
      setAppointmentsData(response.data);
    } catch (error) {
      console.error("Error al traer datos de turnos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la lista de turnos.",
      });
    }
  };

  const handleShowUpdateModal = (appointmentId) => {
    setSelectedAppointment(appointmentId);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 204 || response.status === 200) {
        setAppointmentsData((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment._id !== appointmentId
          )
        );

        Swal.fire({
          icon: "success",
          title: "¡Eliminado!",
          text: "El turno ha sido eliminado correctamente.",
        });

        handleClose();
      } else {
        throw new Error("Error al eliminar el turno");
      }
    } catch (error) {
      console.error("Error al eliminar el turno:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el turno.",
      });
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setAppointmentsData((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: newStatus }
              : appointment
          )
        );
        console.log("Turno actualizado correctamente"); // Debug
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "El turno ha sido modificado correctamente.",
        });
      } else {
        throw new Error("Error al actualizar el estado del turno");
      }
    } catch (error) {
      console.error("Error al actualizar el estado del turno:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el turno.",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []); // Al cargar el componente, se obtiene la lista de citas

  useEffect(() => {
    setAppointmentsData(appointments); // Cuando cambian las props, actualiza el estado
  }, [appointments]);

  // Filtrar citas según el término de búsqueda
  const filteredAppointments = appointmentsData.filter(
    (appointment) =>
      appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.date.includes(searchTerm)
  );

   // Ordenar citas por horario
   const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.hour.localeCompare(b.hour);
    } else if (sortOrder === "desc") {
      return b.hour.localeCompare(a.hour);
    }
    return 0; // Si el estado es "none", no ordenar
  });

  // Alternar el orden
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
  };

  return (
    <>
      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre o fecha"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {sortedAppointments && sortedAppointments.length > 0 ? (
        <div>
          <Table className="table table-striped table-dark caption-top" responsive="md">
            <thead>
              <tr>
                <th scope="col" className="align-items-center">#</th>
                <th scope="col" className="align-items-center">Nombre</th>
                <th scope="col" className="align-items-center">Teléfono</th>
                <th scope="col" className="align-items-center">Fecha</th>
                <th scope="col" className="align-items-center">
                  Horario
                  <Button
                    variant="link"
                    className="text-light ms-1 p-0 border-0 shadow-none"
                    onClick={toggleSortOrder} >
                    <FontAwesomeIcon icon={sortOrder === "none" ? faMinus : sortOrder === "asc" ? faArrowUp : faArrowDown} />
                  </Button>
                </th>
                <th scope="col">Estado</th>
                <th scope="col">Tipo de Consulta</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map((appointment, index) => (
                <tr key={appointment._id}>
                  <th scope="row">{index + 1}</th>
                  <td>{appointment.name}</td>
                  <td>{appointment.phone}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.hour}</td>
                  <td>
                    <select
                      className="form-select"
                      aria-label="Estado del turno"
                      value={appointment.status || ""}
                      onChange={(e) =>
                        handleStatusChange(appointment._id, e.target.value)
                      }
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Completado">Completado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td>{appointment.appointmentType}</td>
                  <td className="table-actions">
                    <Button
                      className="btn btn-table"
                      onClick={() => handleShowUpdateModal(appointment._id)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>
                    <UpdateModal
                      show={showUpdateModal}
                      handleClose={handleCloseUpdateModal}
                      appointmentId={selectedAppointment}
                      handleAddAppointment={fetchAppointments}
                    />
                    <Button
                      className="btn btn-table basic-btn"
                      onClick={() => handleShow(appointment)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Modal show={show} onHide={handleClose} centered>
                      <Modal.Header closeButton>
                        <Modal.Title>Confirmar Eliminación</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        {selectedAppointment && (
                          <>
                            <strong>Paciente:</strong> {selectedAppointment.name} <br />
                            <strong>Día:</strong> {selectedAppointment.date}
                            <br />
                            <strong>Hora:</strong> {selectedAppointment.hour}
                            <br />
                            <br />
                            <h5>¿Estás seguro de que quieres eliminar este turno?</h5>
                          </>
                        )}
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                          Cancelar
                        </Button>
                        <Button
                          className="btn basic-btn"
                          onClick={() =>
                            handleDeleteAppointment(selectedAppointment._id)
                          }
                        >
                          Eliminar
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <h3 className="text-center">No hay turnos que coincidan con la búsqueda</h3>
      )}
    </>
  );
};

export default TableAppointment;
