import { Router } from "express";
import ProductManagerDB from '../controllers/ProductManagerDB.js';
import config from '../config.js';
import { handlePolicies, verifyRequiredBody } from '../utils.js';
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";

const router = Router();

const manager = new ProductManagerDB();

const routeUrl = '/api/products'

router.param('id', async (req, res, next, id) => {
    try {
        if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
            throw new CustomError(errorsDictionary.INVALID_ID_PROD);
        }
        next();
    } catch (error) {
        next(error);
    }
})

router.get('/', async (req, res) => {
    const limit = +req.query.limit || 10;
    const page = +req.query.page || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const products = await manager.getProducts(limit, page, sort, query);
    if(products) {
        res.status(200).send({ status: 'Ok', payload: products });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);

    } else {
        res.status(400).send({ status: 'Not Ok', payload: [] });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});


router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const product = await manager.getOneProduct( { _id: id } );
    if(product !== undefined) {
        res.status(200).send({ status: 'Ok', payload: product });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'El producto buscado no existe.' });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }
});

router.post('/', handlePolicies(['admin','premium']), verifyRequiredBody(['title', 'description', 'price', 'code', 'stock', 'category']), async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const prodAdd = req.body;
    const user = req.session.user;
    const rta = await manager.addProduct(prodAdd, user);

    if(rta===0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'Alguno de los campos no llego correctamente.' });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        if(rta===1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: 'El valor del campo code ya existe y no se puede repetir.' });
            req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);    
        } else {
            res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Producto con código ${rta.code}, agregado OK` });
            req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            socketServer.emit('newProduct', rta);
        }
    }
});

router.put('/:id', handlePolicies(['admin','premium']), async (req, res) => {
    const id = req.params.id;
    const prodUp = req.body;
    const user = req.session.user;
    const rta = await manager.updateProduct(id, prodUp, user);
    if (rta === 0) {
        res.status(200).send({ status: 'Ok', payload: prodUp, mensaje: `Producto con id ${id}, fue modificado.` });
        req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else { if(rta === 1) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `No se encontro el producto con id ${id} para ser editado.` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El usuario premium logueado no es owner del producto a actualizar.` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    }};
});

router.delete('/:id', handlePolicies(['admin','premium']), async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const id = req.params.id;
    const user = req.session.user;
    const rta = await manager.deleteProduct(id, user);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El id del producto a eliminar no existe.` });
        req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    } else { if(rta === 1) {
            res.status(200).send({ status: 'Ok', payload: [], mensaje: `El usuario admin elimino el producto con id ${id} con exito.` });
            req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            const prodRender = await manager.getProducts(0);
            socketServer.emit('deleteProduct', prodRender);
        } else {
            if(rta === 2) {
                res.status(200).send({ status: 'Ok', payload: [], mensaje: `El usuario premium elimino su producto con id ${id} con exito.` });
                req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
                const prodRender = await manager.getProducts(0);
                socketServer.emit('deleteProduct', prodRender);
            } else {
                res.status(400).send({ status: 'Not Ok', payload: [], error: `El usuario premium logueado no es owner del producto a actualizar.` });
                req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
            }
    }};
});

router.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' });
    req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
});

export default router;