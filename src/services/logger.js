import winston from 'winston';
import config from '../config.js';

const customLevelsOptions = {

    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,


    },
    colors: {
        fatal: 'red bold',
        error: 'red',
        warning: 'yellow',
        info: 'blue',
        http: 'white',
        debug: 'green',
    }

};


const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({ level: 'debug', format: winston.format.combine( winston.format.colorize({ colors: customLevelsOptions.colors }), winston.format.simple() ) }),
        new winston.transports.File({ level: 'error', filename: `${config.DIRNAME}/logs/data.log`, format: winston.format.simple() }),
    ]
});

const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({ level: 'info', format: winston.format.combine( winston.format.colorize({ colors: customLevelsOptions.colors }), winston.format.simple() ) }),
        new winston.transports.File({ level: 'error', filename: `${config.DIRNAME}/logs/data.log`, format: winston.format.simple() }),
    ]
});

const addLogger = (req, res, next) => {

    if (process.env.MODO === 'prod') {
        req.logger = prodLogger;
    } else {
        req.logger = devLogger;
    };

    
    req.logger.info(`${new Date().toDateString()} ${req.method} ${req.url}`);

    next();
}

export default addLogger;
