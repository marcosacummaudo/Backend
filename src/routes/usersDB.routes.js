import { Router } from "express";
import UsersManagerDB from '../controllers/UsersManagerDB.js';
import config from '../config.js';
import { createHash, isValidPassword, verifyRequiredBody } from '../utils.js';

const router = Router();

const manager = new UsersManagerDB();


router.post('/', verifyRequiredBody(['firstName', 'lastName', 'email', 'age', 'password']), async (req, res) => {

    try {
        const { firstName, lastName, email, password, age } = req.body;
        const foundUser = await manager.getUserByEmail( email );

        if (!foundUser) {
            const process = await manager.addUser({ firstName, lastName, email, age, password: createHash(password)});
            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El email ya se encuentra registrado' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


export default router;