import express from 'express';
import config from './config.js';
import productsRouter from './routes/product.routes.js';
import cartsRouter from './routes/carts.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


//app.use(express.static('public'));
//app.use(express.static(`${config.DIRNAME}/public`));
app.use('/static', express.static(`${config.DIRNAME}/public`));

app.listen(config.PORT, () => {
    console.log(`Servidor Express activo en puerto ${config.PORT}`);
});
