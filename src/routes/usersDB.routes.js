import { Router } from "express";
import UsersManagerDB from '../dao/UsersManagerDB.js';
import config from '../config.js';
import { createHash, isValidPassword, verifyRequiredBody } from '../utils.js';

const router = Router();

const manager = new UsersManagerDB();


router.post('/', verifyRequiredBody(['firstName', 'lastName', 'email', 'gender', 'password']), async (req, res) => {

    try {
        const { firstName, lastName, email, password, gender } = req.body;
        const foundUser = await manager.getUserByEmail( email );

        if (!foundUser) {
            const process = await manager.addUser({ firstName, lastName, email, gender, password: createHash(password)});
            res.status(200).send({ origin: config.SERVER, payload: process });
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El email ya se encuentra registrado' });
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


export default router;