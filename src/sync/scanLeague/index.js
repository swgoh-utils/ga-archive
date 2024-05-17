'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const { eachLimit } = require('async')
const getHistory = require('./getHistory')
const getPlayerIds = require('./getPlayerIds')
const reportStart = async(info = {}, num)=>{
  if(!info.notificationSent){
    await mongo.set('gaEvents', {_id: info.eventInstanceId }, {[`leagues.${info.league}.notificationSent`]: true})
    let msg2send = `Starting GA history scan for ${info.league}. Looking for ${num}`
    log.info(msg2send)
    //SendNotification('Starting GA history scan for **'+info.league+'**...')
  }else{
    log.debug(`Restarting history scan for ${info.league} looking for ${num} players...`)
  }
}
module.exports = async(info = {})=>{

  let count = 0, found = 0, missed = 0

  let players = await getPlayerIds(info)
  if(!players || players?.length == 0) return
  let startTime = Date.now()
  log.debug(`history scan for ${info.season} ${info.league} ${info.date} looking for ${players.length} players...`)
  await eachLimit(players, 80, async(playerId)=>{
    count++
    let status = await getHistory(info, playerId)
    if(status){
      if(found == 0) reportStart(info, players.length)
      found++
    }
  })

  let scanTime = (Date.now() - startTime) / 1000
  if(found) log.debug(`Completed ${info.league} ${info.date} GA history scan in ${scanTime} seconds. Found ${found}/${players.length}`)
}
