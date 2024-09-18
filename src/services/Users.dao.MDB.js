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

    getAll = async () => {
        try {
            return await usersModel.find().select('firstName lastName email role last_connection').lean();
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

    delete = async (id) => {
        try {
            return await usersModel.findOneAndDelete( { _id: id } );
        } catch (err) {
            return err.message;
        };
    };
}

export default UsersService;
