'use strict'

import express from 'express'
import { checkAuth, checkRoleAuth } from '../middleware/auth.js'
import { addCategory,deleteCategory, getAllCategories, updateCategory } from './category.controller.js'

const api=express.Router()

api.post('/addNewCategory', checkAuth, checkRoleAuth('ADMIN'), addCategory)
api.get('/selectCategories', checkAuth, getAllCategories)
api.put('/updateCategory/:id', checkAuth, checkRoleAuth('ADMIN'), updateCategory)
api.delete('/deleteCategory/:id', checkAuth, checkRoleAuth('ADMIN'), deleteCategory)

export default api