import ProductManager from './ProductManagerDB.js';
import CartsService from '../services/Cart.dao.MDB.js';

const service = new CartsService();

class CartManager {
    constructor() {
        
    }

    async newCart() {
        try {
            const cart = {
                products: []
            };
            const cartAdded = await service.add(cart);
            return cartAdded
        } catch (error) {
            console.log('Error al crear un carrito.');
            console.log(error);
        }
    }
    
    async getCartById(cid) {
        try {
            const cart = await service.getOne({ _id: cid });
            return cart;
        } catch (error) {
            console.log('Error al buscar el carrito por su id.');
            console.log(error);
        }
    }

    async addToCart(cid, pid) {
        try {
            const cart = await service.getOne({ _id: cid });
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                const prodManager = new ProductManager();
                const prod = await prodManager.getOneProduct({ _id: pid });
                if (!prod) {
                    return 1 //No existe el producto
                } else {
                    const prodIndex = cart.products.findIndex(prod => String(prod._id) === String(pid));
                    if (prodIndex === -1) {
                        const prodAdd = { _id: pid, quantity: 1}
                        cart.products.push(prodAdd);
                    } else {
                        cart.products[prodIndex].quantity++
                    }
                    const cartUpdate = await service.update(cid, cart);
                    return 2; //Se agrego el producto al carrito
                }
            }
        } catch (error) {
            console.log('Error al agregar un producto a un carrito.');
            console.log(error);
        }
    }

    async deleteToCart(cid, pid) {
        try {
            const cart = await service.getOne({ _id: cid });
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                const prodIndex = cart.products.findIndex(prod => String(prod._id._id) === String(pid));
                    if (prodIndex === -1) {
                        return 1 //No existe el producto en ese carrito
                    } else {
                        cart.products.splice(prodIndex, 1);
                        const cartUpdate = await service.update(cid, cart);
                        return 2; //Se elimino el producto del carrito
                    }
            }
        } catch (error) {
            console.log('Error al eliminar un producto del carrito.');
            console.log(error);
        }
    }

    async updateProductsToCart(cid, prodUp) {
        try {
            const cart = await service.getOne({ _id: cid });
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                cart.products = prodUp;
                const cartUpdate = await service.update(cid, cart);
                return 1; //Se actualizo el array de productos del carrito
            }
        } catch (error) {
            console.log('Error al actualizar el array de productos en un carrito.');
            console.log(error);
        }
    }

    async updateQuantityProdToCart(cid, pid, quantityUp) {
        try {
            const cart = await service.getOne({ _id: cid });
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                const prodIndex = cart.products.findIndex(prod => String(prod._id._id) === String(pid));
                    if (prodIndex === -1) {
                        return 1 //No existe el producto en ese carrito
                    } else {
                        cart.products[prodIndex].quantity = quantityUp;
                        const cartUpdate = await service.update(cid, cart);
                        return 2; //Se actualizo la cantidad en el producto del carrito
                    }
            }
        } catch (error) {
            console.log('Error al actualizar la cantidad de un producto en un carrito.');
            console.log(error);
        }
    }

    async deleteAllProdToCart(cid) {
        try {
            const cart = await service.getOne({ _id: cid });
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                cart.products = [];
                const cartUpdate = await service.update(cid, cart);
                return 1; //Se reemplazo el array de productos por uno vacio
            }
        } catch (error) {
            console.log('Error al borrar los productos del carrito.');
            console.log(error);
        }
    }
}

export default CartManager;
