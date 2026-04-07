import { Building2, CheckCircle2, Edit2, Plus, Trash2, Users, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createVenue,
  deleteVenue,
  getVenues,
  getEvents,
  updateVenue,
} from "../../services/api.js";

interface Venue {
  idSalon: number;
  nombre: string;
  capacidad: number;
  disponible: boolean;
  ubicacion?: string;
  telefono?: string;
}

interface Event {
  idEvento: number;
  nombre: string;
  fecha: string;
  idSalon: number;
}

export default function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    capacidad: 0,
    ubicacion: "",
    telefono: "",
    disponible: true,
  });

  useEffect(() => {
    loadVenuesAndEvents();
  }, []);

  const loadVenuesAndEvents = async () => {
    setLoading(true);
    try {
      const [venuesData, eventsData] = await Promise.all([
        getVenues(),
        getEvents(),
      ]);
      setVenues(venuesData || []);
      setEvents(eventsData || []);
      setError("");
    } catch (err) {
      console.error("Error al cargar salones y eventos:", err);
      setError("Error al cargar los salones");
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingEventsCount = (idSalon: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event) => {
      const eventDate = new Date(event.fecha);
      return event.idSalon === idSalon && eventDate >= today;
    }).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nombre || !formData.capacidad) {
      setError("Por favor complete los campos requeridos");
      setLoading(false);
      return;
    }

    try {
      const venuePayload = {
        nombre: formData.nombre,
        capacidad: formData.capacidad,
        ubicacion: formData.ubicacion,
        telefono: formData.telefono,
        disponible: formData.disponible,
      };

      if (editingVenue) {
        // Actualizar salón existente
        await updateVenue(editingVenue.idSalon, venuePayload);
      } else {
        // Crear nuevo salón
        await createVenue(venuePayload);
      }

      // Recargar salones y eventos
      await loadVenuesAndEvents();
      handleCloseModal();
      setError("");
    } catch (err) {
      console.error("Error al guardar salón:", err);
      setError("Error al guardar el salón");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      nombre: venue.nombre,
      capacidad: venue.capacidad,
      ubicacion: venue.ubicacion || "",
      telefono: venue.telefono || "",
      disponible: venue.disponible,
    });
    setShowModal(true);
  };

  const handleDelete = async (idSalon: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este salón?")) {
      try {
        setLoading(true);
        await deleteVenue(idSalon);
        await loadVenuesAndEvents();
        setError("");
      } catch (err) {
        console.error("Error al eliminar salón:", err);
        setError("Error al eliminar el salón");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAvailability = async (venue: Venue) => {
    try {
      setLoading(true);
      await updateVenue(venue.idSalon, {
        ...venue,
        disponible: !venue.disponible,
      });
      await loadVenuesAndEvents();
      setError("");
    } catch (err) {
      console.error("Error al actualizar disponibilidad:", err);
      setError("Error al actualizar la disponibilidad");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVenue(null);
    setFormData({
      nombre: "",
      capacidad: 0,
      ubicacion: "",
      telefono: "",
      disponible: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Gestión de salones</h1>
          <p className="text-gray-600 mt-1">
            Administra tus espacios y su disponibilidad
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Agregar salón
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">
              No hay salones registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando tu primer salón
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar salón
            </button>
          </div>
        ) : (
          venues.map((venue) => (
            <div
              key={venue.idSalon}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900">{venue.nombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {venue.capacidad} personas
                      </span>
                    </div>
                    {venue.ubicacion && (
                      <p className="text-sm text-gray-500 mt-1">
                        {venue.ubicacion}
                      </p>
                    )}
                    {venue.telefono && (
                      <p className="text-sm text-gray-500 mt-1">
                        📞 {venue.telefono}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => toggleAvailability(venue)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition disabled:opacity-50 ${
                    venue.disponible
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {venue.disponible ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Disponible
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      No disponible
                    </>
                  )}
                </button>
                {getUpcomingEventsCount(venue.idSalon) > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {getUpcomingEventsCount(venue.idSalon)} evento{getUpcomingEventsCount(venue.idSalon) !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(venue)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(venue.idSalon)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl text-gray-900">
                {editingVenue ? "Editar salón" : "Agregar nuevo salón"}
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
                  Nombre del salón
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ej: Salón Principal"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Capacidad máxima
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
                  placeholder="Ej: 200"
                  disabled={loading}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Ubicación (opcional)
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) =>
                    setFormData({ ...formData, ubicacion: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ej: Piso 2"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ej: 555-0001"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={formData.disponible}
                  onChange={(e) =>
                    setFormData({ ...formData, disponible: e.target.checked })
                  }
                  disabled={loading}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <label htmlFor="disponible" className="text-gray-700">
                  Marcar como disponible
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Guardando..."
                    : editingVenue
                    ? "Guardar cambios"
                    : "Agregar salón"}
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
