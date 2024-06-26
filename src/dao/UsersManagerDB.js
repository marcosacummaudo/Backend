import usersModel from '../dao/models/users.model.js';
import CartManagerDB from './CartManagerDB.js';

class UsersManager {
    constructor() {
    }

    async addUser(userAdd) {
        try {
            if (!userAdd.firstName || !userAdd.lastName || !userAdd.email || !userAdd.password || !userAdd.age) {
                return 0;
            } else {
                const users = await usersModel.findOne( { email: userAdd.email } ).lean();
                if (users) {
                    return 1;
                } else {
                    const cartManager = new CartManagerDB();
                    const newCart = await cartManager.newCart();
                    userAdd.cart = newCart._id
                    const userAdded = await usersModel.create(userAdd);
                    return userAdded;
                }
            }
        } catch (error) {
            console.log('Error al agregar un usuario a la BD.');
            console.log(error);
        }
    }

    async getUserByEmail(email) {
        try {

            const user = await usersModel.findOne( { email: email } ).lean();

            return user;
        } catch (error) {
            console.log('Error al buscar un usuario por su email.');
            console.log(error);
        }
    }
}

export default UsersManager;
