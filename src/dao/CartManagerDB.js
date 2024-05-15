import fs from 'fs'
import ProductManager from './ProductManager.js';

class CartManager {
    constructor() {
        this.path = './src/carts.json';
    }

    async newCart() {
        try {
            const carts = await this.getCartsFromFile();
            const cart = {
                id: 0,
                products: []
            };
            cart.id = carts.length > 0 ? Math.max(...carts.map(p => p.id)) + 1 : 1;
            carts.push(cart);
            await this.saveCartsToFile(carts);
            return cart.id;
        } catch (error) {
            console.log('Error al crear un carrito.');
            console.log(error);
        }
    }
    
    async getCartById(id) {
        try {
            const carts = await this.getCartsFromFile();
            const cart = carts.find(cart => cart.id === +id) || {};
            return cart;
        } catch (error) {
            console.log('Error al buscar el carrito por su id.');
            console.log(error);
        }
    }

    async addToCart(cid, pid) {
        try {
            const carts = await this.getCartsFromFile();
            const cartIndex = carts.findIndex(cart => cart.id === +cid);
            if (cartIndex === -1) {
                return 0 //No exite el carrito
            } else {
                const prodManager = new ProductManager();
                const prod = await prodManager.getProductById(pid);
                if (prod.id === undefined) {
                    return 1 //No existe el producto
                } else {
                    const prodIndex = carts[cartIndex].products.findIndex(prod => prod.id === +pid);
                    if (prodIndex === -1) {
                        const prodAdd = { id: pid, quantity: 1}
                        carts[cartIndex].products.push(prodAdd);
                    } else {
                        carts[cartIndex].products[prodIndex].quantity++
                    }
                    await this.saveCartsToFile(carts);
                    return 2; //Se agrego el producto al carrito
                }
            }
        } catch (error) {
            console.log('Error al agregar un producto a un carrito.');
            console.log(error);
        }
    }

    async getCartsFromFile() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('Error al intentar leer los carritos del archivo.');
            console.log(error);
        }
    }

    async saveCartsToFile(carts) {
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    }
}

export default CartManager;
