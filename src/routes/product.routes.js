import { Router } from "express";
import ProductManager from '../ProductManager.js';

const router = Router();

const manager = new ProductManager();

router.get('/', async (req, res) => {
    const limit = +req.query.limit || 0;
    const products = await manager.getProducts(limit);
    if(products.length>0) {
        res.status(200).send({ status: 'Ok', payload: products });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [] });
    }
});

router.get('/:pid', async (req, res) => {
    const pid = +req.params.pid;
    if (pid <= 0 || isNaN(pid)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere id numérico mayor a 0.` });
    } else {
        const product = await manager.getProductById(pid);
        if(product.code !== undefined) {
            res.status(200).send({ status: 'Ok', payload: product });
        } else {
            res.status(400).send({ status: 'Not Ok', payload: [], error: 'El producto buscado no existe.' });
        }
    };
});

router.post('/', async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const prodAdd = req.body;
    const rta = await manager.addProduct(prodAdd);
    if (rta !== 2) {
        if (rta === 0) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: 'Todos los campos son obligatorios.' });
        } else {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El código ${prodAdd.code} de producto ya existe.` });
        }
    } else {
        res.status(200).send({ status: 'Ok', payload: prodAdd, mensaje: `Producto con código ${prodAdd.code}, agregado OK` });
        socketServer.emit('newProduct', prodAdd);
    }
});

router.put('/:pid', async (req, res) => {
    const pid = +req.params.pid;
    if (pid <= 0 || isNaN(pid)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere id numérico mayor a 0.` });
    } else {
        const prodUp = req.body;
        const rta = await manager.updateProduct(pid, prodUp);
        if (rta === 0) {
            res.status(200).send({ status: 'Ok', payload: prodUp, mensaje: `Producto con id ${pid}, fue modificado.` });
        } else {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `No se encontro el producto con id ${pid} para ser editado.` });
        };
    };
});

router.delete('/:pid', async (req, res) => {
    const socketServer = req.app.get('socketServer');
    const pid = +req.params.pid;
    if (pid <= 0 || isNaN(pid)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere id numérico mayor a 0.` });
    } else {        
        const rta = await manager.deleteProduct(pid);
        if (rta === 1) {
            res.status(200).send({ status: 'Ok', payload: [], mensaje: `Producto con id ${pid}, fue borrado.` });
            const prodRender = await manager.getProducts(0);
            socketServer.emit('deleteProduct', prodRender);
        } else {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `No se encontro el producto con id ${pid} para ser borrado.` });
        };
    }
});

export default router;