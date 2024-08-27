//import chai from 'chai';
import * as chai from 'chai'; //Tuve ue importar asi chai porque de la otra forma me daba error.
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');
let cookieData = '';
let idProd = '';

describe('Test Integración Products con Sesiones', function () {
    
    before(async function () {

        const loginResult  = await requester.post('/api/sessions/login').send( { "email": "jperez@gmail.com", "password": "abc445" } );
        cookieData = loginResult.headers['set-cookie'][0];

    });

    beforeEach(function () {
        this.timeout = 3000;
    });

    it('GET /api/products debe obtener todos los productos', async function () {
        const { _body, statusCode } = await requester.get('/api/products')        
        expect(statusCode).to.be.equals(200);
        expect(_body.payload.docs).to.be.an('array');
    });

    it('POST /api/products debe agregar un nuevo producto', async function () {
        const newProduct = {
            title: 'Nuevo Producto',
            description: 'Descripción del producto',
            price: 100,
            code: 'UNIQUE_CODE1',
            stock: 10,
            category: 'futsal'
        };
        const { _body, statusCode } = await requester.post('/api/products')
            .set('Cookie', cookieData)
            .send(newProduct);
        idProd = _body.payload._id
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('code').eql('UNIQUE_CODE1');
    });


    it('GET /api/products/:id debe obtener un producto por su ID', async function () {
        const id = idProd;
        const { _body, statusCode } = await requester.get(`/api/products/${id}`)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('_id').eql(id);
        expect(_body.payload).to.have.property('category').eql('futsal');
    });

    it('POST /api/products NO debe agregar el producto por tener repetido el campo code', async function () {
        const newProduct = {
            title: 'Nuevo Producto',
            description: 'Descripción del producto',
            price: 100,
            code: 'UNIQUE_CODE1',
            stock: 10,
            category: 'futsal'
        };
        const { _body, statusCode } = await requester.post('/api/products')
            .set('Cookie', cookieData)
            .send(newProduct);
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).to.be.an('array').eql([]);
    });

    it('PUT /api/products/:id debe actualizar un producto por su ID', async function () {
        const id = idProd;
        const updatedProduct = { title: 'Producto Actualizado' };
        const { _body, statusCode } = await requester.put(`/api/products/${id}`)
            .set('Cookie', cookieData)
            .send(updatedProduct);
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('title').eql('Producto Actualizado');
        expect(_body.mensaje).to.include('fue modificado.');
    });

    it('PUT /api/products/:id NO debe actualizar el producto por no ser OWNER', async function () {
        const id = '66ccf973b302aea4f80d662c';
        const updatedProduct = { title: 'Producto Actualizado' };
        const { _body, statusCode } = await requester.put(`/api/products/${id}`)
            .set('Cookie', cookieData)
            .send(updatedProduct);
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).to.be.an('array').eql([]);
        expect(_body.error).to.include('El usuario premium logueado no es owner del producto a actualizar');
    });

    it('DELETE /api/products/:id debe eliminar un producto por su ID', async function () {
        const id = idProd;
        const { _body, statusCode } = await requester.delete(`/api/products/${id}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.be.an('array').eql([]);
        expect(_body.mensaje).to.include('El usuario premium elimino su producto');
    });

    it('DELETE /api/products/:id NO debe eliminar el producto por no ser OWNER', async function () {
        const id = '66ccf973b302aea4f80d662c';
        const { _body, statusCode } = await requester.delete(`/api/products/${id}`)
            .set('Cookie', cookieData)
            expect(statusCode).to.be.equals(400);
            expect(_body.payload).to.be.an('array').eql([]);
            expect(_body.error).to.include('El usuario premium logueado no es owner del producto a actualizar');
    });
});