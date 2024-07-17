import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'tickets';

const schema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    // purchase_datetime: { type: date, required: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true }
},
{
    timeStamps: true
});

const model = mongoose.model(collection, schema);

export default model;