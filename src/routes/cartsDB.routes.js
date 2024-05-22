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

export default router;