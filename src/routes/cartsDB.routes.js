import { Router } from "express";
import CartManager from '../dao/CartManagerDB.js';

const router = Router();

const manager = new CartManager();

router.post('/', async (req, res) => {
    const rta = await manager.newCart();
    if (rta) {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se creo un nuevo carrito con id ${rta._id} OK` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'No se pudo crear un nuevo carrito.' });
    }
});

router.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const cart = await manager.getCartById(cid);
    if(cart) {
        res.status(200).send({ status: 'Ok', payload: cart });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito buscado con id ${cid} no existe` });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const rta = await manager.addToCart(cid,pid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        if (rta === 1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe` });
        } else {
            res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se agrego el producto con id ${pid} al carrito con id ${cid} OK` });
        }
    };
});


router.delete('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const rta = await manager.deleteToCart(cid,pid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        if (rta === 1) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe en el carrito con id ${cid}.` });
        } else {
            res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se elimino el producto con id ${pid} al carrito con id ${cid}. OK` });
        }
    };
});



router.put('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const prodUp = req.body;
    const rta = await manager.updateProductsToCart(cid,prodUp);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se modifico el carrito con id ${cid} con el array de productos ${prodUp}. OK` });
    };
});


router.put('/:cid/product/:pid', async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantityUp = +req.body.quantity;
    if (quantityUp <= 0 || isNaN(quantityUp)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere una cantidad numérico mayor a 0.` });
    } else {
        const rta = await manager.updateQuantityProdToCart(cid,pid,quantityUp);
        if (rta === 0) {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
        } else {
            if (rta === 1) {
                res.status(400).send({ status: 'Not Ok', payload: [], error: `El producto con id ${pid} no existe en el carrito con id ${cid}.` });
            } else {
                res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se actualizo a ${quantityUp} la cantidad del producto con id ${pid} en el carrito con id ${cid}. OK` });
            }
        };

    }
});

router.delete('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const rta = await manager.deleteAllProdToCart(cid);
    if (rta === 0) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito con id ${cid} no existe` });
    } else {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se vacio correctamente el carrito con id ${cid}. OK` });
    };
});

export default router;