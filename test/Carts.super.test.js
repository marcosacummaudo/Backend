//import chai from 'chai';
import * as chai from 'chai'; //Tuve ue importar asi chai porque de la otra forma me daba error.
import supertest from 'supertest';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');
let cookieData = '';
let idCart = '';

describe('Test Integración Carts con Sesiones', function () {
    
    before(async function () {
        const loginResult  = await requester.post('/api/sessions/login').send( { "email": "jperez@gmail.com", "password": "abc445" } );
        cookieData = loginResult.headers['set-cookie'][0];
    });

    beforeEach(function () {
        this.timeout = 3000;
    });

    it('POST /api/carts debe crear un nuevo carrito en blanco', async function () {
        const { _body, statusCode } = await requester.post('/api/carts');
        idCart = _body.payload._id;
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('_id').eql(idCart);
        expect(_body.payload).to.have.property('products').eql([]);
        expect(_body).to.have.property('status').eql('Ok');
    });

    it('GET /api/carts/:id debe obtener un carrito por su ID', async function () {
        const id = idCart;
        const { _body, statusCode } = await requester.get(`/api/carts/${id}`)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).to.have.property('_id').eql(id);
        expect(_body.payload).to.have.property('products').eql([]);
        expect(_body).to.have.property('status').eql('Ok');
    });

    it('GET /api/carts/:id NO debe obtener un carrito ya que su ID no es valido.', async function () {
        const { _body, statusCode } = await requester.get(`/api/carts/66556655`)
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).eql('');
        expect(_body).to.have.property('error');
    });

    it('POST /api/carts/:cid/product/:pid debe agregar un producto a un carrito.', async function () {
        const id = '66ccdd33339487fde2486b5e'; //Id de un cart de ese usuario.
        const pid = '66ccf973b302aea4f80d662c'; //Id de un producto valido que no es de este usuario.
        const { _body, statusCode } = await requester.post(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(4);
        expect(_body.mensaje).to.include('Se agrego el producto');
    });


    it('POST /api/carts/:cid/product/:pid NO debe agregar el producto al carrito por ser un producto del usuario.', async function () {
        const id = '66ccdd33339487fde2486b5e'; //Id de un cart de ese usuario.
        const pid = '66cd0f9b8d16fd6a31219f17'; //Id de un producto valido que es de este usuario.
        const { _body, statusCode } = await requester.post(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(400);
        expect(_body.payload).eql([]);
        expect(_body.error).to.include('El user es owner del producto');
    });

    it('PUT /api/carts/:cid debe editar el carrito con los productos del body.', async function () {
        const id = '66ccdd33339487fde2486b5e'; //Id de un cart de ese usuario.
        const Products = [ { "_id": "66ccf973b302aea4f80d662c", "quantity": 3 } ]
        const { _body, statusCode } = await requester.put(`/api/carts/${id}`)
            .set('Cookie', cookieData)
            .send(Products);
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(1);
        expect(_body.mensaje).to.include('Se modifico el carrito');
    });

    it('PUT /api/carts/:cid/product/:pid debe editar la cantidad del producto en el carrito.', async function () {
        const id = '66ccdd33339487fde2486b5e'; //Id de un cart de ese usuario.
        const pid = '66ccf973b302aea4f80d662c'; //Id de un producto valido que es de este usuario.
        const cant = { "quantity": 3 }
        const { _body, statusCode } = await requester.put(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
            .send(cant);
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(2);
        expect(_body.mensaje).to.include(`Se actualizo a ${cant.quantity} la cantidad del producto`);
    });

    it('DELETE /api/carts/:cid/product/:pid debe eliminar el producto del carrito.', async function () {
        const id = '66ccdd33339487fde2486b5e'; //Id de un cart de ese usuario.
        const pid = '66ccf973b302aea4f80d662c'; //Id de un producto valido que es de este usuario.
        const { _body, statusCode } = await requester.delete(`/api/carts/${id}/product/${pid}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql(2);
        expect(_body.mensaje).to.include(`Se elimino el producto`);
    });

    it('DELETE /api/carts/:cid debe eliminar todos los producto del carrito.', async function () {
        const id = '66ccdd33339487fde2486b5e'; //Id de un cart de ese usuario.
        const { _body, statusCode } = await requester.delete(`/api/carts/${id}`)
            .set('Cookie', cookieData)
        expect(statusCode).to.be.equals(200);
        expect(_body.payload).eql([]);
        expect(_body.mensaje).to.include(`Se vacio correctamente el carrito con id ${id}. OK`);
    });
});