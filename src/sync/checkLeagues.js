'use strict'
const log = require('logger')
const minio = require('src/minio')
const leagues = ['KYBER', 'AURODIUM', 'CHROMIUM', 'BRONZIUM', 'CARBONITE']
const scanLeague = require('./scanLeague')
const checkBuckets = async(season)=>{
  if(!season) return
  let status = minio.bucketExists(`ga-history-season-${season}`)
  if(!status) status = await minio.makeBucket(`ga-history-season-${season}`)
  if(!status){
    log.error(`error creating bucket ga-history-season-${season}`)
    return
  }
  return true
}
module.exports = async(gaEvent = {})=>{
  for(let i in gaEvent.leagues){
    //if(gaEvent.leagues[i].league !== 'KYBER') continue
    if(gaEvent.leagues[i].historyScanComplete) continue
    let status = await checkBuckets(gaEvent.season)
    if(status) await scanLeague({ ...JSON.parse(JSON.stringify(gaEvent)),...gaEvent.leagues[i] })
  }
}
