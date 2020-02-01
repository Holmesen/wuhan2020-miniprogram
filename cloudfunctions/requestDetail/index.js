// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const qs = require('qs')

cloud.init()
const db = cloud.database()

// 创建axios实例
const service = axios.create({
  // baseURL: process.env.BASE_API, // api的base_url
  timeout: 30 * 1000, // 请求超时时间
  withCredentials: true
})

// 添加request拦截器
service.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
    config.transformRequest = [data => {
      let ret = ''
      ret = qs.stringify(data)
      return ret
    }]
    return config
  }, error => {
    Promise.reject(error)
  }
)

// 云函数入口函数
exports.main = async (event, context) => {
  let result = null
  let data = await service({
    url: 'https://service-nxxl1y2s-1252957949.gz.apigw.tencentcs.com/release/newpneumonia',
    method: 'get',
    params: {}
  })
  if (!!data.data && data.data.errorCode===0 && data.data.ok){
    if (!!data.data.data && !!data.data.data.conf && !!data.data.data.conf.component && data.data.data.conf.component.length>0){
      let obj = data.data.data.conf.component[0]
      obj.mapLastUpdatedTime = obj.mapLastUpdatedTime.toString().replace(/\./g, '-') + ':00'
      let count = await db.collection('list1').count() // 数据库记录总数
      let dbNew = await db.collection('list1').skip(count.total-1).limit(1).get().then(res=>{ // 数据库最新的一条数据
        return res.data[0]
      }).catch(err=>{
        return null
      })
      // 如果最新获取的数据时间比数据库最新一条数据时间晚才执行插入数据库操作
      if (obj.mapLastUpdatedTime > dbNew.mapLastUpdatedTime){
        result = await db.collection('list1').add({
          data: {
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
          }
        }).then(res => {
          return res
        }).catch(err => {
          return err
        })
      }
    }
  }
  return result
}