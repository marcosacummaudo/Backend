import { Router } from 'express';
import UsersManagerDB from '../dao/UsersManagerDB.js';

import config from '../config.js';

const router = Router();

const manager = new UsersManagerDB();

const adminAuth = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin')
        return res.status(401).send({ origin: config.SERVER, payload: 'Acceso no autorizado: se requiere autenticación y nivel de admin' });
    next();
}

router.post('/register', async (req, res) => {
    
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await manager.getProductsByEmail(email);
        
        if (email !== user.email || password !== user.password) {
            return res.status(401).send({ origin: config.SERVER, payload: 'Datos de acceso no válidos' });
        }
        req.session.user = { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, gender: user.gender };
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
            res.redirect('/products');
        });

    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


router.get('/private', adminAuth, async (req, res) => {
    try {
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido ADMIN!' });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

router.get('/logout', async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: 'Error al ejecutar logout', error: err });
            res.redirect('/login');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

export default router;