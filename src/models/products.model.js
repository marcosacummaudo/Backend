import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null);

const collection = 'products';

const schema = new mongoose.Schema({
    title: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    code: { type: String, require: true },
    stock: { type: Number, require: true },
    category: { type: String, enum: ['f11', 'f5', 'futsal'], default: 'f11', require: true },
    status: { type: Boolean,  default: true, require: true },
    owner: { type: String, default: 'admin', require: true },
    thumbnail: { type: Array, require: false }
});

schema.plugin(mongoosePaginate);

const model = mongoose.model(collection, schema);

export default model;