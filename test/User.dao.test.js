import Assert from 'assert';
import mongoose from 'mongoose';
import UsersDAO from '../src/dao/Users.dao.js';

const connection  = await mongoose.connect('mongodb://127.0.0.1:27017/coder_53160');
const dao = new UsersDAO();
const assert = Assert.strict;
const testUser = { first_name: 'Juan', last_name: 'Perez', email: 'jperez@gmail.com', password: 'abc445' };

describe('Test DAO Users', function () {
    // Se ejecuta ANTES de comenzar el paquete de tests
    before(function () {});
    // Se ejecuta ANTES DE CADA test
    beforeEach(function () {});
    // Se ejecuta LUEGO de finalizar el paquete de tests
    after(function () {});
    // Se ejecuta LUEGO DE CADA test
    afterEach(function () {});

    it('get() debe retornar un array de usuarios', async function () {
        const result = await dao.get();
        assert.strictEqual(Array.isArray(result), true);
    });
    
    it('', async function () {});
});