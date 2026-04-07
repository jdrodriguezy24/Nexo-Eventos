const API_URL = 'http://localhost:5000/api';

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
};

export const registerUser = async (email, password, full_name, phone) => {
    const response = await fetch(`${API_URL}/auth/Register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name, phone }),
    });
    return response.json();
};

export const getEvents = async () => {
    const response = await fetch(`${API_URL}/eventos`);
    return response.json();
};

export const createEvent = async (eventData) => {
    const response = await fetch(`${API_URL}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
    });
    return response.json();
};

export const updateEvent = async (id, eventData) => {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
    });
    return response.json();
};

export const deleteEvent = async (id) => {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};

export const getVenues = async () => {
    const response = await fetch(`${API_URL}/salones`);
    return response.json();
};

export const createVenue = async (venueData) => {
    const response = await fetch(`${API_URL}/salones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueData),
    });
    return response.json();
};

export const updateVenue = async (id, venueData) => {
    const response = await fetch(`${API_URL}/salones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueData),
    });
    return response.json();
};

export const deleteVenue = async (id) => {
    const response = await fetch(`${API_URL}/salones/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};

export const getAttendees = async (idEvento) => {
    const response = await fetch(`${API_URL}/asistentes/evento/${idEvento}`);
    return response.json();
};

export const getAllAttendees = async () => {
    const response = await fetch(`${API_URL}/asistentes`);
    return response.json();
};

export const createAttendee = async (attendeeData) => {
    const response = await fetch(`${API_URL}/asistentes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendeeData),
    });
    return response.json();
};

export const checkInAttendee = async (id) => {
    const response = await fetch(`${API_URL}/asistentes/${id}/checkin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};

export const updateAttendee = async (id, attendeeData) => {
    const response = await fetch(`${API_URL}/asistentes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendeeData),
    });
    return response.json();
};

export const deleteAttendee = async (id) => {
    const response = await fetch(`${API_URL}/asistentes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};