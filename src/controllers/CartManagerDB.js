import ProductManager from './ProductManagerDB.js';
import CartsService from '../services/Cart.dao.MDB.js';
import { v4 as uuidv4 } from 'uuid';

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
                    const prodIndex = cart.products.findIndex(prod => String(prod._id._id) === String(pid));
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

    async punchaseCart(cart) {
        try {
            console.log('Carrito a cerrar', cart);
            //console.log('Array de productos del carrito', cart.products);
            let totalTicket = 0;
            let cartUpdate = [];
            for (let i = 0; i < cart.products.length; i++) {
                if (cart.products[i]._id.stock >= cart.products[i].quantity) {
                    console.log('Si alcanza', cart.products[i]);
                    totalTicket =+ (cart.products[i].quantity * cart.products[i]._id.price);
                    const prodManager = new ProductManager();
                    const cantNewStock = cart.products[i]._id.stock - cart.products[i].quantity
                    
                    const prodEdit = await prodManager.updateProduct(cart.products[i]._id._id, { stock: cantNewStock } );
                    
                    cartUpdate = cart.products.splice(i, 1);
                    i--; // Decrementar el índice para ajustar el desplazamiento del array
                } else {
                    console.log('No alcanza');
                }
            };

            if (totalTicket > 0) {
                console.log('req.session.user: ', req.session.user)
                    
                const ticket = {
                    code: uuidv4(),
                    amount: totalTicket,
                    purchaser: 'ttttt'
                }
                
                console.log('Ticket: ', ticket);            
            }
            
            const cartResult = await service.update(cart._id, cart);

            return cartResult
            
        } catch (error) {
            console.log('Error al borrar los productos del carrito ttttttttttttttttttttttt.');
            console.log(error);
        }
    }
}

export default CartManager;
