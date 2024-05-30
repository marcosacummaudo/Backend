//import fs from 'fs'
import cartsModel from '../dao/models/carts.model.js';
import ProductManager from './ProductManagerDB.js';
import productsModel from './models/products.model.js';

class CartManager {
    constructor() {
        //this.path = './src/carts.json';
    }

    async newCart() {
        try {
            const cart = {
                _user_id: '664babaf8a9adb621273a771',
                products: []
            };
            const cartAdded = await cartsModel.create(cart);
            return cartAdded
        } catch (error) {
            console.log('Error al crear un carrito.');
            console.log(error);
        }
    }
    
    async getCartById(cid) {
        try {
            const cart = await cartsModel.findById(cid).populate({ path: 'products._id', model: productsModel }).lean();
            return cart;
        } catch (error) {
            console.log('Error al buscar el carrito por su id.');
            console.log(error);
        }
    }

    async addToCart(cid, pid) {
        try {
            const cart = await cartsModel.findById(cid).lean();
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                const prodManager = new ProductManager();
                const prod = await prodManager.getProductById(pid);
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
                    const cartUpdate = await cartsModel.findOneAndUpdate( { _id: cid }, cart, { new: true } );
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
            const cart = await cartsModel.findById(cid).lean();
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                const prodIndex = cart.products.findIndex(prod => String(prod._id) === String(pid));
                    if (prodIndex === -1) {
                        return 1 //No existe el producto en ese carrito
                    } else {
                        cart.products.splice(prodIndex, 1);
                        const cartUpdate = await cartsModel.findOneAndUpdate( { _id: cid }, cart, { new: true } );
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
            const cart = await cartsModel.findById(cid).lean();
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                //cart.products.push(prodUp);
                cart.products = prodUp;
                const cartUpdate = await cartsModel.findOneAndUpdate( { _id: cid }, cart, { new: true } );
                return 1; //Se actualizo el array de productos del carrito
            }
        } catch (error) {
            console.log('Error al actualizar el array de productos en un carrito.');
            console.log(error);
        }
    }

    async updateQuantityProdToCart(cid, pid, quantityUp) {
        try {
            const cart = await cartsModel.findById(cid).lean();
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                const prodIndex = cart.products.findIndex(prod => String(prod._id) === String(pid));
                    if (prodIndex === -1) {
                        return 1 //No existe el producto en ese carrito
                    } else {
                        cart.products[prodIndex].quantity = quantityUp;
                        const cartUpdate = await cartsModel.findOneAndUpdate( { _id: cid }, cart, { new: true } );
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
            const cart = await cartsModel.findById(cid).lean();
            if (!cart) {
                return 0 //No exite el carrito
            } else {
                cart.products = [];
                const cartUpdate = await cartsModel.findOneAndUpdate( { _id: cid }, cart, { new: true } );
                return 1; //Se reemplazo el array de productos por uno vacio
            }
        } catch (error) {
            console.log('Error al borrar los productos del carrito.');
            console.log(error);
        }
    }
}

export default CartManager;
