// miniprogram/pages/statistics/statistics.js
const CHARTS = require('../../js/wxcharts-min.js'); // 引入wx-charts.js文件
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenW: 0,
    screenH: 0,
    detail: [],
    detail_in: {},
    detail_out: {}
  },

  /**
   * 画柱形图（canvas容器id，x轴的类别，每个类别的数据，图标的名称，x轴数据名称，图表宽度，图表高度）
   */
  columnShow: function (canvasId, cate, data, title, name, width, height) {
    if (cate.length > 5) { cate = cate.splice(0, 5) }
    if (data.length > 5) { data = data.splice(0, 5) }
    let column = {
      canvasId: canvasId,
      type: 'column',
      animation: true,
      categories: cate,
      series: [{
        name: name,
        data: data,
        format: function (val, name) {
          return val.toFixed(2) + '%';
        }
      }],
      yAxis: {
        format: function (val) {
          return val + '%';
        },
        title: title,
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: width,
      height: height,
    }
    new CHARTS(column);
  },
  getMigration: function(conf){
    wx.cloud.callFunction({
      name: 'getMigration',
      data: {
        tag: conf.tag || 0,
        limit: conf.limit || 2,
        timeFilter: conf.timeFilter || null
      }
    }).then(res=>{
      console.log('res: ',res)
      if (!!res && !!res.result) {
        if (!!res.result && res.result.data.length === 0) {
          wx.showToast({ title: '无数据！', icon: 'none' })
          return
        }
        wx.showToast({ title: '' })
        let _detail = !!res.result.data ? res.result.data : res.result
        _detail.map((item, idx) => { let t = _detail[idx]['time']; _detail[idx]['time']=t.substring(0,4)+'-'+t.substring(4,6)+'-'+t.substring(6);})
        this.setData({
          detail: _detail,
          detail_in: _detail.find(item => item.type === "in"),
          detail_out: _detail.find(item => item.type === "out")
        })
        let detail_in_city = this.data.detail_in.list.map(item=>item.city_name)
        let detail_in_value = this.data.detail_in.list.map(item => item.value)
        let detail_out_city = this.data.detail_out.list.map(item => item.city_name)
        let detail_out_value = this.data.detail_out.list.map(item => item.value)
        this.columnShow('canvas1', detail_in_city, detail_in_value, '全国热门迁入城市', '迁入率 (该城市迁入人数 / 全国迁入总人数)', this.data.screenW, this.data.screenW * 0.618)
        this.columnShow('canvas2', detail_out_city, detail_out_value, '全国热门迁出城市', '迁出率 (该城市迁出人数 / 全国迁出总人数)', this.data.screenW, this.data.screenW * 0.618)
      }
      wx.hideLoading()
    }).catch(err=>{
      console.error(err)
    })
  },
  // onPullDownRefresh: function () {
  //   console.log("下拉刷新...")
  //   this.getMigration({ tag: 1, limit: 1 })
  // },
  // morecity: function(e){
  //   switch (e.target.dataset.type){
  //     case 'in': break;
  //     case 'out': break;
  //   }
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res=>{
        if (!!res.screenWidth && !!res.screenHeight){
          app.globalData.screenWidth = res.screenWidth
          app.globalData.screenHeight = res.screenHeight
          this.setData({
            screenW: res.screenWidth,
            screenH: res.screenHeight
          })
          this.getMigration({tag:0,limit:1})
          
        }
      },
      fail: err=>{}
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})