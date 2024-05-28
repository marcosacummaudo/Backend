import { Router } from "express";
import ProductManagerDB from '../dao/ProductManagerDB.js';

const router = Router();

const manager = new ProductManagerDB();

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


router.get('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if(product !== undefined) {
        res.status(200).send({ status: 'Ok', payload: product });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'El producto buscado no existe.' });
    }
});

router.post('/', async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const prodAdd = req.body;
    const rta = await manager.addProduct(prodAdd);
    res.status(200).send({ status: 'Ok', payload: rta, mensaje: `Producto con código ${rta.code}, agregado OK` });
    socketServer.emit('newProduct', rta);
});

router.put('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const prodUp = req.body;
    const rta = await manager.updateProduct(pid, prodUp);
    if (rta === 0) {
        res.status(200).send({ status: 'Ok', payload: prodUp, mensaje: `Producto con id ${pid}, fue modificado.` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `No se encontro el producto con id ${pid} para ser editado.` });
    };
});

router.delete('/:pid', async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const pid = req.params.pid;
    const rta = await manager.deleteProduct(pid);
    res.status(200).send({ status: 'Ok', payload: [], mensaje: `Producto con id ${pid}, fue borrado.` });
    const prodRender = await manager.getProducts(0);
    socketServer.emit('deleteProduct', prodRender);
});

export default router;