// miniprogram/pages/news/news.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    news: [],
    page: 1
  },

  getNews: function(conf) {
    wx.cloud.callFunction({
      name: 'getNews',
      data: {
        tag: conf.tag || 0,
        limit: conf.limit || 20,
        timeFilter: conf.timeFilter || null,
        page: conf.page || 1
      }
    }).then(res=>{
      wx.hideLoading()
      console.log(res)
      if (!!res && !!res.result && (res.result.length > 0 || (!!res.result.data && res.result.data.length>0))){
        let _data = !!res.result.data ? res.result.data : res.result
        if(conf.way === 'add'){
          this.data.news = this.data.news.concat(_data)
        } else {
          wx.showToast({ title: '' })
          this.data.news = _data
        }
        this.setData({ news: this.data.news})
      } else {
        wx.showToast({ title: '获取新闻失败', icon: 'none' })
      }
    }).catch(err=>{wx.hideLoading();console.error('获取新闻失败：',err)})
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getNews({tag:1})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({title: '新闻获取中...'})
    this.getNews({tag:0,limit:10})
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('快触底了...')
    this.getNews({ tag: 1, page: this.data.page+1, way: 'add' })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})