import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// OBTENER TODOS LOS SALONES
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [salones] = await connection.execute(
        'SELECT * FROM Salones ORDER BY nombre'
        );
        connection.release();
        res.json(salones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener salones' });
    }
});

// CREAR SALÓN
router.post('/', async (req, res) => {
    try {
        const { nombre, capacidad, ubicacion, telefono, disponible } = req.body;

        if (!nombre || !capacidad) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.execute(
        'INSERT INTO Salones (nombre, capacidad, ubicacion, telefono, disponible) VALUES (?, ?, ?, ?, ?)',
        [nombre, capacidad, ubicacion, telefono, disponible]
        );
        connection.release();

        res.status(201).json({
        mensaje: 'Salón creado exitosamente',
        salonId: result.insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear salón' });
    }
});

// OBTENER SALÓN POR ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        const [salon] = await connection.execute(
        'SELECT * FROM Salones WHERE idSalon = ?',
        [id]
        );
        connection.release();

        if (salon.length === 0) {
        return res.status(404).json({ error: 'Salón no encontrado' });
        }

        res.json(salon[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener salón' });
    }
});

// ACTUALIZAR SALÓN
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, capacidad, ubicacion, telefono, disponible } = req.body;

        const connection = await pool.getConnection();
        await connection.execute(
        'UPDATE Salones SET nombre=?, capacidad=?, ubicacion=?, telefono=?, disponible=? WHERE idSalon=?',
        [nombre, capacidad, ubicacion, telefono, disponible, id]
        );
        connection.release();

        res.json({ mensaje: 'Salón actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar salón' });
    }
});

// ELIMINAR SALÓN
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM Salones WHERE idSalon=?', [id]);
        connection.release();

        res.json({ mensaje: 'Salón eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar salón' });
    }
});

export default router;
