// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init()
// 创建axios实例
const service = axios.create({
  // baseURL: process.env.BASE_API, // api的base_url
  timeout: 30 * 1000, // 请求超时时间
  withCredentials: true
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  let data = null
  let tag = event.tag || 0  // 0:从数据库取数据；1:重新请求api获取数据
  let type = event.type || 'all' // out:迁出数据；in:迁入数据；all:所有数据
  let limit = event.limit ? (event.limit > 10 ? 10 : (event.limit <= 0 ? 1 : event.limit)) : 5
  let timeFilter = event.timeFilter || '20200101'
  if (+tag === 0) {
    if(type==='all'){
      data = await db.collection('migration').limit(limit * 2).where({}).orderBy('time', 'desc').get({
        success: res=>{
          return res
        },
        fail: err=>{return null}
      })
    } else {
      data = await db.collection('migration').limit(limit).where({type: type}).orderBy('time', 'desc').get({
        success: res => { return res },
        fail: err => { return null }
      })
    }
  }
  if (+tag === 1) {
    let data_out = null
    let data_in = null
    let data_temp = []
    if(type==='all'){
      data_out = await service({
        url: 'https://huiyan.baidu.com/openapi/v1/migration/rank?type=move_out&ak=kgD2HiDnLdUhwzd3CLuG5AWNfX3fhLYe',
        method: 'get',
        params: {}
      })
      data_in = await service({
        url: 'https://huiyan.baidu.com/openapi/v1/migration/rank?type=move_in&ak=kgD2HiDnLdUhwzd3CLuG5AWNfX3fhLYe',
        method: 'get',
        params: {}
      })
    } else {
      if(type==='out'){
        data_out = await service({
          url: 'https://huiyan.baidu.com/openapi/v1/migration/rank?type=move_out&ak=kgD2HiDnLdUhwzd3CLuG5AWNfX3fhLYe',
          method: 'get',
          params: {}
        })
      } else {
        data_in = await service({
          url: 'https://huiyan.baidu.com/openapi/v1/migration/rank?type=move_in&ak=kgD2HiDnLdUhwzd3CLuG5AWNfX3fhLYe',
          method: 'get',
          params: {}
        })
      }
    }
    let success_in = (data_in.data && data_in.data.status === 0 && data_in.data.message === '成功');
    let success_out = (data_out.data && data_out.data.status === 0 && data_out.data.message === '成功');
    let count = await db.collection('migration').count() // 数据库记录总数
    let dbNews = await db.collection('migration').skip(count.total - 2).limit(2).get().then(res => { // 数据库最新的两条数据
      return res.data
    }).catch(err => {
      return {}
    })
    let dbNew_in = dbNews.find(el => el.type === 'in') // 数据库最新的一条迁入数据
    let dbNew_out = dbNews.find(el => el.type === 'out') // 数据库最新的一条迁出数据
    if(success_in && success_out){
      // 如果最新获取的数据时间比数据库最新一条数据时间晚才执行插入数据库操作
      if (data_in.data.result.time > dbNew_in.time){
        dbNew_in = data_in.data.result
        db.collection('migration').add({
          data: Object.assign(dbNew_in, {type:'in'})
        }).then(res => {
          return res
        }).catch(err => {
          return err
        })
      }
      if (data_out.data.result.time > dbNew_out.time) {
        dbNew_out = data_out.data.result
        db.collection('migration').add({
          data: Object.assign(dbNew_out, { type: 'out' })
        }).then(res => {
          return res
        }).catch(err => {
          return err
        })
      }
      if(type==='all'){
        data_temp.push(dbNew_in)
        data_temp.push(dbNew_out)
      } else {
        if(type==='out'){
          data_temp.push(dbNew_out)
        } else {
          data_temp.push(dbNew_in)
        }
      }
      data = data_temp
    }
  }
  return data
}