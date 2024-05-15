import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import config from './config.js';
import productsRouter from './routes/product.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';

import ProductManager from './dao/ProductManager.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use('/', viewsRouter);

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

//app.use(express.static('public'));
//app.use(express.static(`${config.DIRNAME}/public`));
app.use('/static', express.static(`${config.DIRNAME}/public`));

const httpServer = app.listen(config.PORT, async () => {
    await mongoose.connect(config.MONGODB_URI);
    console.log(`Servidor Express activo en puerto ${config.PORT}, con conexion a Mongoose.`);
});

const socketServer = new Server(httpServer);
app.set('socketServer', socketServer);

//Escucho a un cliente
socketServer.on('connection', async (client) => {
    const manager = new ProductManager();
    const products = await manager.getProducts(0);
    console.log('Cliente conectado!!!');
    const prodRender = { prodRender: products };
    client.emit('cargaProducts', prodRender);
});

