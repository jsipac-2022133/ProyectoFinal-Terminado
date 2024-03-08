'use strict'
import express from 'express'
import { addProduct, deleteProduct, getAllProducts, searchProduct, 
    updateProduct, masVendidos, productByCategory, productByName, productosAgotados } from './product.controller.js'
import { checkAuth, checkRoleAuth } from "../middleware/auth.js"

const api=express.Router()

api.post('/addNewProduct', checkAuth, checkRoleAuth('ADMIN'), addProduct)
api.get('/selectProducts', checkAuth, getAllProducts)
api.put('/updateProduct/:id', checkAuth, checkRoleAuth('ADMIN'), updateProduct)
api.delete('/deleteProduct/:id', checkAuth, checkRoleAuth('ADMIN'), deleteProduct)

//Busca productos que contengan la palabra especificada
api.get('/search', checkAuth, searchProduct)
//Más vendidos
api.get('/moreSelled', checkAuth, masVendidos)
//Buscar por categoría
api.get('/searchByCategory', checkAuth, productByCategory)
//Buscar pro nombre
api.get('/searchByName', checkAuth, productByName)
//Buscar productos agotados
api.get('/productosAgotados', checkAuth, checkRoleAuth('ADMIN'), productosAgotados)

export default api