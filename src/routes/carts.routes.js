import { Router } from "express";
import CartManager from '../CartManager.js';

const router = Router();

const manager = new CartManager();

router.post('/', async (req, res) => {
    const rta = await manager.newCart();
    if (rta > 0) {
        res.status(200).send({ status: 'Ok', payload: [], mensaje: `Se creo un nuevo carrito con id ${rta} OK` });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'No se pudo crear un nuevo carrito.' });
    }
});

router.get('/:cid', async (req, res) => {
    const cid = +req.params.cid;
    if (cid <= 0 || isNaN(cid)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere id numérico mayor a 0.` });
    } else {
        const cart = await manager.getCartById(cid);
        if(cart.id !== undefined) {
            res.status(200).send({ status: 'Ok', payload: cart });
        } else {
            res.status(400).send({ status: 'Not Ok', payload: [], error: `El carrito buscado con id ${cid} no existe` });
        }
    };
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cid = +req.params.cid;
    const pid = +req.params.pid;
    if (cid <= 0 || isNaN(cid) || pid <= 0 || isNaN(pid)) {
        res.status(400).send({ status: 'Not Ok', payload: [], error: `Se requiere id de carrito o producto numérico mayor a 0.` });
    } else {
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
    };
});

export default router;