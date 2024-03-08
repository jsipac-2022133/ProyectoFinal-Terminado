'use strict'
import Cart from './cart.model.js'
import Category from '../category/category.model.js'
import { encrypt, checkPassword, checkUpdate, checkUpdateCategory } from '../utils/validator.js'
import { tokenSign, verifyToken } from '../helpers/generateToken.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'


//AÑADIR AL CARRITO
export const addToCart = async (req, res) => {
    try {        
        const token = req.headers.authorization.split(' ')[1];        
        const decodedToken = await verifyToken(token);
        
        if (decodedToken) {        
            const userId = decodedToken._id;        
            const { productId, quantity } = req.body;        
            const product = await Product.findById(productId);
            console.log(productId)
            console.log(quantity)


            if(product.status==0){
                return res.status(404).send({message: 'Producto no en existencia actualmente'})
            }

            if (!product) {
                return res.status(404).send({ message: 'Product not found' });
            }
        
            if (quantity > product.stock) {
                return res.status(400).send({ message: 'Quantity exceeds available stock' });
            }
        
            const price = product.price;
            const total = quantity * price;
        
            const cartItem = {
                productId,
                quantity,
                price                
            };
        
            let cart = await Cart.findOne({ user: userId });
        
            if (!cart) {
                cart = new Cart({
                    user: userId,
                    products: [cartItem],
                    total
                });
            } else {        
                cart.products.push(cartItem);
                cart.total += total;
            }
        
            await updateProductStock(productId, quantity);        
            await cart.save();
            return res.send({ message: 'Product added to cart successfully' });
        } else {            
            return res.status(401).send({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error adding product to cart' });
    }
};

// Método para actualizar el stock del producto en el controlador de producto
const updateProductStock = async (productId, quantity) => {
    try {        
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }        
        product.stock -= quantity;
        if(product.stock==0){
            product.status=0
        }
        await product.save();
    } catch (error) {
        throw new Error('Error updating product stock');
    }
};



export const removeFromCart = async (req, res) => {
    try {        
        const token = req.headers.authorization.split(' ')[1];        
        const decodedToken = await verifyToken(token);
        
        if (decodedToken) {            
            const userId = decodedToken._id;            
            let cart = await Cart.findOne({ user: userId });
        
            if (!cart) {
                return res.status(404).send({ message: 'Cart not found' });
            }
        
            const { productId } = req.params;        
            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
        
            if (productIndex === -1) {
                return res.status(404).send({ message: 'Product not found in cart' });
            }

            const { quantity, price } = cart.products[productIndex];            
            
            cart.products.splice(productIndex, 1);
                        
            cart.total -= quantity * price;
            
            await cart.save();
            
            await updateProductStock1(productId, quantity);

            return res.status(200).send({ message: 'Product removed from cart successfully' });
        } else {
            
            return res.status(401).send({ message: 'Token inválido' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error removing product from cart' });
    }
};

// Método para actualizar el stock del producto en el controlador de producto
const updateProductStock1 = async (productId, quantity) => {
    try {        
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }        
        
        product.stock += quantity;
        await product.save();
    } catch (error) {
        throw new Error('Error updating product stock');
    }
};



//ACTUALIZAR CANTIDAD A COMPRAR
export const updateQuantityFromCart = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = await verifyToken(token);

        if (decodedToken) {
            const userId = decodedToken._id;
            let cart = await Cart.findOne({ user: userId });

            if (!cart) {
                return res.status(404).send({ message: 'Cart not found' });
            }

            const { productId } = req.params;
            const { quantity } = req.body;

            const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);

            if (productIndex === -1) {
                return res.status(404).send({ message: 'Product not found in cart' });
            }

            const { price } = cart.products[productIndex];
            
            const previousQuantity = cart.products[productIndex].quantity;
            
            cart.products[productIndex].quantity = quantity;
            
            cart.total += (quantity - previousQuantity) * price;
            
            if (quantity > previousQuantity) {                
                await updateProductStock(productId, quantity - previousQuantity);
            } else if (quantity < previousQuantity) {                
                await updateProductStock1(productId, previousQuantity - quantity);
            }

            await cart.save();

            return res.status(200).send({ message: 'Product quantity modified in cart successfully' });
        } else {
            return res.status(401).send({ message: 'Token inválido' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error modifying product quantity in cart' });
    }
};

