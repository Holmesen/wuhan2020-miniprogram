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
  const db = cloud.database().collection('news')
  let data = null
  let tag = event.tag || 0  // 0:从数据库取数据；1:重新请求api获取数据
  let limit = event.limit ? (event.limit > 30 ? 30 : (event.limit <= 0 ? 1 : event.limit)) : 20
  let timeFilter = event.timeFilter || '2020-01-01 00:00:00'
  let page = event.page || 1

  if (+tag === 0) {
    data = await db.limit(limit).where({
      sendTime: cloud.database().command.gt(timeFilter)
    }).orderBy('sendTime', 'desc').get({
      success: res => { return res.data },
      fail: err => { return null }
    })
  }
  if (+tag === 1) {
    let _data = await service({
      url: 'http://ncov.news.dragon-yuan.me/api/news?search=&page='+page,
      method: 'get',
      params: {}
    })
    if (!!_data.data && _data.data.code === 200 && _data.data.success) {
      if (!!_data.data.result && _data.data.result.list && _data.data.result.list.length > 0) {
        let obj = _data.data.result
        let list = obj.list.reverse()
        let count = await db.count() // 数据库记录总数
        let dbNew = await db.orderBy('sendTime', 'desc').limit(1).get().then(res => { // 数据库最新的一条数据
          return res.data[0]
        }).catch(err => {
          return {}
        })
        data = obj.list
        let newList = list.filter(el => el.sendTime > dbNew.sendTime)
        if(!!newList && newList.length>0){
          for(let i=0; i<newList.length; i++){
            await db.add({
              data: {
                sourceId: newList[i]['sourceId'],
                url: newList[i]['url'],
                content: newList[i]['content'],
                sendTime: newList[i]['sendTime'],
                fromName: newList[i]['fromName']
              }
            }).then(res => { return res }).catch(err => { return err })
          }
        }
      }
    }
    data = data.reverse()
  }
  return data
}