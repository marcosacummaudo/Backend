//import chai from 'chai';
import * as chai from 'chai'; //Tuve ue importar asi chai porque de la otra forma me daba error.
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');
let cookieData = '';
let idProd = '';

describe('Test Integración Sessions con Sesiones', function () {
    
    before(async function () {
        const loginResult  = await requester.post('/api/sessions/login').send( { "email": "jperez@gmail.com", "password": "abc445" } );
        cookieData = loginResult.headers['set-cookie'][0];
    });

    beforeEach(function () {
        this.timeout = 3000;
    });

    it('GET /api/sessions/hash/:password debe devolver una password hasheada.', async function () {
        const pass = 'pepe1';
        const { _body, statusCode } = await requester.get(`/api/sessions/hash/${pass}`);
        expect(statusCode).to.be.equals(200);
        expect(_body).to.have.property('payload');
    });

    it('POST /api/sessions/login NO debe iniciar sesion por tener datos invalidos.', async function () {
        const { _body, statusCode } = await requester.post('/api/sessions/login').send( { "email": "pepe@gmail.com", "password": "zzz445" } );    
        expect(statusCode).to.be.equals(401);
        expect(_body).to.have.property('payload');
        expect(_body.payload).to.include('Datos de acceso no válidos');
    }); 
    
    // No hago test de post valido porque ya lo estoy usando para iniciar la sesion en todos los test.

});