'use strict'
const log = require('logger')
log.setLevel('debug');
const mongo = require('./remoteMongo')
const minio = require('./minio')
const sync = require('./sync')
const checkMongo = ()=>{
  try{
    let status = mongo.status()
    if(status){
      log.info('mongo(s) ready...')
      checkMinioReady()
      return
    }
    setTimeout(checkMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMongo, 5000)
  }
}
const checkMinioReady = ()=>{
  try{
    let status = minio.status()
    if(status){
      log.debug(`minio client is ready...`)
      startSync()
      return
    }
    setTimeout(checkMinioReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMinioReady, 5000)
  }
}
const startSync = async()=>{
  try{
    await sync()
    //setTimeout(startSync, 5000)
  }catch(e){
    log.error(e)
    setTimeout(startSync, 5000)
  }
}
checkMongo()
