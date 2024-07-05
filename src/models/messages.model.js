import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'messages';

const schema = new mongoose.Schema({
    user: { type: String, require: true },
    message: { type: String, require: true },
    date: { type: Date, default: Date.now }
});

const model = mongoose.model(collection, schema);

export default model;