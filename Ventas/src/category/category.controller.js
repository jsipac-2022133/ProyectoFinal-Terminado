'use strict'

import Category from '../category/category.model.js'
import { encrypt, checkPassword, checkUpdate, checkUpdateCategory } from '../utils/validator.js'
import {tokenSign, verifyToken} from '../helpers/generateToken.js'
import Product from '../product/product.model.js'

//MOSTRAR
export const getAllCategories=async(req,res)=>{
    try {
        let categorias=await Category.find()
        if(categorias.length===0) return res.status(404).send({message: 'No hay categorias que mostrar'})
        return res.send({categorias})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error al obtener categorias'})
    }
}

//AGREGAR CATEGORIA
export const addCategory=async(req,res)=>{
    try {
        console.log('JAMES')
        const token=req.headers.authorization.split(' ')[1]
        const decodedToken=await verifyToken(token)
        if(decodedToken){
            let data=req.body
            let categoria=new Category(data)
            await categoria.save()
            
            return res.send({message: 'Registered Successfully'})
        }else{
            return res.status(401).send({message: 'Unauthorized'})
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering category', error });
    }
}


//ACTUALIZAAAR
export const updateCategory=async(req,res)=>{
    try {
        const {id}=req.params
        const data=req.body
        const update=checkUpdateCategory(data, id)
        if(!update){
            return res.status(400).send({message: 'Have submitted some data that cannot be updated or missing data'})                        
        }
        const token=req.headers.authorization.split(' ')[1]
        const decodedToken=await verifyToken(token)

        if(!decodedToken){
            return res.status(401).send({message: 'Invalid token'})
        }
        let updatedCategory=await Category.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )

        if(!updatedCategory) return res.status(401).send({message: 'Category not found an not updated'})
        return res.send({message: 'Updated category', updatedCategory})


    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating curso' });
    }
}

//ELIMINARLA
export const deleteCategory = async (req, res) => {
    try {
        
        const { id } = req.params;
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(401).send({ message: 'Invalid token' });
        }
        console.log('Hola')
        // Verificar si la categoría predeterminada existe, si no, crearla
        let defaultCategory = await Category.findOne({ name: 'Default' });
        if (!defaultCategory) {
            defaultCategory = await Category.create({ name: 'Default', description: 'Categoría por defecto' });
        }

        // Actualizar los productos asociados a la categoría que se va a eliminar
        await Product.updateMany({ category: id }, { $set: { category: defaultCategory._id } });

        // Eliminar la categoría deseada
        let deletedCategory = await Category.findOneAndDelete({ _id: id });
        if (!deletedCategory) return res.status(404).send({ message: 'Categoría no encontrada y no eliminada' });

        return res.send({ message: `Categoría con nombre ${deletedCategory.name} eliminada exitosamente` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al eliminar la categoría' });
    }
}
