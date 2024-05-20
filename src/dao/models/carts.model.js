import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'carts';

const schema = new mongoose.Schema({
    _user_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'users' },
    products: { type: [ { _id: mongoose.Schema.Types.ObjectId, quantity: Number } ], require: true, ref: 'products' }
});

//schema.pre

//Consultar si hace falta definir de que esta compuesto el array products, en este caso, el id del prod y quantity.
// {
//     "id": 1,
//     "quantity": 1
//   },

const model = mongoose.model(collection, schema);

export default model;