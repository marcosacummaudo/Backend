import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import CustomError from './services/CustomError.class.js';
import { errorsDictionary } from './config.js';
import config from './config.js';

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);

export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });

export const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1]: undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`]: undefined;
    const queryToken = req.query.access_token ? req.query.access_token: undefined;
    const receivedToken = headerToken || cookieToken || queryToken;
    if (!receivedToken) return res.render('resetPass', { notToken: true });
    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ origin: config.SERVER, payload: 'Token no válido' });
        req.user = payload;
        next();
    });
}

export const verifyRequiredBody = (requiredFields) => {
    return (req, res, next) => {
        const allOk = requiredFields.every(field => 
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined
        );
        if (!allOk) throw new CustomError(errorsDictionary.FEW_PARAMETERS);
      next();
    };
};

// Para manejo de permisos
export const handlePolicies = policies => {
    return async (req, res, next) => {
        try {
            if (!req.session.user) throw new CustomError(errorsDictionary.INVALID_LOGIN);
            if (policies.includes('self') && req.session.user.cart === req.params.cid) return next();
            if (policies.includes(req.session.user.role)) return next();
            throw new CustomError(errorsDictionary.USER_ACCESS);
        } catch (error) {
            next(error);
        }
    }
}

// Función para generar un array de URLs de imágenes
function generateImageUrls(count) {
    let imageUrls = [];
    for (let i = 0; i < count; i++) {
        let imageUrl = faker.image.url();
        imageUrls.push(imageUrl);
    }
    return imageUrls;
    }

export const generateFakeProducts = async (qty) => {
    const products = [];
    const cat = ['f11', 'f5', 'futsal'];
    for (let i = 0; i < qty; i++) {
        const _id = faker.database.mongodbObjectId();
        const title = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const price = faker.commerce.price();
        const code = faker.string.uuid();
        const stock = faker.number.int({ min: 0, max: 1000 });
        const category = cat[Math.floor(Math.random() * cat.length)];
        const status = faker.datatype.boolean(0.9);
        const thumbnail = generateImageUrls(faker.number.int({ min: 1, max: 3 })); //Configuro para que genere hasta 3 imagenes por producto.

        products.push({ _id, title, description, price, code, stock, category, status, thumbnail });
    }
    return products;
}