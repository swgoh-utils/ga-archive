'use strict'
const mongo = require('mongoclient')
const scanLeague = require('./scanLeague')
module.exports = async(gaEvent = {})=>{
  for(let i in gaEvent.leagues){
    await scanLeague({ ...JSON.parse(JSON.stringify(gaEvent)),...gaEvent.leagues[i] })
  }
}
