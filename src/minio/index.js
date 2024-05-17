'use strict'
const log = require('logger')
const Minio = require('minio')
const Bottleneck = require("bottleneck/es5");

const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 5
});

let bucketSet = new Set(), MINIO_ENDPOINT = process.env.MINIO_ENDPOINT, minioReady
const client = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINI_SECRET_KEY
})

const makeBucket = async(bucket)=>{
  try{
    await client.makeBucket(bucket)
    //await client.makeBucket(bucket)
    let policy = { Id: 'PublicSharePolicy', Statement: [{Action: ['s3:GetObject'], Effect: 'Allow', Resource: [`arn:aws:s3:::${bucket}/*`], Principal: '*' }] }
    await client.setBucketPolicy(bucket, JSON.stringify(policy))
    //await client.setBucketPolicy(bucket, JSON.stringify(policy))
    bucketSet.add(bucket)
    return true
  }catch(e){
    console.error(e)
  }
}

const start = async()=>{
  try{
    let list = await client.listBuckets()
    if(list){
      let tempSet = new Set(list.map(x=>x.name) || [])
      bucketSet = tempSet
      minioReady = true
      return
    }
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
module.exports.put = async(bucket, fileName, data, path, expireTime)=>{
  try{
    let exists = bucketSet.has(bucket)
    if(!exists) throw(`${bucket} does not exist`)
    let metadata = { 'Content-Type': 'application/json' }
    if(expireTime) metadata.ttl = Date.now() + expireTime * 1000
    let key = ''
    if(path) key += `${path}/`
    key += `${fileName}.json`
    let result = await limiter.schedule(()=>client.putObject(bucket, key, JSON.stringify(data), metadata))
    //let result = await client.putObject(bucket, key, JSON.stringify(data), metadata)
    if(result?.etag) return true
  }catch(e){
    console.error(e)
  }
}
module.exports.status = ()=>{
  return minioReady
}
module.exports.makeBucket = makeBucket
module.exports.bucketExists = (bucket)=>{
  return bucketSet.has(bucket)
}
