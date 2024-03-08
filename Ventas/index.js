//sirver para ejecutar servicios
//centralizar todas las ejecuciones de servicios
import {initServer} from './configs/app.js'
import {connect} from './configs/mongo.js'

initServer()       
connect()