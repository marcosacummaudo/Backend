import { Router } from "express";
import ProductManager from '../ProductManager.js';

const router = Router();

const manager = new ProductManager();

router.get('/home', async (req, res) => {
    const limit = +req.query.limit || 0;
    const prodRender = { products: await manager.getProducts(limit) };
    res.render('home', prodRender);
});

router.get('/realTimeProducts', async (req, res) => {
    const limit = +req.query.limit || 0;
    const prodRender = { prodRender: await manager.getProducts(limit) };
    res.render('realTimeProducts', prodRender);
});

export default router;