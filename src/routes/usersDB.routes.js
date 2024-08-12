import { Router } from "express";
import UsersManagerDB from '../controllers/UsersManagerDB.js';
import config from '../config.js';
import { createHash, isValidPassword, createToken, verifyToken, verifyRequiredBody, handlePolicies } from '../utils.js';
import nodemailer from 'nodemailer';
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";


//import { isValidPassword, verifyRequiredBody, createToken, verifyToken, handlePolicies } from '../services/utils.js';

const router = Router();

const routeUrl = '/api/users'

const manager = new UsersManagerDB();

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
});

router.param('uid', async (req, res, next, id) => {
    try {
        if (!config.MONGODB_ID_REGEX.test(id)) {
            throw new CustomError(errorsDictionary.INVALID_ID_CART);
        }
        next();
    } catch (error) {
        next(error);
    }
});


router.post('/', verifyRequiredBody(['firstName', 'lastName', 'email', 'age', 'password']), async (req, res) => {

    try {
        const { firstName, lastName, email, password, age } = req.body;
        const foundUser = await manager.getUserByEmail( email );

        if (!foundUser) {
            const process = await manager.addUser({ firstName, lastName, email, age, password: createHash(password)});
            res.status(200).send({ origin: config.SERVER, payload: process });
            req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El email ya se encuentra registrado' });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});

router.post('/resetpass', verifyRequiredBody(['email']), async (req, res) => {
    try {
        const { email } = req.body;
        const foundUser = await manager.getUserByEmail( email );
        if (foundUser) {
                const { password, ...filteredFoundUser } = foundUser;
                const token = createToken(filteredFoundUser, '1h');
                res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });
            const confirmation = await transport.sendMail({
                from: `Sistema Coder Marcos <${config.GMAIL_APP_USER}>`,
                to: email,
                subject: 'Reset Password',
                html: `<h3>Link de recuperacion de password</h3> <br>
                        <p>Ingrese a este link para reestablecer su password:</p>
                        <p>http://localhost:8080/insertPass/${token}</p>`
            });
            res.status(200).send({ origin: config.SERVER, payload: process });
            req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El email NO se encuentra registrado' });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | error: ${err.message}`);
    }
});


router.post('/insertNewPass/', verifyToken, verifyRequiredBody(['email', 'password']), async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await manager.getUserByEmail( email );
        if (foundUser) {
            // Si encontre el usaurio valido que la password ingresada no sea igual a la almacenada previamente.
            if(isValidPassword(password, foundUser.password)) {
                res.status(400).send({ origin: config.SERVER, payload: 'La password no puede ser igual a la anterior.' });
                req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            } else {
                const process = await manager.updatePass({ foundUser, password: createHash(password)});
                res.status(200).send({ origin: config.SERVER, payload: process });
                req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            }
        } else {
                res.status(400).send({ origin: config.SERVER, payload: 'El email NO se encuentra registrado' });
                req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});


router.put('/premium/:uid', handlePolicies(['admin']), async (req, res) => {
    try {
        const uid = req.params.uid;
        const foundUser = await manager.getUserById( uid );
        if (foundUser) {
            if(foundUser.role === 'admin') {
                res.status(400).send({ origin: config.SERVER, payload: 'El id de usurio corresponde a un usuario admin' });
                req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            } else {
                if(foundUser.role === 'premium') {
                    const process = await manager.updateRole({ foundUser, role: 'user'});
                    res.status(200).send({ origin: config.SERVER, payload: process });
                    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
                } else {
                    const process = await manager.updateRole({ foundUser, role: 'premium'});
                    res.status(200).send({ origin: config.SERVER, payload: process });
                    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
                }
            }
        } else {
            res.status(400).send({ origin: config.SERVER, payload: 'El id enviado no corresponde a un usuario registrado' });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        }
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});

export default router;