'use strict'

import express from 'express'
import { checkAuth, checkRoleAuth } from '../middleware/auth.js'
import { compra, historial, updateQuantityFromPurchase } from './purchase.controller.js'

const api=express.Router()

api.get('/compra', checkAuth, compra)
api.get('/historial', checkAuth, historial)

//EDITAR FACTURA
api.put('/updateQuantityPurchase/:idPurchase/:productId', checkAuth, updateQuantityFromPurchase)

/* api.get('/invoice', buildPDF) */

export default api