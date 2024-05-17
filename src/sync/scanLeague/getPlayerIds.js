'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')

const generatePlayerIds = async(info = {})=>{
  let brackets = await mongo.find('gaPlayers', { groupId: info.groupId }, { players: 1 })
  if(!brackets || brackets?.length == 0) return
  let array = brackets.flatMap(x=>x?.players?.map(p=>p.id))
  if(!array || array.length == 0) return
  let tempObj = { players: array, groupId: info.groupId, season: info.season, key: info.key, date: info.date, mode: info.mode, league: info.league, startTime: info.startTime, endTime: info.endTime }
  await mongo.set('gaHistPlayersTemp', { _id: info.groupId }, tempObj)
  return array
}

module.exports = async(info = {})=>{
  let data = (await mongo.find('gaHistPlayersTemp', { _id: info.groupId }, { players: 1, history: 1 }))[0]
  if(data?.players?.length > 0){
    let historyComplete = data.history || []
    return data.players.filter(x=>!historyComplete.includes(x))
  }
  return await generatePlayerIds(info)
}
