// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    expandIndex: -1,
    detail: {}
  },

  preImage: function(){
    wx.previewImage({
      urls: [this.data.detail.mapSrc?this.data.detail.mapSrc:'https://mms-res.cdn.bcebos.com/mms-res/voicefe/captain/images/efbc395c4720ff279a4470ce2dbc926b.png?size=1050*803']
    })
  },
  expandDetail: function (e) {
    let i = -1
    if (this.data.expandIndex !== e.target.dataset.idx){
      i = e.target.dataset.idx
    }
    this.setData({
      expandIndex: i
    })
  },
  getEpidemicDetail: function (conf={}) {
    wx.cloud.callFunction({
      name: 'getEpidemicDetail',
      data: {
        tag: conf.tag || 0,
        limit: conf.limit || 10,
        timeFilter: conf.timeFilter || null
      }
    }).then(res=>{
      if(!!res && !!res.result){
        if (!!res.result && (!!res.result.data && res.result.data.length===0)){
          wx.showToast({ title: '无数据！', icon: 'none' })
          return
        }
        wx.showToast({ title: '' })
        this.data.detail = !!res.result.data ? res.result.data[0] : res.result
        this.data.detail.caseList = this.data.detail.caseList.reverse()
        this.data.detail.caseOutsideList = this.data.detail.caseOutsideList.reverse()
        this.setData({
          detail: this.data.detail
        })
      } else {console.log("!!res: ",res)}
      wx.hideLoading()
    }).catch(err=>{
      console.error('请求云函数（获取疫情信息）错误：', err)
      wx.hideLoading()
      wx.showToast({ title: '获取数据失败！', icon: 'none' })
    })
  },

  onPullDownRefresh: function(){
    console.log("下拉刷新...")
    this.getEpidemicDetail({ tag: 1, limit: 1 })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({title: '加载中'})
    this.getEpidemicDetail({tag:0, limit:1})
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
  // onPullDownRefresh: function () {

  // },

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