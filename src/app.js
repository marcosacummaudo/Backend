import express from 'express';
import ProductManager from './ProductManager.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const manager = new ProductManager();

app.get('/', (req, res) => {
    res.send('Sistema activo');
});

app.get('/products', async (req, res) => {
    const limit = +req.query.limit || 0;
    const products = await manager.getProducts(limit);
    if(products.length>0) {
        res.status(200).send({ status: 'Ok', payload: products });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [] });
    }
});

app.get('/products/:pid', async (req, res) => {
    const pid = +req.params.pid;
    const product = await manager.getProductById(pid);
    if(product.code !== undefined) {
        res.status(200).send({ status: 'Ok', payload: product });
    } else {
        res.status(400).send({ status: 'Not Ok', payload: [], error: 'El producto buscado no existe.' });
    }
});

app.listen(8080, () => {
    console.log('Servidor Express activo en puerto 8080');
});
