import messagesModel from '../models/messages.model.js';

class MessageService {
    constructor() {
    }

    add = async (newData) => {
        try {
            return await messagesModel.create(newData);
        } catch (err) {
            return err.message;
        };
    };

    get = async () => {
        try {
            return await messagesModel.find().sort({ date: -1 }).lean();
        } catch (err) {
            return err.message;
        };
    };
}

export default MessageService;
