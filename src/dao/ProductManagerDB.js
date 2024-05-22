import productsModel from '../dao/models/products.model.js';

class ProductManager {
    constructor() {
    }

    async addProduct(prodAdd) {
        try {
            if (!prodAdd.title || !prodAdd.description || !prodAdd.price || !prodAdd.code || !prodAdd.stock || !prodAdd.category) {
                return 0;
            } else {
                const products = await productsModel.findOne( { code: prodAdd.code } ).lean();
                if (products) {
                    return 1;
                } else {
                    prodAdd.status = true;
                    const prodAdded = await productsModel.create(prodAdd);
                    return prodAdded;
                }
            }
        } catch (error) {
            console.log('Error al agregar el producto a la BD.');
            console.log(error);
        }
    }

    async getProducts(limit) {
        try {
            let products;
            if(limit===0) {
                products = await productsModel.find().lean();
            } else {
                products = await productsModel.find().limit(limit).lean();
            };
            return products;
        } catch (error) {
            console.log('Error al mostrar los productos.');
            console.log(error);
        }
    }

    async getProductById(id) {
        try {
            const products = await productsModel.findById(id).lean();
            if (!products) {
                console.log(`Producto con id ${id} no existe.`)
            } else {
                return products;
            }
        } catch (error) {
            console.log('Error al buscar el producto por su id.');
            console.log(error);
        }
    }

    async updateProduct(id, prodU) {
        try {
            const product = await productsModel.findOneAndUpdate( { _id: id }, prodU, { new: true } );
            if (product) {
                return 0;
            } else {
                return 1;
            }
        } catch (error) {
            console.log('Error al intentar actualizar el producto por su id.');
            console.log(error);
        }
    }

    async deleteProduct(id) {
        try {
            const product = await productsModel.findOneAndDelete( { _id: id } );
            return product
        } catch (error) {
            console.log('Error al intentar borrar el producto por su id.');
            console.log(error);
        }
    }
}

export default ProductManager;
