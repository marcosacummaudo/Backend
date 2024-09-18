import { Router } from "express";
import CartManager from '../controllers/CartManagerDB.js';
import config from '../config.js';
import nodemailer from 'nodemailer';
import { handlePolicies } from '../utils.js';
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";
import UsersService from '../services/Users.dao.MDB.js';

const router = Router();

const manager = new CartManager();

const service = new UsersService();

const routeUrl = '/api/carts'

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
});

router.param('cid', async (req, res, next, id) => {
    try {
        if (!config.MONGODB_ID_REGEX.test(id)) {
            throw new CustomError(errorsDictionary.INVALID_ID_CART);
        }
        next();
    } catch (error) {
        next(error);
    }
});

router.param('pid', async (req, res, next, id) => {
    try {
        if (!config.MONGODB_ID_REGEX.test(id)) {
            throw new CustomError(errorsDictionary.INVALID_ID_PROD);
        }
        next();
    } catch (error) {
        next(error);
    }
});

router.get('/mail', async (req, res) => {
    try {
        const confirmation = await transport.sendMail({
            from: `Sistema Coder Marcos <${config.GMAIL_APP_USER}>`,
            to: 'marcos.cummaudo@setupinformatica.com.ar',
            subject: 'Pruebas Nodemailer',
            html: '<h1>Prueba 01</h1>'
        });
        res.status(200).send({ status: 'OK', data: confirmation });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | error: ${err.message}`);
    }
});
    
router.post('/', async (req, res) => {
    const rta = await manager.newCart();
    if (rta) {
        res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Se creo un nuevo carrito con id ${rta._id} OK` });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'No se pudo crear un nuevo carrito.' });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});

router.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const cart = await manager.getCartById(cid);
    if(cart) {
        res.status(200).send({ status: 'Ok', payload: cart });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito buscado con id ${cid} no existe` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});

router.post('/:cid/product/:pid', handlePolicies(['user','premium','self']), async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const user = req.session.user;
    const rta = await manager.addToCart( cid, pid, user );
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        if (rta === 1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito no es el del usuario` });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        } else {
            if(rta ===2) {
                res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe` });
                req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            } else {
                if(rta === 3) {
                    res.status(400).send({ status: 'Not Ok', payload: [], error: `El user es owner del producto con id ${pid}` });
                    req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
                } else {
                    res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Se agrego el producto con id ${pid} al carrito con id ${cid} OK` });
                    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
                }
            }
        }
    };
});

router.delete('/:cid/product/:pid',  handlePolicies(['user','self']), async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const rta = await manager.deleteToCart(cid,pid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        if (rta === 1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe en el carrito con id ${cid}.` });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        } else {
            res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Se elimino el producto con id ${pid} al carrito con id ${cid}. OK` });
            req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        }
    };
});

router.put('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const prodUp = req.body;
    const rta = await manager.updateProductsToCart(cid,prodUp);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Se modifico el carrito con id ${cid} con el array de productos ${prodUp}. OK` });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    };
});

router.put('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantityUp = +req.body.quantity;
    if (quantityUp <= 0 || isNaN(quantityUp)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere una cantidad numérico mayor a 0.` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        const rta = await manager.updateQuantityProdToCart(cid,pid,quantityUp);
        if (rta === 0) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
        } else {
            if (rta === 1) {
                res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe en el carrito con id ${cid}.` });
                req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            } else {
                res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Se actualizo a ${quantityUp} la cantidad del producto con id ${pid} en el carrito con id ${cid}. OK` });
                req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            }
        };

    }
});

router.delete('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const rta = await manager.deleteAllProdToCart(cid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se vacio correctamente el carrito con id ${cid}. OK` });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    };
});

// Ruta para cerrar el ticket:
router.post('/:cid/purchase', handlePolicies(['user','premium']), async (req, res) => {
    const cid = req.params.cid;
    const cart = await manager.getCartById(cid);
    const foundUser = await service.getOne({ cart: cid });
    if(cart) {
        const cartFiltered = await manager.punchaseCart(cart, foundUser);
        const confirmation = await transport.sendMail({
            from: `Sistema Coder Marcos <${config.GMAIL_APP_USER}>`,
            to: foundUser.email,
            subject: 'Compra confirmada',
            html:   `<div">
                        <div>
                            <h2>Le agradecemos por su compra.</h2>
                            <p>Hola,</p>
                            <p>Le enviamos este mail para confirmarle su compra.</p>
                            <p>Muchas gracias.</p>
                        </div>
                    </div>`
        });
        res.status(200).send({ status: 'Ok', payload: cartFiltered, mensaje: `Se cerro correctamente el carrito con id ${cid} OK` });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito buscado con id ${cid} no existe` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});

router.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' });
    req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
});

export default router;