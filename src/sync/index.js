'use strict'
const mongo = require('mongoclient')
const checkLeagues = require('./checkLeagues')
const excludeSet = new Set(["CHAMPIONSHIPS_GRAND_ARENA_GA2_EVENT_SEASON_52:O1715115600000"])
const INSTANCE_ID = 'CHAMPIONSHIPS_GRAND_ARENA_GA2_EVENT_SEASON_52:O1714510800000'
module.exports = async()=>{
  let gaEvents = await mongo.find('gaEvents', {})
  if(!gaEvents || gaEvents.length === 0) return
  let timeNow = Date.now()
  for(let i in gaEvents){
    if(excludeSet.has(gaEvents[i]._id)) continue
    if(gaEvents[i].endTime > timeNow) continue
    if(gaEvents[i].season < 51) continue
    if(!gaEvents[i] || gaEvents[i].archiveScanComplete) continue
    await checkLeagues(gaEvents[i])
  }
}
