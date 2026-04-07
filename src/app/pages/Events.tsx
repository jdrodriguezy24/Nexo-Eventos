import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  Clock,
  Building2,
  Users,
} from "lucide-react";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getVenues,
} from "../../services/api.js";

interface Event {
  idEvento: number;
  nombre: string;
  tipo: string;
  fecha: string;
  hora: string;
  idSalon: number;
  capacidad: number;
  numeroAsistentes: number;
  nombre_salon?: string;
}

interface Venue {
  idSalon: number;
  nombre: string;
  capacidad: number;
  disponible: boolean;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "Conferencia",
    fecha: "",
    hora: "",
    idSalon: "",
    capacidad: 0,
    descripcion: "",
  });

  useEffect(() => {
    loadEventsAndVenues();
  }, []);

  const loadEventsAndVenues = async () => {
    setLoading(true);
    try {
      const [eventsData, venuesData] = await Promise.all([
        getEvents(),
        getVenues(),
      ]);
      setEvents(eventsData || []);
      setVenues(venuesData || []);
      setError("");
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar eventos y salones");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nombre || !formData.fecha || !formData.hora || !formData.idSalon) {
      setError("Por favor complete todos los campos requeridos");
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const eventPayload = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        hora: formData.hora,
        idSalon: parseInt(formData.idSalon),
        capacidad: formData.capacidad,
        idUsuarioCreador: userId,
      };

      if (editingEvent) {
        // Actualizar evento existente
        await updateEvent(editingEvent.idEvento, eventPayload);
      } else {
        // Crear nuevo evento
        await createEvent(eventPayload);
      }

      // Recargar eventos
      await loadEventsAndVenues();
      handleCloseModal();
      setError("");
    } catch (err) {
      console.error("Error al guardar evento:", err);
      setError("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      nombre: event.nombre,
      tipo: event.tipo,
      fecha: event.fecha,
      hora: event.hora,
      idSalon: event.idSalon.toString(),
      capacidad: event.capacidad,
      descripcion: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (idEvento: number) => {
    if (confirm("¿Estás seguro de que deseas cancelar este evento?")) {
      try {
        setLoading(true);
        await deleteEvent(idEvento);
        await loadEventsAndVenues();
        setError("");
      } catch (err) {
        console.error("Error al eliminar evento:", err);
        setError("Error al eliminar el evento");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      nombre: "",
      tipo: "Conferencia",
      fecha: "",
      hora: "",
      idSalon: "",
      capacidad: 0,
      descripcion: "",
    });
  };

  const eventTypes = [
    "Conferencia",
    "Boda",
    "Concierto",
    "Seminario",
    "Taller",
    "Fiesta",
    "Corporativo",
    "Otro",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Gestión de eventos</h1>
          <p className="text-gray-600 mt-1">
            Administra todos tus eventos en un solo lugar
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Crear evento
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">
              No hay eventos registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primer evento
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear evento
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.idEvento}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl text-gray-900">{event.nombre}</h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                    {event.tipo}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.idEvento)}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(event.fecha).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{event.hora}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Building2 className="w-5 h-5" />
                  <span>{event.nombre_salon || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>
                    {event.numeroAsistentes} / {event.capacidad} asistentes
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Ocupación</span>
                  <span>
                    {Math.round(
                      (event.numeroAsistentes / event.capacidad) * 100
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (event.numeroAsistentes / event.capacidad) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl text-gray-900">
                {editingEvent ? "Editar evento" : "Crear nuevo evento"}
              </h2>
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
                  Nombre del evento
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Tipo de evento
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  disabled={loading}
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Salón asignado
                </label>
                <select
                  value={formData.idSalon}
                  onChange={(e) => {
                    const selectedVenue = venues.find(
                      (v) => v.idSalon === parseInt(e.target.value)
                    );
                    setFormData({
                      ...formData,
                      idSalon: e.target.value,
                      capacidad: selectedVenue?.capacidad || 0,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar salón</option>
                  {venues.map((venue) => (
                    <option key={venue.idSalon} value={venue.idSalon}>
                      {venue.nombre} (Capacidad: {venue.capacidad})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Capacidad
                </label>
                <input
                  type="number"
                  value={formData.capacidad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacidad: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  disabled={loading}
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Guardando..."
                    : editingEvent
                    ? "Guardar cambios"
                    : "Crear evento"}
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
