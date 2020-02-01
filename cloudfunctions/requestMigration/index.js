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
  const db = cloud.database().collection('migration')
  let data_out = null
  let data_in = null

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

  let success_in = (data_in.data && data_in.data.status === 0 && data_in.data.message === '成功');
  let success_out = (data_out.data && data_out.data.status === 0 && data_out.data.message === '成功');
  
  let count = await db.count() // 数据库记录总数
  let dbNews = await db.skip(count.total - 2).limit(2).get().then(res => { // 数据库最新的两条数据
    return res.data
  }).catch(err => {
    return {}
  })
  let dbNew_in = dbNews.find(el => el.type === 'in') // 数据库最新的一条迁入数据
  let dbNew_out = dbNews.find(el => el.type === 'out') // 数据库最新的一条迁出数据
  if (success_in && success_out) {
    // 如果最新获取的数据时间比数据库最新一条数据时间晚才执行插入数据库操作
    if ((data_in.data.result.time > dbNew_in.time) && (data_out.data.result.time > dbNew_out.time)) {
      dbNew_in = data_in.data.result
      await db.add({
        data: Object.assign(dbNew_in, { type: 'in' })
      })
      dbNew_out = data_out.data.result
      await db.add({
        data: Object.assign(dbNew_out, { type: 'out' })
      })
    }
  }
}