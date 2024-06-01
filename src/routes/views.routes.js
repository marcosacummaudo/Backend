import { Router } from "express";
import ProductManager from '../dao/ProductManagerDB.js';
import CartManager from '../dao/CartManagerDB.js';

const router = Router();

const manager = new ProductManager();

const managerCart = new CartManager();

router.get('/', async (req, res) => {
    const limit = +req.query.limit || 10;
    const products = { products: await manager.getProducts(limit) };
    console.log(products);
    res.render('home', products);
});

router.get('/realTimeProducts', async (req, res) => {
    const limit = +req.query.limit || 10;
    const prodRender = { prodRender: await manager.getProducts(limit) };
    res.render('realTimeProducts', prodRender);
});

router.get('/products', async (req, res) => {
    const page = +req.query.page;
    const limit = +req.query.limit || 10;
    const prodRender = { prodRender: await manager.getProducts(limit, page) };
    res.render('products', prodRender);
});

router.get('/carts/:cid', async (req, res) => {
    const cid = req.params.cid;
    const cartRender = { cartRender: await managerCart.getCartById(cid) };
    res.render('cart', cartRender);
});


router.get('/chat', (req, res) => {
    
    res.render('chat', {});
    
});


export default router;