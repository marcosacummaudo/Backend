import fs from 'fs'

class ProductManager {
    constructor() {
        this.path = './src/products.json';
    }

    async addProduct(title, description, price, thumbnail, code, stock) {
        try {
            if (!title || !description || !price || !thumbnail || !code || !stock) {
                console.log("Todos los campos son obligatorios.");
                return;
            } else {
                const products = await this.getProductsFromFile();
    
                if (products.some(product => product.code === code)) {
                        console.log(`El código ${code} de producto ya existe.`);
                        return;
                } else {
                    const product = {
                        id: 0,
                        title: title,
                        description: description,
                        price: price,
                        thumbnail: thumbnail,
                        code: code,
                        stock: stock
                    };
                    product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                    products.push(product);
                    await this.saveProductsToFile(products);
                    console.log(`Producto con código ${code}, agregado OK`);
                }
            }
        } catch (error) {
            console.log('Error al agregar el producto.');
            console.log(error);
        }
    }

    async getProducts(limit) {
        try {
           
            if(!fs.existsSync(this.path)) {
                console.log('El archivo no existe');
                return;
            } else {
                const products = await this.getProductsFromFile();
                if (products.length === 0) {
                    console.log('El archivo esta vacio')
                } else {
                    return limit === 0 ? products : products.slice(0, limit);
                }
            }

        } catch (error) {
            console.log('Error al mostrar los productos.');
            console.log(error);
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getProductsFromFile();
            const prod = products.find(prod => prod.id === +id) || {};
            if (prod === undefined) {
                console.log(`Producto con id ${id} no existe.`)
            } else {
                return prod;
            }
        } catch (error) {
            console.log('Error al buscar el producto por su id.');
            console.log(error);
        }
    }

    async updateProduct(id, prodU) {
        try {
            const products = await this.getProductsFromFile();
            const index = products.findIndex(product => product.id === id);
            console.log('indice:', index);
            console.log('title:', prodU.title);
            if (index !== -1) {
                console.log('objeto encontrado:', products[index]);
                products[index].title = prodU.title;
                products[index].description = prodU.description;
                products[index].price = prodU.price;
                products[index].thumbnail = prodU.thumbnail;
                products[index].code = prodU.code;
                products[index].stock = prodU.stock;
                await this.saveProductsToFile(products);
                console.log(`El producto con id ${id} fue modificado.`, products[index]);
            } else {
                console.log(`No se encontro el producto con id ${id} para ser editado.`)
            }
        } catch (error) {
            console.log('Error al intentar actualizar el producto por su id.');
            console.log(error);
        }
    }

    async deleteProduct(id) {
        try {
            const products = await this.getProductsFromFile();
            const prod = products.find(prod => prod.id === id);
            if (prod === undefined) {
                console.log(`Producto con id ${id} no existe, por lo tanto no se puede borrar.`)
            } else {
                const productsFilter = products.filter(product => product.id !== id);
                await this.saveProductsToFile(productsFilter);
                console.log(`Se borro el producto con id ${id}. Productos restantes:`, productsFilter);
            }
        } catch (error) {
            console.log('Error al intentar borrar el producto por su id.');
            console.log(error);
        }
    }

    async getProductsFromFile() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('Error al intentar leer los productos del archivo.');
            console.log(error);
        }
    }

    async saveProductsToFile(products) {
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
    }
}

export default ProductManager;
