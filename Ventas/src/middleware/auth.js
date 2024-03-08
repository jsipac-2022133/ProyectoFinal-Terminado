import { verifyToken } from "../helpers/generateToken.js";
import userModel from '../user/user.model.js'


//Esto funciona para que necesites estar registrado para realizar cierta consulta
export const checkAuth=async(req,res,next)=>{
    try {
        const token=req.headers.authorization.split(' ').pop()
        const tokenData= await verifyToken(token)
        console.log(tokenData)
        if(tokenData._id){
            next()
        }else{
            res.status(409)
            res.send({error: 'No estás autorizado'})
        }        
    } catch (error) {
        console.log(error)
        res.status(409)
        res.send({error: 'No estás autorizado'})
    }
}

export const checkRoleAuth=(roles)=>async(req,res,next)=>{
    try {
        const token=req.headers.authorization.split(' ').pop()
        const tokenData=await verifyToken(token)
        const userData=await userModel.findById(tokenData._id)

        if([].concat(roles).includes(userData.role)){
            next()
        }else{
            res.status(409)
            res.send({error: 'No tienes permisos'})
        }        
    } catch (error) {
        
    }
}