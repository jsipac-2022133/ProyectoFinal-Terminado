'use strict'

import mongoose from "mongoose"

const productSchema=mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    category:{
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: true
    },
    status:{
        type: Number,
        required: true
    },
    cantidadVentas:{
        type: Number,
        default: 0
    }
})

export default mongoose.model('product', productSchema)