import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { getEvents } from "../../services/api.js";

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

const eventTypeColors: Record<string, string> = {
  Conferencia: "bg-blue-500",
  Boda: "bg-pink-500",
  Concierto: "bg-purple-500",
  Seminario: "bg-green-500",
  Taller: "bg-yellow-500",
  Fiesta: "bg-red-500",
  Corporativo: "bg-gray-500",
  Otro: "bg-orange-500",
};

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data || []);
      setError("");
    } catch (err) {
      console.error("Error al cargar eventos:", err);
      setError("Error al cargar los eventos");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => {
      // Normalizar ambas fechas al formato YYYY-MM-DD
      const eventDate = event.fecha.split("T")[0];
      return eventDate === dateStr;
    });
  };

  const hasTimeConflict = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length <= 1) return false;

    // Check if any events share the same venue at overlapping times
    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        if (dayEvents[i].nombre_salon === dayEvents[j].nombre_salon) {
          return true;
        }
      }
    }
    return false;
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const days = getDaysInMonth(currentDate);
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-1">
            Visualiza tus eventos en calendario
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-2 rounded-lg transition ${
              view === "month"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-lg transition ${
              view === "week"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={view === "month" ? previousMonth : previousWeek}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-2xl text-gray-900 capitalize">{monthName}</h2>

          <button
            onClick={view === "month" ? nextMonth : nextWeek}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {view === "month" ? (
          // Month View
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const dayEvents = date ? getEventsForDate(date) : [];
                const hasConflict = date ? hasTimeConflict(date) : false;
                const isToday =
                  date &&
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 rounded-lg border transition cursor-pointer ${
                      date === null
                        ? "bg-gray-50 border-gray-100"
                        : isToday
                        ? "bg-indigo-50 border-indigo-300"
                        : "bg-white border-gray-200 hover:border-indigo-300"
                    }`}
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.idEvento}
                              className={`text-xs text-white px-2 py-1 rounded truncate ${
                                eventTypeColors[event.tipo] ||
                                eventTypeColors["Otro"]
                              }`}
                              title={event.nombre}
                            >
                              {event.nombre}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-600 px-2">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                          {hasConflict && (
                            <div className="flex items-center gap-1 text-orange-600 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              Conflicto
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Week View
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Vista de semana próximamente</p>
          </div>
        )}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-4">
            Eventos del{" "}
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-600">No hay eventos en esta fecha</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.idEvento}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {event.nombre}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Hora: {event.hora}
                      </p>
                      <p className="text-sm text-gray-600">
                        Salón: {event.nombre_salon || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Asistentes: {event.numeroAsistentes} / {event.capacidad}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm text-white ${
                        eventTypeColors[event.tipo] || eventTypeColors["Otro"]
                      }`}
                    >
                      {event.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
