import { Router } from "express";
import UsersManagerDB from '../controllers/UsersManagerDB.js';
import config from '../config.js';
import { createHash, isValidPassword, verifyRequiredBody } from '../utils.js';
import nodemailer from 'nodemailer';
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";

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
            const confirmation = await transport.sendMail({
                from: `Sistema Coder Marcos <${config.GMAIL_APP_USER}>`,
                to: email,
                subject: 'Reset Password',
                html: '<h1>Prueba 01</h1>'
            });

            // console.log('Confirmation: ', confirmation);
            //const process = await manager.addUser({ firstName, lastName, email, age, password: createHash(password)});
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


router.post('/insertNewPass/uid', verifyRequiredBody(['password']), async (req, res) => {

    try {

        const uid = req.params.uid;
        //const cart = await manager.getCartById(cid);
        const { password } = req.body;


        const foundUser = await manager.getUserByEmail( uid );

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


export default router;