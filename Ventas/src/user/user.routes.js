'user strict'

import express from "express"
import { test, register, getAllUsers, login, updateMyAccount, 
    deleteMyAccount, updateUser, deleteUser } from "./user.controller.js"
import { checkAuth, checkRoleAuth } from "../middleware/auth.js"

const api=express.Router()

api.get('/test', test)
api.post('/register', register)
api.post('/login',login)
api.put('/updateMyAcount/:idUser',updateMyAccount)
api.delete('/deleteMyAccount/:idUser', deleteMyAccount)
api.get('/selectUsers', checkAuth, checkRoleAuth('ADMIN'), getAllUsers)
//ADMIN ACTUALIZANDO USER
api.put('/updateUser/:id', checkAuth, checkRoleAuth('ADMIN'), updateUser)
//ADMIN ELIMINANDO USER
api.delete('/deleteUser/:id', checkAuth, checkRoleAuth('ADMIN'), deleteUser)

export default api