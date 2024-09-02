import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'carts';
//const collection = 'adoptme_carts';

const schema = new mongoose.Schema({
    // Inicialmente habia armado el modelo con id de Usuario, pero ahora nos piden cargarle el id de carrito al usuario.
    //_user_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'users' },
    products: { type: [ { _id: mongoose.Schema.Types.ObjectId, quantity: Number } ], require: true, ref: 'products' }
});

const model = mongoose.model(collection, schema);

export default model;