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

    async getAllUsers() {
        try {
            const users = await service.getAll();
            return users;
        } catch (error) {
            console.log('Error al buscar todos los usuarios.');
            console.log(error);
        }
    }

    async deleteUser(user) {
        try {
            const foundUser = await service.delete({ _id: user._id });
            if (!foundUser) {
                return 0 //No exite el usuario
            } else {
                return foundUser; //Se actualizo la password del usuario
            }
        } catch (error) {
            console.log('Error al borrar el usuario.');
            console.log(error);
        }
    }

    async updatePass(user) {
        try {
            const foundUser = await service.getOne({ _id: user.foundUser._id });
            if (!foundUser) {
                return 0 //No exite el usuario
            } else {
                foundUser.password = user.password;
                const userUpdate = await service.update(user.foundUser._id, foundUser);
                return; //Se actualizo la password del usuario
            }
        } catch (error) {
            console.log('Error al actualizar la password de un usuario.');
            console.log(error);
        }
    }

    async updateRole(user) {
        try {
            const foundUser = await service.getOne({ _id: user.foundUser._id });
            if (!foundUser) {
                return 0 //No exite el usuario
            } else {
                foundUser.role = user.role;
                const userUpdate = await service.update(user.foundUser._id, foundUser);
                return userUpdate; //Se actualizo el role del usuario
            }
        } catch (error) {
            console.log('Error al actualizar la password de un usuario.');
            console.log(error);
        }
    }

    async updateLastConnection(user) {
        try {
            const foundUser = await service.getOne({ _id: user._id });
            if (!foundUser) {
                return 0 //No exite el usuario
            } else {
                foundUser.last_connection = Date.now();
                const userUpdate = await service.update(user._id, foundUser);
                return userUpdate; //Se actualizo el last_connection del usuario
            }
        } catch (error) {
            console.log('Error al actualizar la ultima fecha y hora de login del usuario.');
            console.log(error);
        }
    }

    async insertDocs(user, docs) {
        try {
            const foundUser = await service.getOne({ _id: user._id });
            if (!foundUser) {
                return 0 //No exite el usuario
            } else {
                for (let i = 0; i < docs.length; i++) {
                    foundUser.documents.push(docs[i])
                }
                const userUpdate = await service.update(user._id, foundUser);
                return userUpdate; //Se actualizo el last_connection del usuario
            }
        } catch (error) {
            console.log('Error al actualizar el array de documentos del usuario.');
            console.log(error);
        }
    }

    async UsersDTO(user) {
        const { password, ...filteredFoundUser } = user;
        return filteredFoundUser;
        }
}

export default UsersManager;
