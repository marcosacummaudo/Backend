import { Router } from "express";
import ProductManager from '../controllers/ProductManagerDB.js';
import CartManager from '../controllers/CartManagerDB.js';

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
    res.render('products', { user: req.session.user , prodRender: prodRender });
});

router.get('/carts/:cid', async (req, res) => {
    const cid = req.params.cid;
    const cartRender = { cartRender: await managerCart.getCartById(cid) };
    res.render('cart', cartRender);
});


router.get('/chat', (req, res) => {    
    res.render('chat', {});    
});


router.get('/register', (req, res) => {
    res.render('register', {});
});


router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/products');
    res.render('login', { showError: req.query.error ? true: false, errorMessage: req.query.error });
});

router.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('profile', { user: req.session.user });
});


export default router;