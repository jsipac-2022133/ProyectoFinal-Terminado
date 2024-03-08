'use strict'

import express from 'express'
import { checkAuth, checkRoleAuth } from '../middleware/auth.js'
import { addToCart, removeFromCart, updateQuantityFromCart } from './cart.controller.js'

const api=express.Router()

api.post('/addToCart', checkAuth, addToCart)
api.delete('/deleteProductFromCart/:productId', checkAuth, removeFromCart)
api.put('/updateQuantityProduct/:productId', checkAuth, updateQuantityFromCart)

export default api