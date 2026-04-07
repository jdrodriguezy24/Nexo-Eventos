import { useEffect, useState } from "react";
import { Plus, Search, Trash2, X, UserPlus, Users as UsersIcon, AlertCircle, CheckCircle } from "lucide-react";
import {
  getAttendees,
  createAttendee,
  deleteAttendee,
  checkInAttendee,
  getEvents,
} from "../../services/api.js";

interface Event {
  idEvento: number;
  nombre: string;
  tipo: string;
  fecha: string;
  capacidad: number;
  numeroAsistentes: number;
}

interface Attendee {
  idAsistente: number;
  idEvento: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  registroIngreso: boolean;
  horaIngreso?: string;
}

export default function Attendees() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    telefono: "",
    idEvento: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData] = await Promise.all([getEvents()]);
      setEvents(eventsData || []);

      // Cargar asistentes de todos los eventos
      if (eventsData && eventsData.length > 0) {
        const allAttendees = [];
        for (const event of eventsData) {
          try {
            const eventAttendees = await getAttendees(event.idEvento);
            allAttendees.push(...(eventAttendees || []));
          } catch (err) {
            console.error(`Error al cargar asistentes del evento ${event.idEvento}:`, err);
          }
        }
        setAttendees(allAttendees);
      }
      setError("");
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nombreCompleto || !formData.email || !formData.idEvento) {
      setError("Por favor complete todos los campos requeridos");
      setLoading(false);
      return;
    }

    try {
      const selectedEventData = events.find(
        (event) => event.idEvento === parseInt(formData.idEvento)
      );

      if (!selectedEventData) {
        setError("Evento no válido");
        setLoading(false);
        return;
      }

      // Verificar capacidad
      const eventAttendees = attendees.filter(
        (a) => a.idEvento === parseInt(formData.idEvento)
      );
      if (eventAttendees.length >= selectedEventData.capacidad) {
        setError("El evento ha alcanzado su capacidad máxima");
        setLoading(false);
        return;
      }

      // Crear asistente
      const attendeePayload = {
        idEvento: parseInt(formData.idEvento),
        nombreCompleto: formData.nombreCompleto,
        email: formData.email,
        telefono: formData.telefono,
      };

      await createAttendee(attendeePayload);

      // Recargar datos
      await loadData();
      handleCloseModal();
      setError("");
    } catch (err) {
      console.error("Error al agregar asistente:", err);
      setError("Error al agregar el asistente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (idAsistente: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este asistente?")) {
      try {
        setLoading(true);
        await deleteAttendee(idAsistente);
        await loadData();
        setError("");
      } catch (err) {
        console.error("Error al eliminar asistente:", err);
        setError("Error al eliminar el asistente");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCheckIn = async (idAsistente: number) => {
    try {
      setLoading(true);
      await checkInAttendee(idAsistente);
      await loadData();
      setError("");
    } catch (err) {
      console.error("Error al registrar check-in:", err);
      setError("Error al registrar check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      nombreCompleto: "",
      email: "",
      telefono: "",
      idEvento: "",
    });
  };

  // Filtrar asistentes
  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.telefono.includes(searchTerm);

    const matchesEvent =
      selectedEvent === "all" || attendee.idEvento === parseInt(selectedEvent);

    return matchesSearch && matchesEvent;
  });

  // Estadísticas
  const totalAssistentes = attendees.length;
  const asistentesCheckedIn = attendees.filter((a) => a.registroIngreso).length;
  const eventosActivos = events.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Gestión de asistentes</h1>
          <p className="text-gray-600 mt-1">
            Registra y valida asistentes por evento
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Agregar asistente
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            disabled={loading}
          >
            <option value="all">Todos los eventos</option>
            {events.map((event) => (
              <option key={event.idEvento} value={event.idEvento}>
                {event.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total asistentes</p>
              <p className="text-2xl text-gray-900">{totalAssistentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Check-in realizados</p>
              <p className="text-2xl text-gray-900">{asistentesCheckedIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Eventos activos</p>
              <p className="text-2xl text-gray-900">{eventosActivos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendees List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredAttendees.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">
              {attendees.length === 0
                ? "No hay asistentes registrados"
                : "No se encontraron resultados"}
            </h3>
            <p className="text-gray-600 mb-6">
              {attendees.length === 0
                ? "Comienza agregando tu primer asistente"
                : "Intenta con otros términos de búsqueda"}
            </p>
            {attendees.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar asistente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-sm text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.idAsistente} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-900">
                      {attendee.nombreCompleto}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{attendee.email}</td>
                    <td className="px-6 py-4 text-gray-600">{attendee.telefono}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full ${
                          attendee.registroIngreso
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {attendee.registroIngreso ? "Registrado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {!attendee.registroIngreso && (
                        <button
                          onClick={() => handleCheckIn(attendee.idAsistente)}
                          disabled={loading}
                          className="inline-block px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                          title="Registrar check-in"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(attendee.idAsistente)}
                        disabled={loading}
                        className="inline-block p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl text-gray-900">Agregar asistente</h2>
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreCompleto: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ej: Juan Pérez"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="juan@example.com"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="+34 600 123 456"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Evento
                </label>
                <select
                  value={formData.idEvento}
                  onChange={(e) =>
                    setFormData({ ...formData, idEvento: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar evento</option>
                  {events.map((event) => {
                    const eventAttendees = attendees.filter(
                      (a) => a.idEvento === event.idEvento
                    ).length;
                    const spotsLeft = event.capacidad - eventAttendees;

                    return (
                      <option
                        key={event.idEvento}
                        value={event.idEvento}
                        disabled={spotsLeft <= 0}
                      >
                        {event.nombre} ({spotsLeft} cupos disponibles)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Agregando..." : "Agregar asistente"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
