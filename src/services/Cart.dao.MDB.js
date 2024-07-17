import cartsModel from '../models/carts.model.js';
import productsModel from '../models/products.model.js';
import ticketModel from '../models/tickets.model.js';

class CartsService {
    constructor() {
        
    }

    add = async (cart) => {
        try {
            return await cartsModel.create(cart);
        } catch (err) {
            return err.message;
        };
    };

    getOne = async (filter) => {
        try {
            return await cartsModel.findOne(filter).populate({ path: 'products._id', model: productsModel }).lean();
        } catch (err) {
            return err.message;
        };
    };

    update = async (id, cart) => {
        try {
            return await cartsModel.findOneAndUpdate( { _id: id }, cart, { new: true } );
        } catch (err) {
            return err.message;
        };
    };

    addTicket = async (ticket) => {
        try {
            return await ticketModel.create(ticket);
        } catch (err) {
            return err.message;
        };
    };

}

export default CartsService;
