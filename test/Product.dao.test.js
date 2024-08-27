//import chai from 'chai';
import Assert from 'assert';
import mongoose from 'mongoose';
import UsersDAO from '../src/controllers/ProductManagerDB.js';

const connection  = await mongoose.connect('mongodb+srv://marcosacummaudo:CoderBackend2024@clustercoder.xi4oip9.mongodb.net/coder_53160');
const dao = new UsersDAO();
//const expect = chai.expect;
const assert = Assert.strict;
const testProduct = { title: 'Producto Nuevo Test', description: 'Este es un producto agregado en Test', price: 230, code: 'abc445', stock: 25, category: 'f11' };
const testUserUser = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445', role: 'user' };
const testUserPremium = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445', role: 'premium' };

describe('Test DAO Products', function () {
    // Se ejecuta ANTES de comenzar el paquete de tests
    before(function () {
        mongoose.connection.collections.adoptme_products.drop();
        this.timeout = 5000;
    });
    // Se ejecuta ANTES DE CADA test
    beforeEach(function () {
        //this.timeout = 3000;
    });
    // Se ejecuta LUEGO de finalizar el paquete de tests
    after(function () {});
    // Se ejecuta LUEGO DE CADA test
    afterEach(function () {});

    it('addProduct() debe retornar el producto agregado', async function () {
        const result = await dao.addProduct(testProduct,testUserPremium);
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result.thumbnail, []);
    });

    it('addProduct() debe retornar 1, ya que no se puede repetir el code', async function () {
        const result = await dao.addProduct(testProduct,testUserPremium);
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 1);
    });

    it('getProducts() debe retornar un array de Productos', async function () {
        const result = await dao.getProducts(10,1);
        assert.strictEqual(typeof(result), 'object');
        assert.strictEqual(Array.isArray(result.docs), true);
    });

    it('getOneProduct() debe retornar un Producto filtrando por code', async function () {
        const result = await dao.getOneProduct( { code: testProduct.code } );
        assert.strictEqual(typeof(result), 'object');
        assert.ok(result._id);
        assert.deepStrictEqual(result.thumbnail, []);
    });

    it('updateProduct() debe retornar un numero [0] Luego de haber actualizado el campo code del producto', async function () {
        const prodUpdate = await dao.getOneProduct( { code: testProduct.code } );
        const result = await dao.updateProduct( prodUpdate._id, { code: 'QWERTY-987456' }, testUserPremium );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 0);
    });

    it('updateProduct() debe retornar un numero [2] ya que al ser un usaurio User no puede actualizar el producto', async function () {
        const prodUpdate = await dao.getOneProduct( { code: 'QWERTY-987456' } );
        const result = await dao.updateProduct( prodUpdate._id, { code: 'QWERTY-123456' }, testUserUser );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 2);
    });

    it('deleteProduct() debe retornar un numero [3] ya que al ser un usaurio User no puede borrar el producto', async function () {
        const prodUpdate = await dao.getOneProduct( { code: 'QWERTY-987456' } );
        const result = await dao.deleteProduct( prodUpdate._id, testUserUser  );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 3);
    });

    it('deleteProduct() debe retornar un numero [2] ya que si se puede borrar el producto', async function () {
        const prodUpdate = await dao.getOneProduct( { code: 'QWERTY-987456' } );
        const result = await dao.deleteProduct( prodUpdate._id, testUserPremium  );
        assert.strictEqual(typeof(result), 'number');
        assert.strictEqual(result, 2);
    });

});