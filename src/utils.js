import bcrypt from 'bcrypt';

import config from './config.js';

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
