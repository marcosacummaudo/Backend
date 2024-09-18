import { Router } from "express";
import ProductManager from '../controllers/ProductManagerDB.js';
import CartManager from '../controllers/CartManagerDB.js';
import config from '../config.js';
import { handlePolicies, generateFakeProducts, verifyToken } from '../utils.js';
import UsersManagerDB from '../controllers/UsersManagerDB.js';
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";

const router = Router();

const manager = new ProductManager();

const managerCart = new CartManager();

const managerUser = new UsersManagerDB();

const routeUrl = '/views'

router.param('cid', async (req, res, next, id) => {
    try {
        if (!config.MONGODB_ID_REGEX.test(id)) {
            throw new CustomError(errorsDictionary.INVALID_ID_USER);
        }
        next();
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res) => {
    const limit = +req.query.limit || 10;
    const products = { products: await manager.getProducts(limit) };
    console.log(products);
    res.render('home', products);
});

router.get('/realTimeProducts', handlePolicies(['admin','premium']), async (req, res) => {
    const limit = +req.query.limit || 10;
    const prodRender = { prodRender: await manager.getProducts(limit) };
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.render('realTimeProducts', prodRender);
});

router.get('/products', async (req, res) => {
    const page = +req.query.page;
    const limit = +req.query.limit || 10;
    const prodRender = { prodRender: await manager.getProducts(limit, page) };
    let isAdmin = false;
    let quantityProdCart = 0;
    if(req.session.user) {
        quantityProdCart = await managerCart.getQuantityProdCartById(req.session.user.cart);
        if(req.session.user.role==='admin') {
            isAdmin = true;
        }
    }
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.render('products', { user: req.session.user , prodRender: prodRender, quantity: quantityProdCart, isAdmin: isAdmin });
});

router.get('/documents', handlePolicies(['admin','premium','user']), async (req, res) => {
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.render('documents', { user: req.session.user });
});

router.get('/carts/:cid', handlePolicies(['admin','premium','user']), async (req, res) => {
    const cid = req.params.cid;
    const cartRender = { cartRender: await managerCart.getCartById(cid) };
    let quantityProdCart = 0;
    if(req.session.user) {
        quantityProdCart = await managerCart.getQuantityProdCartById(req.session.user.cart);
    }
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.render('cart', { user: req.session.user, cartRender: cartRender, quantity: quantityProdCart });
});

router.get('/chat', handlePolicies('admin','user'), (req, res) => {    
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.render('chat', {});    
});

router.get('/register', (req, res) => {
    res.render('register', {});
});

router.get('/resetPass', (req, res) => {
    res.render('resetPass', { notToken: false });
});

router.get('/insertPass/:token', verifyToken, async (req, res) => {
    const foundUser = await managerUser.getUserById( req.user._id );
    if (foundUser) {   
        res.render('insertPass', { user: foundUser });
    }     
});

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/products');
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.render('login', { showError: req.query.error ? true: false, errorMessage: req.query.error });
});

router.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('profile', { user: req.session.user });
});

// Dejo comentada la posibilidad de que funcione con un parametro de cantidad de productos a generar.
//router.get('/mockingproducts/:qty', async (req, res) => {
router.get('/mockingproducts', async (req, res) => {
    //const data = await generateFakeUsers(parseInt(req.params.qty));
    const data = await generateFakeProducts(parseInt(100));
    req.logger.info(`date: ${new Date().toDateString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.status(200).send({ status: 'OK', payload: data });
});

router.get('/loggerTest', async (req, res) => {
    req.logger.fatal(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | user: ${req.user}`);
    req.logger.error(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | user: ${req.user}`);
    req.logger.warning(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | user: ${req.user}`);
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | user: ${req.user}`);
    req.logger.http(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | user: ${req.user}`);
    req.logger.debug(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url} | user: ${req.user}`);
    res.status(200).send({ status: 'OK', payload: '' });
});

router.get('/users', handlePolicies(['admin']), async (req, res) => {
    const usersRender = { usersRender: await managerUser.getAllUsers() };
    req.logger.info(`date: ${new Date().toDateString()} ${new Date().toLocaleTimeString()} | method: ${req.method} | ip: ${req.ip} | url: ${routeUrl}${req.url}`);
    res.render('users', { user: req.session.user, usersRender: usersRender });
});

export default router;