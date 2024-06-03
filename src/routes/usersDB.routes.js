import { Router } from "express";
import UsersManagerDB from '../dao/UsersManagerDB.js';

const router = Router();

const manager = new UsersManagerDB();

router.post('/', async (req, res) => {
    const userAdd = req.body;
    const rta = await manager.addUser(userAdd);
    if(rta) {
        res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Usuario con ID ${rta._id}, registrado OK` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'El usuario no se pudo registrar.' });
    }
});

export default router;