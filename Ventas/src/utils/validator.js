import {compare, hash} from 'bcrypt'

export const encrypt=(password)=>{
    try {
        return hash(password,10)
    } catch (error) {
        console.error(error)
        return error
    }
}

export const checkPassword=async(password, hash)=>{
    try {
        return await compare(password, hash)
    } catch (error) {
        console.error(error)
        return error
    }
}

export const checkUpdate=(data, userID)=>{
    if(userID){
        if(Object.entries(data).length===0 ||
        data.password ||
        data.password=='' ||
        data.role ||
        data.role == '') return false
        return true
    }else{
        return false
    }
}

export const checkUpdateCategory = (data, categoryID) =>{
    if (categoryID) {
        if (Object.entries(data).length === 0) 
        return false  
        return true
    } else{
        return false
    }
}

