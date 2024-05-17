'use strict'
const remoteMongo = require('src/remoteMongo')
const mongo = require('mongoclient')
let INSTANCE_ID = process.env.INSTANCE_ID, leagues = ['KYBER', 'AURODIUM', 'CHROMIUM', 'BRONZIUM', 'CARBONITE']
let excludeSet = new Set(['CHAMPIONSHIPS_GRAND_ARENA_GA2_EVENT_SEASON_52:O1715115600000'])
const checkLeagues = require('./checkLeagues')
const checkComplete = require('./checkComplete')
module.exports = async()=>{
  //if(!INSTANCE_ID) throw(`no INSTANCE_ID provided...`)
  let gaEvents = await mongo.find('gaEvents', {})
  let timeNow = Date.now()
  for(let i in gaEvents){
    if(gaEvents[i].leaderboardScanComplete || gaEvents[i].startTime > timeNow) continue
    if(!gaEvents[i].leagues) continue
    await checkLeagues(gaEvents[i])
    if(timeNow > gaEvents[i].endTime && gaEvents[i].id) await checkComplete(gaEvents[i].id)
  }
  console.log('done')
}
