'use strict'
import Category from '../category/category.model.js'
import { verifyToken } from '../helpers/generateToken.js'
import {checkUpdateCategory} from '../utils/validator.js'
import Product from './product.model.js'

//AGREGAR PRODUCTO
export const addProduct=async(req,res)=>{
    try {
        let data=req.body

        let category=await Category.findOne({_id: data.category})
        if(!category) return res.status(404).send({message: 'Category not found'})

        data.status=1

        let product=new Product(data)
        await product.save()
        return res.send({message: 'Product saved successfully'})

    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error saving product'})
    }
}


//MOSTRAR
export const getAllProducts = async (req, res) => {
    try {
        let products = await Product.find().populate('category'); 
        if (products.length === 0) return res.status(404).send({ message: 'No hay productos que mostrar' });
        return res.send({ products });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al obtener productos' });
    }
}


//ACTUALIZAR
export const updateProduct=async(req,res)=>{
    try {
        let {id}=req.params
        let data=req.body

        let update=checkUpdateCategory(data,id)
        if(!update) return res.status(400).send({message: 'Have submitted data that cannot be update or missing data'})

        let updatedProduct=await Product.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        ).populate('category', ['name'])

        if(!updatedProduct) return res.status(404).send({message: 'Product not found and not updated'})
        return res.send({message: 'Product updated successfully', updatedProduct})
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error updating product'})
    }
}

//ELIMINAR
export const deleteProduct = async (req, res) => {
    try {
        let { id } = req.params;

        let deletedProduct = await Product.findOne({ _id: id });
        if (!deletedProduct) return res.status(404).send({ message: 'Product not found and not deleted' });
        
        deletedProduct.status = 0;
        deletedProduct.stock=0

        await deletedProduct.save();

        return res.send({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating product status' });
    }
};

//BUSCAR
export const searchProduct = async (req, res) => {
    try {
        const { search } = req.body;
        
        // Verificar si se proporciona un término de búsqueda válido
        if (!search || typeof search !== 'string' || search.trim() === '') {
            return res.status(400).send({ message: 'Invalid search term' });
        }
        
        // Crear una expresión regular para buscar los productos que contienen las palabras
        const regex = new RegExp(search.trim(), 'i'); // 'i' para hacer la búsqueda insensible a mayúsculas y minúsculas
        
        // Buscar productos que contienen las palabras en el nombre
        let products = await Product.find({ name: regex }).populate('category', ['name']);
        
        if (products.length === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }
        
        return res.send({ message: 'Products found', products });    

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error searching for products' });
    }
}




/*//////////////////////////////////////////////////
                    PRODUCTOS MÁS VENDIDOS
*//////////////////////////////////////////////////
export const masVendidos=async(req,res)=>{
    try {
        const token=req.headers.authorization.split(' ')[1]
        const decodedToken=verifyToken(token)
        if(!decodedToken) return res.status(401).send({message: 'Token inválido'})
        const products=await Product.find().sort({cantidadVentas: -1}).limit(5).select('-_id name price cantidadVentas')

        return res.send(['Productos más vendidos',{products}])

    } catch (error) {
        console.log(error)
        return res.status(500).send({message: 'Error getting most selled products'})
    }
}


/*//////////////////////////////////////////////////
                    PRODUCTOS POR CATEGORÍA
*//////////////////////////////////////////////////
export const productByCategory=async(req,res)=>{
    try {
        const nombreCategoria=req.body.category;
        const categoria=await Category.findOne({name: nombreCategoria})
        if(!categoria) return res.status(404).send({message: 'Category not found'})

        const products=await Product.find({category: categoria._id}).populate('category', ['-_id', 'name']).select('-_id name price category')

        res.send(['Empresas con la categoría especificada', products])
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error al obtener los productos por categoría'})
    }
}


/*//////////////////////////////////////////////////
                    PRODUCTOS POR NOMBRE
*//////////////////////////////////////////////////
export const productByName=async(req,res)=>{
    try {
        const nombre=req.body.name
        const producto=await Product.findOne({name: nombre})
        if(!producto) return res.status(404).send({message: 'Product not found'})

        return res.send(['Producto solicitado', producto])

    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error al obtener productos por nombre'})
    }
}


/*//////////////////////////////////////////////////
                    PRODUCTOS AGOTADOS
*//////////////////////////////////////////////////
export const productosAgotados=async(req,res)=>{
    try {
        const token=req.headers.authorization.split(' ')[1]
        const decodedToken=await verifyToken(token)
        if(!decodedToken) return res.status(401).send({message: 'Token inválido'})

        const productos=await Product.find({status: 0}).populate('category', ['-_id','name'])
        if(productos.length==0) return res.status(404).send({message: 'No existen productos agotados'})

        return res.send({message: `Los productos agotados son: `, productos})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error al obtener productos agotados'})
    }
}





