import usersModel from '../models/users.model.js';

class UsersService {
    constructor() {
    }

    getOne = async (filter) => {
        try {
            return await usersModel.findOne(filter).lean();
        } catch (err) {
            return err.message;
        };
    };

    add = async (newData) => {
        try {
            return await usersModel.create(newData);
        } catch (err) {
            return err.message;
        };
    };

    update = async (id, user) => {
        try {
            return await usersModel.findOneAndUpdate( { _id: id }, user, { new: true } );
        } catch (err) {
            return err.message;
        };
    };
}

export default UsersService;
