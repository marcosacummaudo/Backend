import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'carts';

const schema = new mongoose.Schema({
    _user_id: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'users' },
    products: { type: [ { _id: mongoose.Schema.Types.ObjectId, quantity: Number } ], require: true, ref: 'products' }
});

const model = mongoose.model(collection, schema);

export default model;