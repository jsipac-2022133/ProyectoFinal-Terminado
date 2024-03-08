'use strict'
import Usuario from './user.model.js'
import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import { tokenSign, verifyToken } from '../helpers/generateToken.js'

export const test=(req,res)=>{
    return res.send('Hello World')
}

//MOSTRAR
export const getAllUsers=async(req,res)=>{
    try {
        let usuarios=await Usuario.find()
        if(usuarios.length===0) return res.status(404).send({message: 'No hay usuarios que mostrar'})
        return res.send({usuarios})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error al obtener usuarios'})
    }
}


//REGISTRAR
export const register=async(req,res)=>{
    try {
        let data=req.body
        data.password=await encrypt(data.password)
        if(data.email.includes('@kinal.org')) data.role='ADMIN'
        if(!data.email.includes('@kinal.org')) data.role='CLIENT'

        let user=new Usuario(data)
        await user.save()

        return res.send({message: 'Registered Successfully'})

    } catch (error) {
        console.error(error)
        return res.satus(500).send({message: 'Error registering user', error})
    }
}

//LOGIN
export const login=async(req,res)=>{
    try {
        let {username, password}=req.body
        let user=await Usuario.findOne({username})
        const tokenSession=await tokenSign(user)

        if(user && await checkPassword(password, user.password)){
            let loggerUser={
                username: user.username,
                name: user.name,
                role: user.role,
                tokenSession
            }

            return res.send({message: `Welcome ${user.name}`, loggerUser})
        }
        return res.status(404).send({message: 'User or password incorrect'})

    } catch (error) {
        console.error(error)
        return res.satus(500).send({message: 'Error login in', error})
    }
}

export const updateMyAccount = async (req, res) => {
    try {        
        const token = req.headers.authorization.split(' ')[1];        
        const decodedToken = await verifyToken(token);
        
        if (decodedToken) {            
            const userIdToken = decodedToken._id; 
            const userIdParams = req.params.idUser; 
            
            if (userIdToken !== userIdParams) {
                return res.status(401).send({ message: 'No tiene permiso para realizar esta acción' });
            }

            const data = req.body;    
            
            const updateUser = await Usuario.findOneAndUpdate(
                { _id: userIdParams }, 
                data, 
                { new: true } 
            );
            
            if (!updateUser) {
                return res.status(404).send({ message: 'Usuario no encontrado o no actualizado' });
            }            
            return res.send({ message: 'Usuario actualizado exitosamente', updateUser });

        } else {            
            return res.status(401).send({ message: 'Token inválido' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al actualizar usuario', error });
    }
}



export const deleteMyAccount = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = await verifyToken(token);

        if (decodedToken) {
            const userId = decodedToken._id;
            const password = req.body.password;
            const idUserParam = req.params.idUser;

            if (!password) {
                return res.status(400).send({ message: 'Debe proporcionar su contraseña para eliminar la cuenta' });
            }

            if (userId !== idUserParam) {
                return res.status(403).send({ message: 'No tiene permiso para eliminar esta cuenta' });
            }
            
            const user = await Usuario.findById(userId);

            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }
            
            const isPasswordValid = await checkPassword(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).send({ message: 'La contraseña proporcionada es incorrecta' });
            }
            
            const deletedUser = await Usuario.findByIdAndDelete(userId);

            if (!deletedUser) {
                return res.status(404).send({ message: 'Usuario no encontrado o no eliminado' });
            }

            return res.send({ message: 'Usuario eliminado exitosamente' });
        } else {
            return res.status(401).send({ message: 'Token inválido' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al eliminar usuario', error });
    }
};



//ACTUALIZAR USUARIO
export const updateUser=async(req,res)=>{
    try {
        let userId = req.params.id;  
       
       const { password, ...updateData } = req.body;
       
       const user = await Usuario.findById(userId);

       if(user.role=='ADMIN') return res.send({message: 'No tienes permitido editar a otro admin'})

       if (!user) {
           return res.status(404).send({ message: 'Usuario no encontrado' });
       }

       if (password && !req.body.oldPassword) {
           return res.status(400).send({ message: 'Debe proporcionar la contraseña actual' });
       }
       
       if (password) {
           const isPasswordValid = await checkPassword(req.body.oldPassword, user.password);

           if (!isPasswordValid) {
               return res.status(401).send({ message: 'Contraseña incorrecta' });
           }
       }
       
       const updateUser = await Usuario.findByIdAndUpdate(userId, updateData, { new: true });

       if (!updateUser) {
           return res.status(404).send({ message: 'Usuario no encontrado o no actualizado' });
       }

       return res.send({ message: 'Usuario actualizado exitosamente', updateUser });
   } catch (error) {
       console.error(error);
       return res.status(500).send({ message: 'Error al actualizar usuario', error });
   }
}

//ELIMINAR USUARIO
export const deleteUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = verifyToken(token);
        
        if (!decodedToken) {
            return res.status(401).send({ message: 'Token inválido' });
        }

        const userId = req.params.id;
        const user = await Usuario.findOne({ _id: userId });
        
        if (user.role === 'ADMIN') {
            return res.status(403).send({ message: 'No puedes eliminar a un admin' });
        }

        const deletedUser = await Usuario.findOneAndDelete({ _id: userId });

        if (!deletedUser) {
            return res.status(404).send({ message: 'Error al eliminar usuario' });
        }

        return res.send({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error eliminando usuario', error });
    }
}
