import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todos los eventos
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [events] = await connection.execute(`
            SELECT e.idEvento, e.nombre, e.tipo, e.descripcion, e.fecha, e.hora, 
            e.idSalon, e.capacidad, e.numeroAsistentes, e.estado, e.idUsuarioCreador,
            s.nombre AS nombre_salon
            FROM Eventos e 
            LEFT JOIN Salones s ON e.idSalon = s.idSalon
            ORDER BY e.fecha DESC
        `);
        connection.release();
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Crear Evento
router.post('/', async (req, res) => {
    try {
        const { nombre, tipo, descripcion, fecha, hora, idSalon, capacidad, idUsuarioCreador } = req.body;

        if (!nombre || !fecha || !hora || !idSalon) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO Eventos (nombre, tipo, descripcion, fecha, hora, idSalon, capacidad, idUsuarioCreador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, tipo, descripcion, fecha, hora, idSalon, capacidad, idUsuarioCreador]
        );

        connection.release();

        res.status(201).json({  
            message: 'Evento creado exitosamente', 
            idEvento: result.insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear evento' });
    }
});

// Actualizar evento
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, descripcion, fecha, hora, idSalon, capacidad, estado } = req.body;

        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE Eventos SET nombre=?, tipo=?, descripcion=?, fecha=?, hora=?, idSalon=?, capacidad=?, estado=? WHERE idEvento=?',
            [nombre, tipo, descripcion, fecha, hora, idSalon, capacidad, estado, id]
        );

        connection.release();

        res.json({ message: 'Evento actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar evento' });
    }
});

// Eliminar evento
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM Eventos WHERE idEvento=?', [id]);

        connection.release();

        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar evento' });
    }
});

export default router;