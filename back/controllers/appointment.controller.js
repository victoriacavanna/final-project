import * as appointmentsService from '../services/appointment.service.js'; // Importación del servicio de citas

// Función para crear una cita
export const createAppointment = async (req, res) => {
    try {
        const appointment = await appointmentsService.createAppointment(req.body); // Llamar al servicio de creación de cita
        res.status(201).json(appointment); // Retorna la cita creada
    } catch (error) {
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
};

// Función para obtener todas las citas o las de un grupo de teléfonos
export const getAppointments = async (req, res) => {
    try {
        const { phones } = req.query;  // Obtener los números de teléfono desde los parámetros de la consulta

        // Si 'phones' existe y no está vacío, dividir la cadena en un arreglo de números de teléfono
        const phonesArray = phones ? phones.split(',') : [];

        let appointments;
        
        if (phonesArray.length > 0) {
            // Si hay varios teléfonos, buscar las citas correspondientes a esos teléfonos
            appointments = await appointmentsService.getAppointmentsByPhones(phonesArray);
        } else {
            // Si no se pasan teléfonos, devolver todas las citas
            appointments = await appointmentsService.getAppointments();
        }

        // Comprobamos si se encontraron citas
        if (appointments && appointments.length > 0) {
            res.status(200).json(appointments); // Retorna las citas encontradas
        } else {
            res.status(404).json({ message: 'No se encontraron turnos' }); // Si no se encuentran citas
        }
    } catch (error) {
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
};

// Función para obtener una cita por ID
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await appointmentsService.getAppointmentById(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Turno no encontrado' }); // Si no se encuentra la cita
        } else {
            res.status(200).json(appointment); // Si se encuentra la cita
        }
    } catch (error) {
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
};

// Función para obtener una cita por teléfono
export const getAppointmentByPhone = async (req, res) => {
    try {
      // Llama al servicio para obtener la cita por teléfono
      const appointments = await appointmentsService.getAppointments(); 
      // Filtra los turnos para el teléfono solicitado
      const filteredAppointments = appointments.filter(appointment => appointment.phone === req.params.phone);
      if (filteredAppointments.length > 0) {
        res.status(200).json(filteredAppointments);  // Retorna la cita si existe
      } else {
        res.status(404).json({ message: 'No se encontró un turno pendiente para ese teléfono' }); // Si no se encuentra la cita
      }
    } catch (error) {
      res.status(500).json({ error: error.message }); // Manejo de errores
    }
  };

// Función para actualizar una cita
export const updateAppointment = async (req, res) => {
    try {
        const appointment = await appointmentsService.updateAppointment(req.params.id, req.body);
        if (!appointment) {
            res.status(404).json({ message: 'Turno no encontrado' }); // Si no se encuentra la cita
        } else {
            res.status(200).json(appointment); // Retorna la cita actualizada
        }
    } catch (error) {
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
};

// Función para cancelar una cita por teléfono
export const cancelAppointmentByNumber = async (req, res) => {
    try {
        // Buscar la cita por teléfono
        const appointment = await appointmentsService.getAppointmentByPhone(req.params.phone);
        if (!appointment) {
            return res.status(404).json({ message: 'Turno no encontrado' }); // Si no se encuentra la cita
        }
        // Cambiar el estado de la cita a "Cancelado"
        const updatedAppointment = await appointmentsService.updateStatusAppointment(appointment.id, "Cancelado");
        res.status(200).json(updatedAppointment); // Retorna la cita actualizada
    } catch (error) {
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
};

// Función para actualizar el estado de una cita
export const updateStatusAppointment = async (req, res) => {
    try {
        const updatedAppointment = await appointmentsService.updateStatusAppointment(req.params.id, req.body.status);
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Turno no encontrado' }); // Si no se encuentra la cita
        }
        res.status(200).json(updatedAppointment); // Retorna la cita con el estado actualizado
    } catch (error) {
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
};

// Función para eliminar una cita
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await appointmentsService.deleteAppointment(req.params.id);
        res.status(200).json(appointment); // Retorna la cita eliminada
    } catch (error) {
        res.status(500).json({ error: error.message }); // Manejo de errores
    }
};
