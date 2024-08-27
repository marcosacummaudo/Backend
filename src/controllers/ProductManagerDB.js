import ProductsService from '../services/Product.dao.mDB.js';

const service = new ProductsService();

class ProductManager {
    constructor() {
    }

    async addProduct(prodAdd, user) {
        try {
            if (!prodAdd.title || !prodAdd.description || !prodAdd.price || !prodAdd.code || !prodAdd.stock || !prodAdd.category) {
                return 0;
            } else {
                prodAdd.owner = user.email
                const products = await service.getOne( { code: prodAdd.code } );
                if (products) {
                    return 1;
                } else {
                    prodAdd.status = true;
                    const prodAdded = await service.add(prodAdd);
                    return prodAdded;
                }
            }
        } catch (error) {
            console.log('Error al agregar el producto a la BD.');
            console.log(error);
        }
    }

    async getProducts(limit, page, sort, query) {
        try {
            let products;
            let queryFilter = {};
            let options = {};
            
            // Función para parsear la URL y extraer los parámetros de consulta
            function parseQuery(queryString) {
                const parsedQuery = {};
                const parts = queryString.split(':');
                const key = parts[0];
                const value = parts[1].replace(/'/g, '').trim(); // Eliminar las comillas simples y espacios en blanco
                parsedQuery[key] = value;
                return parsedQuery;
            }

            if(query===undefined) {
                queryFilter = { };
            } else {
                queryFilter =  parseQuery(query);
            }

            if(sort===undefined) {
                options = {
                    page: page,
                    limit: limit,
                    lean: true
                };            
            } else {
                if(sort==='asc') {
                    options = {
                        page: page,
                        limit: limit,
                        lean: true,
                        sort: { price: 1 }
                    };                       
                } else {
                    options = {
                        page: page,
                        limit: limit,
                        lean: true,
                        sort: { price: -1 }
                    };   
                }         
            }

            products = await service.getPaginated( queryFilter , options );
            return products;
        } catch (error) {
            console.log('Error al mostrar los productos.');
            console.log(error);
        }
    }

    async getOneProduct(filter) {
        try {
            const products = await service.getOne(filter);
            if (!products) {
                console.log(`Producto con id ${products._id} no existe.`)
            } else {
                return products;
            }
        } catch (error) {
            console.log('Error al buscar el producto con el filtro.');
            console.log(error);
        }
    }

    async updateProduct(id, prodU, user) {
        try {
            const prodVerif = await service.getOne( { _id: id } );
            let product = undefined
            if(user.role === 'admin') {
                product = await service.update(id, prodU);
            } else {
                if(user.role === 'premium' && prodVerif.owner === user.email) {
                    product = await service.update(id, prodU);
                } else {
                    return 2;
                }
            }
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

    async deleteProduct(id, user) {
        try {
            const prodVerif = await service.getOne( { _id: id } );
            let product = undefined
            if(prodVerif === null) {
                return 0;
            }
            if(user.role === 'admin') {
                product = await service.delete( { _id: id } );
                return 1;
            } else {
                if(user.role === 'premium' && prodVerif.owner === user.email) {
                    product = await service.delete( { _id: id } );
                    return 2;
                } else {
                    return 3;
                }
            }
        } catch (error) {
            console.log('Error al intentar borrar el producto por su id.');
            console.log(error);
        }
    }
}

export default ProductManager;
