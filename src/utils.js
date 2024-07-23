import bcrypt from 'bcrypt';

import config from './config.js';

import { faker } from '@faker-js/faker';

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (passwordToVerify, storedHash) => bcrypt.compareSync(passwordToVerify, storedHash);


export const verifyRequiredBody = (requiredFields) => {
    return (req, res, next) => {
        const allOk = requiredFields.every(field => 
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined
        );
        
        if (!allOk) return res.status(400).send({ origin: config.SERVER, payload: 'Faltan propiedades', requiredFields });
  
      next();
    };
};

// Para manejo de permisos -- Ver si no hay que acomodarlo para sessiones.

export const handlePolicies = policies => {
    return async (req, res, next) => {
        console.log(req.session.user);
        console.log(req.session);
        if (!req.session.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });
        // Para verificar que sea su propio carrito
        if (policies.includes('self') && req.session.user.cart === req.param.id) return next();
        
        if (policies.includes(req.session.user.role)) return next();
        res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder al recurso' });
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