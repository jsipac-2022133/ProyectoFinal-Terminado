//configuración de express  

//importaciones
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import {config} from 'dotenv'
import userRouter from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import productRoutes from '../src/product/product.routes.js'
import cartRoutes from '../src/cart/cart.routes.js'
import compraRoutes from '../src/purchase/purchase.routes.js'

//configuraciones
const app=express() //crear el servidor
config()
const port=process.env.PORT || 3200

//configurar el servidor de express
app.use(express.urlencoded({extended: false}))
app.use(express.json()) //para que entienda json
app.use(cors()) //aceptar o denegar solicitudes de diferentes orígenes(local, remota)
app.use(helmet()) //aplica capa de seguridad 
app.use(morgan('dev')) //crea logs de solicitudes al servidor http

//declaración de rutas
app.use(userRouter)
app.use(categoryRoutes)
app.use(productRoutes)
app.use(cartRoutes)
app.use(compraRoutes)

//levantar el servidor
//exports solo sirve con callbacks
export const initServer=()=>{
    app.listen(port)
    console.log(`Server HTTP is running in port ${port}`)
}