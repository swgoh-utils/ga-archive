'use strict'
const mongo = require('mongoclient')
const remoteMongo = require('src/remoteMongo')
const minio = require('src/minio')
module.exports = async(info = {}, playerId)=>{
  try{
    let player = (await remoteMongo.find('gaHistory', { _id: `${playerId}-${info.eventInstanceId}` }, { _id: 0, TTL: 0, round: 0}))[0]
    if(!player?.matchResult) return
    delete player.round
    delete player._id
    delete player.TTL
    player.key = info.key
    let status = await minio.put(`ga-history-season-${info.season}`, `${playerId}-${info.key}`, player)
    if(!status) return
    await mongo.push('gaHistPlayersTemp', { _id: info.groupId }, { history: playerId })
    return true
  }catch(e){
    console.error(e)
  }
}
