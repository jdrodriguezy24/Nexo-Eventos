import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// OBTENER TODOS LOS ASISTENTES
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [asistentes] = await connection.execute(
            'SELECT * FROM Asistentes ORDER BY nombreCompleto'
        );
        connection.release();

        res.json(asistentes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener asistentes' });
    }
});

// OBTENER ASISTENTES DE UN EVENTO
router.get('/evento/:idEvento', async (req, res) => {
    try {
        const { idEvento } = req.params;

        const connection = await pool.getConnection();
        const [asistentes] = await connection.execute(
            'SELECT * FROM Asistentes WHERE idEvento = ? ORDER BY nombreCompleto',
            [idEvento]
        );
        connection.release();

        res.json(asistentes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener asistentes' });
    }
});

// OBTENER ASISTENTE POR ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        const [asistente] = await connection.execute(
            'SELECT * FROM Asistentes WHERE idAsistente = ?',
            [id]
        );
        connection.release();

        if (asistente.length === 0) {
            return res.status(404).json({ error: 'Asistente no encontrado' });
        }

        res.json(asistente[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener asistente' });
    }
});

// REGISTRAR ASISTENTE
router.post('/', async (req, res) => {
    try {
        const { idEvento, nombreCompleto, email, telefono } = req.body;

        if (!idEvento || !nombreCompleto || !email) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO Asistentes (idEvento, nombreCompleto, email, telefono) VALUES (?, ?, ?, ?)',
            [idEvento, nombreCompleto, email, telefono]
        );

        // Actualizar contador de asistentes
        await connection.execute(
            'UPDATE Eventos SET numeroAsistentes = (SELECT COUNT(*) FROM Asistentes WHERE idEvento = ?) WHERE idEvento = ?',
            [idEvento, idEvento]
        );

        connection.release();

        res.status(201).json({
            message: 'Asistente registrado exitosamente',
            asistenteId: result.insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar asistente' });
    }
});

// CHECK-IN DEL ASISTENTE
router.put('/:id/checkin', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE Asistentes SET registroIngreso = TRUE, horaIngreso = NOW() WHERE idAsistente = ?',
            [id]
        );
        connection.release();

        res.json({ message: 'Check-in registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar check-in' });
    }
});

// ACTUALIZAR ASISTENTE
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCompleto, email, telefono } = req.body;

        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE Asistentes SET nombreCompleto = ?, email = ?, telefono = ? WHERE idAsistente = ?',
            [nombreCompleto, email, telefono, id]
        );
        connection.release();

        res.json({ message: 'Asistente actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar asistente' });
    }
});

// ELIMINAR ASISTENTE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        const [asistente] = await connection.execute(
            'SELECT idEvento FROM Asistentes WHERE idAsistente = ?',
            [id]
        );

        await connection.execute('DELETE FROM Asistentes WHERE idAsistente = ?', [id]);

        // Actualizar contador
        if (asistente.length > 0) {
            const idEvento = asistente[0].idEvento;
            await connection.execute(
                'UPDATE Eventos SET numeroAsistentes = (SELECT COUNT(*) FROM Asistentes WHERE idEvento = ?) WHERE idEvento = ?',
                [idEvento, idEvento]
            );
        }

        connection.release();

        res.json({ message: 'Asistente eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar asistente' });
    }
});

export default router;