import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import config from './config.js';
import productsRouter from './routes/productDB.routes.js';
import cartsRouter from './routes/cartsDB.routes.js';
import usersRouter from './routes/usersDB.routes.js';
import viewsRouter from './routes/views.routes.js';
import ProductManagerDB from './controllers/ProductManagerDB.js';
import MessageManagerDB from './controllers/MessageManagerDB.js';
//import UsersManagerDB from './controllers/UsersManagerDB.js';
import passport from 'passport';
import session from 'express-session';
import FileStore from 'session-file-store';
// import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import sessionRouter from './routes/sessions.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(config.SECRET));
    
const fileStorage = FileStore(session);
app.use(session({
    store: new fileStorage({ path: './sessions', ttl: 100, retries: 0 }),
    // store: MongoStore.create({ mongoUrl: config.MONGODB_URI, ttl: 600 }),
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set('view engine', 'handlebars');

app.use('/', viewsRouter);

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionRouter);

app.use('/static', express.static(`${config.DIRNAME}/public`));

const httpServer = app.listen(config.PORT, async () => {
    await mongoose.connect(config.MONGODB_URI);
    console.log(`Servidor Express activo en puerto ${config.PORT}, con conexion a Mongoose.`);
});

const socketServer = new Server(httpServer);
app.set('socketServer', socketServer);

//Escucho a un cliente
socketServer.on('connection', async (client) => {
    const messageManager = new MessageManagerDB();
    const savedMessages = await messageManager.getMessages();
    const messageRender = { messageRender: savedMessages };
    client.emit('cargaMessages', messageRender);
    
    const manager = new ProductManagerDB();
    const products = await manager.getProducts();
    const prodRender = { prodRender: products.docs };
    client.emit('cargaProducts', prodRender);

    client.on('newMessage', async (data) => {
        console.log(`Mensaje recibido desde: ${client.id}. Mensaje:${data.message}, con usuario: ${data.user}`);
        const message = await messageManager.saveMessage(data);
        socketServer.emit('newMessageConfirmation', (message));
    })
});

