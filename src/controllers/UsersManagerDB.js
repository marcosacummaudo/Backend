import CartManagerDB from './CartManagerDB.js';
import UsersService from '../services/Users.dao.MDB.js';

const service = new UsersService();


class UsersDTO {
    constructor(user) {
        const { password, ...filteredFoundUser } = user;
        return filteredFoundUser;
    }
}

class UsersManager {
    constructor() {
    }

    async addUser(userAdd) {
        try {
            if (!userAdd.firstName || !userAdd.lastName || !userAdd.email || !userAdd.password || !userAdd.age) {
                return 0;
            } else {
                const users = await service.getOne( { email: userAdd.email } );
                if (users) {
                    return users;
                } else {
                    const cartManager = new CartManagerDB();
                    const newCart = await cartManager.newCart();
                    userAdd.cart = newCart._id
                    const userAdded = await service.add(userAdd);
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
            const user = await service.getOne({ email: email });
            return user;
        } catch (error) {
            console.log('Error al buscar un usuario por su email.');
            console.log(error);
        }
    }

    async getUserById(id) {
        try {
            const user = await service.getOne({ _id: id });
            return user;
        } catch (error) {
            console.log('Error al buscar un usuario por su email.');
            console.log(error);
        }
    }

    async UsersDTO(user) {
        const { password, ...filteredFoundUser } = user;
        return filteredFoundUser;
        }
}

export default UsersManager;
