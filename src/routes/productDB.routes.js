import { Router } from "express";
import ProductManagerDB from '../controllers/ProductManagerDB.js';
import config from '../config.js';
import { handlePolicies } from '../utils.js';
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";

const router = Router();

const manager = new ProductManagerDB();

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
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [] });
    }
});


router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const product = await manager.getOneProduct( { _id: id } );
    if(product !== undefined) {
        res.status(200).send({ status: 'Ok', payload: product });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'El producto buscado no existe.' });
    }
});

router.post('/', handlePolicies(['admin']), async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const prodAdd = req.body;
    const rta = await manager.addProduct(prodAdd);
    res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Producto con código ${rta.code}, agregado OK` });
    socketServer.emit('newProduct', rta);
});

router.put('/:id', handlePolicies('admin'), async (req, res) => {
    const id = req.params.id;
    const prodUp = req.body;
    const rta = await manager.updateProduct(id, prodUp);
    if (rta === 0) {
        res.status(200).send({ status: 'Ok', payload: prodUp, mensaje: `Producto con id ${id}, fue modificado.` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `No se encontro el producto con id ${id} para ser editado.` });
    };
});

router.delete('/:id', handlePolicies('admin'), async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const id = req.params.id;
    const rta = await manager.deleteProduct(id);
    res.status(200).send({ status: 'Ok', payload: [], mensaje: `Producto con id ${id}, fue borrado.` });
    const prodRender = await manager.getProducts(0);
    socketServer.emit('deleteProduct', prodRender);
});

router.all('*', async (req, res) => {
    res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada' }); 
});

export default router;