import MessagesService from '../services/Message.dao.MDB.js';

const service = new MessagesService();

class MessageManager {
    constructor() {
    }

    async saveMessage(data) {
        try {
            const process = await service.add(data);
            return process;
            }
        catch (error) {
            console.log('Error al agregar un mensaje.');
            console.log(error);
        }
    }

    async getMessages() {
        try {
            const messages = await service.get();
            return messages
        } catch (error) {
            console.log('Error al mostrar los productos.');
            console.log(error);
        }
    }
}

export default MessageManager;
