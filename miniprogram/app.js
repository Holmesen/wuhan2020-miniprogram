//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {
      screenWidth: 0,
      screenHeight: 0
    }

    // wx.cloud.callFunction({
    //   // name: 'getEpidemicDetail',
    //   name: 'requestDetail',
    //   data: {},
    //   success: res=>{
    //     console.log('请求云函数requestDetail成功：',res)
    //   },
    //   fail: err=>{
    //     console.error('请求云函数requestDetail失败：',err)
    //   }
    // })
  }
})
