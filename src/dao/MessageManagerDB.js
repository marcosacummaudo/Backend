import messagesModel from './models/messages.model.js';

class MessageManager {
    constructor() {
    }

    async saveMessage(data) {
        try {
            const process = await messagesModel.create(data);
            return process;
            }
        catch (error) {
            console.log('Error al agregar un mensaje.');
            console.log(error);
        }
    }

    async getMessages() {
        try {
            const messages = await messagesModel.find().sort({ date: -1 }).lean();
            return messages
        } catch (error) {
            console.log('Error al mostrar los productos.');
            console.log(error);
        }
    }
}

export default MessageManager;
