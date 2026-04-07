import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarPlus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllAttendees, getEvents, getVenues } from "../../services/api.js";

interface Event {
  idEvento: number;
  nombre: string;
  tipo: string;
  fecha: string;
  hora: string;
  nombre_salon?: string;
  capacidad: number;
  numeroAsistentes: number;
}

interface Venue {
  idSalon: number;
  nombre: string;
  capacidad: number;
  disponible: boolean;
}

interface Attendee {
  idAsistente: number;
  idEvento: number;
  nombreCompleto: string;
  email: string;
  registroIngreso: boolean;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [eventsData, venuesData, attendeesData] = await Promise.all([
        getEvents(),
        getVenues(),
        getAllAttendees(),
      ]);
      setEvents(eventsData || []);
      setVenues(venuesData || []);
      setAttendees(attendeesData || []);
      setError("");
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }

  const upcomingEvents = events
    .filter((event) => new Date(event.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  const availableVenues = venues.filter((v) => v.disponible);
  const totalAttendees = attendees.length;
  const occupancyPercentage = events.length > 0
    ? Math.round((events.reduce((sum, e) => sum + e.numeroAsistentes, 0) /
      events.reduce((sum, e) => sum + e.capacidad, 1)) * 100)
    : 0;

  const stats = [
    {
      label: "Eventos próximos",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "bg-blue-500",
      link: "/events",
    },
    {
      label: "Salones disponibles",
      value: availableVenues.length,
      icon: Building2,
      color: "bg-green-500",
      link: "/venues",
    },
    {
      label: "Total asistentes",
      value: totalAttendees,
      icon: Users,
      color: "bg-purple-500",
      link: "/attendees",
    },
    {
      label: "Ocupación",
      value: `${occupancyPercentage}%`,
      icon: TrendingUp,
      color: "bg-orange-500",
      link: "/calendar",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Cargando datos del dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido a tu panel de gestión de eventos
          </p>
        </div>
        <Link
          to="/events"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          <CalendarPlus className="w-5 h-5" />
          Crear evento
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl mt-2 text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/events"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
        >
          <CalendarPlus className="w-8 h-8 text-indigo-600 mb-3" />
          <h3 className="text-lg mb-1 text-gray-900">Crear evento</h3>
          <p className="text-gray-600 text-sm">
            Programa un nuevo evento en el calendario
          </p>
        </Link>

        <Link
          to="/calendar"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
        >
          <Calendar className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-lg mb-1 text-gray-900">Ver calendario</h3>
          <p className="text-gray-600 text-sm">
            Consulta todos los eventos programados
          </p>
        </Link>

        <Link
          to="/venues"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
        >
          <Building2 className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-lg mb-1 text-gray-900">Administrar salones</h3>
          <p className="text-gray-600 text-sm">
            Gestiona la disponibilidad de tus espacios
          </p>
        </Link>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-gray-900">Eventos próximos</h2>
          <Link
            to="/events"
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            Ver todos
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay eventos próximos</p>
            <Link
              to="/events"
              className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block"
            >
              Crear primer evento
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.idEvento}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <h3 className="text-gray-900">{event.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.fecha).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    - {event.hora}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{event.nombre_salon || "Sin salón"}</p>
                  <p className="text-sm text-gray-500">
                    {event.numeroAsistentes} / {event.capacidad} asistentes
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
