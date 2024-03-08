'use strict'

import Category from '../category/category.model.js'
import { encrypt, checkPassword, checkUpdate, checkUpdateCategory } from '../utils/validator.js'
import { tokenSign, verifyToken } from '../helpers/generateToken.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'
import Cart from '../cart/cart.model.js'
import Purchase from './purchase.model.js'
import nodemailer from 'nodemailer'
//PDF
import PDFDocument from 'pdfkit-table'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import url from 'url'

//CREAR PDF
export const buildPDF = async (req, res, purchase) => {
    try {
        const doc = new PDFDocument();

        /* const __filename = fileURLToPath(import.meta.url); */
        const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

        // Nombre del archivo PDF
        const user = purchase.user;
        const cantidadCompras = await Purchase.find({ user: user })
        const cantidad = cantidadCompras.length

        const fileName = `Factura-${user.name}-${user.surname}-${cantidad}.pdf`;
        const filePath = path.join(__dirname, '..', 'facturas', fileName);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        
        doc.pipe(res);
        
        doc.text('Factura de Compra', { align: 'center' }).moveDown();
        doc.text(`A nombre de: ${purchase.user.name} ${purchase.user.surname}`).moveDown();
        const dateString = purchase.date.toString();
        const deletedStart = dateString.slice(4, 25);
        doc.text(`Fecha de compra: ${deletedStart}`).moveDown();
        
        const tableArray = {
            headers: ['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'],
            rows: []
        };

        for (const item of purchase.products) {
            let product = await Product.findById(item.productId);
            if (!product) continue; 

            let subtotal= item.quantity * item.price
            tableArray.rows.push([
                product.name,
                item.quantity,
                item.price,
                subtotal
            ]);
            console.log(product.name)
            console.log(item.quantity)
            console.log(item.price)
            console.log(subtotal)
            console.log(tableArray)
            console.log("dsafsdf")
        }

        doc.table(tableArray, { 
            prepareHeader: ()=> doc.font('Helvetica-Bold'),
            prepareRow: (row, i)=> doc.font('Helvetica').fontSize(10)
        });
                
        doc.moveDown().text(`Total: ${purchase.total}`);

        doc.pipe(fs.createWriteStream(filePath));
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error generating PDF' });
    }
};

// Función compra
export const compra = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = await verifyToken(token);

        if (decodedToken) {
            const userId = decodedToken._id;

            const cart = await Cart.findOne({ user: userId })
            if (!cart) {
                return res.status(404).send({ message: 'Cart not found' });
            }

            /* let cantidadVenta=0            
            console.log("Cantidad de veces vendida", cantidadVenta) */
            let total = 0;
            cart.products.forEach(item => {
                total += item.price * item.quantity;
                /* cantidadVenta=cart.products.quantity; */
            });

            const purchase = new Purchase({
                user: userId,
                products: cart.products,
                total
            });

            for (const item of purchase.products) {
                const product = await Product.findById(item.productId)
                if (product) {
                    product.cantidadVentas += item.quantity
                    product.save()
                }
            }

            await purchase.populate('user', ['name', 'surname'])
            await purchase.save();
            await Cart.deleteOne({ _id: cart._id });

            const user=await User.findOne({_id: userId})
            const email=user.email

            buildPDF(req, res, purchase);
            enviarMail(email)

        } else {
            return res.status(401).send({ message: 'Token inválido' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error removing product from cart' });
    }
};


/*//////////////////////////////////////////////////
                    HISTORIAL
*//////////////////////////////////////////////////
export const historial = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = await verifyToken(token)

        if (!decodedToken) return res.status(401).send({ message: 'Token inválido' })
        const userId = decodedToken._id;

        const compras = await Purchase.find({ user: userId }).select('_id total date'); // Modificado select
        if (!compras) return res.status(404).send({ message: 'No se encontraron compras para este usuario' })

        return res.send(['Historial de compras', { compras }])

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error with historial' })
    }
}



//ACTUALIZAR LA FACTURA
export const updateQuantityFromPurchase = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = await verifyToken(token);

        if (decodedToken) {
            const purchase = req.params.idPurchase
            const purchaseModify = await Purchase.findOne({ _id: purchase })
            /* const userId = decodedToken._id;    */

            const { productId } = req.params;
            const { quantity } = req.body;

            const productIndex = purchaseModify.products.findIndex(item => item.productId.toString() === productId);

            if (productIndex === -1) {
                return res.status(404).send({ message: 'Product not found in purchase' });
            }

            const { price } = purchaseModify.products[productIndex];

            const previousQuantity = purchaseModify.products[productIndex].quantity;

            purchaseModify.products[productIndex].quantity = quantity;

            purchaseModify.total += (quantity - previousQuantity) * price;

            if (quantity > previousQuantity) {
                await updateProductStock(productId, quantity - previousQuantity);
            } else if (quantity < previousQuantity) {
                await updateProductStock1(productId, previousQuantity - quantity);
            }

            await purchaseModify.save();

            /* await Purchase.findByIdAndDelete(purchase); */

            return res.status(200).send({ message: 'Product quantity modified in cart successfully' });
        } else {
            return res.status(401).send({ message: 'Token inválido' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error modifying product quantity in purchase' });
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
        await product.save();
    } catch (error) {
        throw new Error('Error updating product stock');
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


////////ENVÍA CORREO AL REALIZAR COMPRA
export const enviarMail=async(email)=>{
    const config={
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'jamesbriansipacsipac@gmail.com',
            pass: 'yiby gdvk nbth qahj'
        }
    }

    const mensaje={
        from : 'jamesbriansipacsipac@gmail.com',
        to: email,
        subject: 'Compra',
        text: 'Le agradecemos por su compra realizada, Feliz día'
    }

    const transport=nodemailer.createTransport(config)

    const info=await transport.sendMail(mensaje)

    console.log(info, email)
}

