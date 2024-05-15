import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'carts';

const schema = new mongoose.Schema({
    products: { type: Array, require: true }
});

//Consultar si hace falta definir de que esta compuesto el array products, en este caso, el id del prod y quantity.
// {
//     "id": 1,
//     "quantity": 1
//   },

const model = mongoose.model(collection, schema);

export default model;