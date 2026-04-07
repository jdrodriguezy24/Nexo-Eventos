import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Registro
router.post('/Register', async (req, res) => {
    try {
        console.log('📝 Registro request:', req.body);
        const { email, password, full_name, phone} = req.body;

        //Validaciones
        if (!email || !password || !full_name || !phone){
            console.log('⚠️  Faltan campos en registro');
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const connection = await pool.getConnection();
        console.log('✓ Conexión a BD establecida para registro');

        // Verificar si el email ya existe
        const [existing] = await connection.execute('SELECT idUsuario FROM Usuarios WHERE email = ?', [email]);

        if (existing.length > 0) {
            console.log('⚠️  Email ya existe:', email);
            connection.release();
            return res.status(400).json({ error: 'El correo ya esta registrado' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✓ Contraseña hasheada correctamente');

        // Insertar usuario
        const [result] = await connection.execute('INSERT INTO Usuarios (email, contrasena, nombreCompleto, telefono) VALUES (?, ?, ?, ?)', [email, hashedPassword, full_name, phone]);

        connection.release();
        console.log('✅ Usuario registrado exitosamente:', email);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.insertId,
        })
    } catch (error) {
        console.error('❌ Error en registro:', error.message);
        console.error('Stack completo:', error);
        res.status(500).json({ error: 'Error al registrar usuario'});
    }
});

// Login
router.post('/Login', async (req, res) => {
    try {
        console.log('🔐 Login request - Email:', req.body.email);
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('⚠️  Faltan email o contraseña en login');
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }

        const connection = await pool.getConnection();
        console.log('✓ Conexión a BD establecida para login');

        const [users] = await connection.execute('SELECT idUsuario, email, contrasena, nombreCompleto FROM Usuarios WHERE email = ?', [email]);

        connection.release();

        if (users.length === 0){
            console.log('⚠️  Usuario no encontrado:', email);
            return res.status(401).json({ error: 'Credenciales inavalidas' });
        }

        const user = users[0];
        console.log('✓ Usuario encontrado:', email);

        const isPasswordValid = await bcrypt.compare(password, user.contrasena);

        if (!isPasswordValid) {
            console.log('⚠️  Contraseña incorrecta para usuario:', email);
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        console.log('✓ Contraseña válida');

        // Generar JWT
        const token = jwt.sign(
            { id: user.idUsuario, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn:  '24h'}
        );

        console.log('✅ Token JWT generado para:', email);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.idUsuario,
                email: user.email,
                full_name: user.nombreCompleto,
            },
        });
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        console.error('Stack completo:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

export default router;