// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment')
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
  let limit = event.limit?(event.limit>32?32:(event.limit<=0?1:event.limit)):10
  let timeFilter = event.timeFilter || '2020-01-01 00:00:00'
  if(+tag === 0){
    data = await db.collection('list1').limit(limit).where({
      mapLastUpdatedTime: db.command.gt(timeFilter)
    }).orderBy('mapLastUpdatedTime', 'desc').get({
      success: res=>{return res},
      fail: err=>{return null}
    })
  }
  if (+tag === 1) {
    let _data = await service({
      url: 'https://service-nxxl1y2s-1252957949.gz.apigw.tencentcs.com/release/newpneumonia',
      method: 'get',
      params: {}
    })
    if (!!_data.data && _data.data.errorCode === 0 && _data.data.ok) {
      if (!!_data.data.data && !!_data.data.data.conf && !!_data.data.data.conf.component && _data.data.data.conf.component.length > 0) {
        let obj = _data.data.data.conf.component[0]
        obj.mapLastUpdatedTime = obj.mapLastUpdatedTime.toString().replace(/\./g, '-') + ':00'
        let count = await db.collection('list1').count() // 数据库记录总数
        let dbNew = await db.collection('list1').skip(count.total - 1).limit(1).get().then(res => { // 数据库最新的一条数据
          return res.data[0]
        }).catch(err => {
          return {}
        })
        data = dbNew
        // 如果最新获取的数据时间比数据库最新一条数据时间晚才执行插入数据库操作
        if (obj.mapLastUpdatedTime > dbNew.mapLastUpdatedTime) {
          data = {
            caseList: obj.caseList,
            caseOutsideList: obj.caseOutsideList,
            externalButtons: obj.externalButtons,
            gossips: obj.gossips,
            hotwords: obj.hotwords,
            knowledges: obj.knowledges,
            mapLastUpdatedTime: obj.mapLastUpdatedTime, //new Date(obj.mapLastUpdatedTime).toISOString()
            mapSrc: obj.mapSrc,
            summaryDataIn: obj.summaryDataIn,
            summaryDataOut: obj.summaryDataOut
          } // 赋最新请求的数据
          db.collection('list1').add({
            data: data
          }).then(res => {
            return res
          }).catch(err => {
            return err
          })
        }
      }
    }
  }
  return data
}