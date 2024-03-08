// configuración de conexión de mongo db
'use strict'
import mongoose from 'mongoose'

export const connect=async()=>{
    try {
        mongoose.connection.on('error',()=>{
            console.log('MongoDB | could not be connected to mongodb')
            mongoose.disconnect()
        })

        mongoose.connection.on('connecting',()=>{
            console.log('MongoDB | try connecting')
        })

        mongoose.connection.on('connected',()=>{
            console.log('MongoDB | connected to mongodb')
        })

        mongoose.connection.on('open',()=>{
            console.log('MongoDB | connected to database')
        })

        mongoose.connection.on('disconnected',()=>{
            console.log('MongoDB | disconected')
        })

        mongoose.connection.on('reconnected',()=>{
            console.log('MongoDB | reconnected to mongodb')
        })

        await mongoose.connect('mongodb://127.0.0.1:27017/Ventas2022133')
    } catch (error) {
        console.error('Database connection failed',error)
    }
}