var app = getApp();
Page({
  data: {
    bannerImgSrc: '',
    text: "注意：系统会自动隐藏首页的过期信息，您发布的信息当日内可免费编辑哦~",
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marquee_margin: 30,
    size: 14,
    interval: 40, // 时间间隔
    currentp: 1,
    loaded: false,
    loading: false,
    banner:'../../resources/pic/banner.jpg',
    list: [ ]
   
  },

  onLoad: function (options) {
  },
  requestFirstPageList: function(){
    var me = this;
    if(!me.data.loading){
      wx.showToast({
          title: '加载中...',
          icon: 'loading',
          duration: 10000
      });
      me.setData({
        loading: true
      });
      app.mag.request('/carpool/carpool/getBannerPathAndNotice', {}, function (res) {
        me.setData({
          bannerImgSrc: app.mag.apiHost + res.data.data.path,
          bannerTitle: res.data.data.notice_title
        });
      });
      app.mag.request('/carpool/carpool/myCarpool', { page: 1 }, function(res) {
          if(res.data.success && res.data.data.length){
            for(var item in res.data.data){
              // 今天 明天 数据处理
              res.data.data[item].daytype = app.mag.getDayType(res.data.data[item].start_time);
              res.data.data[item].start_time = app.mag.formatTime(res.data.data[item].start_time);
              res.data.data[item].postdate = app.mag.formatTime(res.data.data[item].postdate);
            }
            me.setData({
              list: res.data.data
            });
          }
          wx.stopPullDownRefresh();
          wx.hideToast();
          me.setData({
            loading: false,
            loaded: false,
            currentp: 1
          });
      });
    }
  },
 
  onReachBottom: function(){
    var me = this;
    if(me.data.loaded){
      wx.showToast({
        title: '没有更多了',
          icon: 'success',
          duration: 1000
      });
      return;
    }
    if(!me.data.loading){
      wx.showToast({
          title: '加载中...',
          icon: 'loading',
          duration: 10000
      });
      me.setData({
        loading: true
      });
      me.data.currentp++;
      app.mag.request('/carpool/carpool/myCarpool', {
        page: me.data.currentp
      }, function(res) {
          var list = me.data.list,
              newlist = [];       
          if(res.data.success && res.data.data.length){
              wx.hideToast();           
              newlist = res.data.data;
              for(var item in newlist){
                // 今天 明天 数据处理
                res.data.data[item].daytype = app.mag.getDayType(res.data.data[item].start_time);
                newlist[item].start_time = app.mag.formatTime(newlist[item].start_time);
                newlist[item].postdate = app.mag.formatTime(newlist[item].postdate);
              }
              for(var i=0; i<newlist.length; i++){
                list.push(newlist[i]);
              }
              me.setData({
                list: list,
                loading: false
              });
          }else{
              me.setData({
                loading: false,
                loaded: true
              });
              wx.showToast({
                title: '没有更多了',
                  icon: 'success',
                  duration: 1000
              });
          }
      });
    }
  },
  onPullDownRefresh: function(){
    this.requestFirstPageList();
  },
  onLoad: function () {
    this.requestFirstPageList();
  },
  onShow: function(){
    var me = this;
    wx.getStorage({
      key: 'finish_edit',
      success: function(res) {
          if(JSON.parse(res.data).success){
            me.requestFirstPageList();
            wx.removeStorage({
              key: 'finish_edit',
              success: function(res) {} 
            })
          }
      } 
    });
    wx.getStorage({
      key: 'top',
      success: function(res) {
        me.requestFirstPageList();
        wx.removeStorage({
          key: 'top',
          success: function(res) {}
        })
      }
    });
  },
  onDelete: function(event){
    var me = this;
    wx.showModal({
      title: '提示',
      content: '删除成功',
      showCancel: false,
      success: function(res) {
      
       
       
        app.mag.request('/carpool/carpool/delCarpool', {
          id: event.currentTarget.id
        }, function(res){
          me.requestFirstPageList();
          wx.showToast({
              title: '加载中',
              icon: 'success',
              duration: 1000
          });
    
        
        });
      },
     
    });
  },
  goEditFindCar: function (event) {
    wx.navigateTo({
      url: '../post-find-car-edit/post-find-car-edit?id=' + event.currentTarget.id
    })
  },
  goEditFindPeople: function (event) {
    wx.navigateTo({
      url: '../post-find-people-edit/post-find-people-edit?id=' + event.currentTarget.id
    })
  },
  goFullPeople: function(event){
    var me = this;
    app.mag.request('/carpool/carpool/setFullSeat', {
      id: event.currentTarget.id
    }, function (res) {
      if (res.data.success){
        me.requestFirstPageList();
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 2000
        });
      }
    })
  },
  goEditGoodsFindCar: function (event){
    wx.navigateTo({
      url: '../post-goods-find-car-edit/post-goods-find-car-edit?id=' + event.currentTarget.id
    })
  },
  goEditCarFindgoods: function (event){
    wx.navigateTo({
      url: '../post-find-goods-edit/post-find-goods-edit?id=' + event.currentTarget.id
    })
  },
  topPost: function(event) {
    wx.navigateTo({
      url: '../top-mypost/top-mypost?id=' + event.currentTarget.id
    })
  },

  onShow: function () {
    // 页面显示

    var that = this;

    var length = that.data.text.length * that.data.size;//文字长度

    var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    //console.log(length,windowWidth);
    that.setData({
      length: length,
      windowWidth: windowWidth
    });
    that.scrolltxt();// 第一个字消失后立即从右边出现
  },

  scrolltxt: function () {
    var that = this;
    var length = that.data.length;//滚动文字的宽度
    var windowWidth = that.data.windowWidth;//屏幕宽度
    if (length > windowWidth) {
      var interval = setInterval(function () {
        var maxscrollwidth = length + that.data.marquee_margin;//滚动的最大宽度，文字宽度+间距，如果需要一行文字滚完后再显示第二行可以修改marquee_margin值等于windowWidth即可
        var crentleft = that.data.marqueeDistance;
        if (crentleft < maxscrollwidth) {//判断是否滚动到最大宽度
          that.setData({
            marqueeDistance: crentleft + that.data.marqueePace
          })
        }
        else {
          //console.log("替换");
          that.setData({
            marqueeDistance: 0 // 直接重新滚动
          });
          clearInterval(interval);
          that.scrolltxt();
        }
      }, that.data.interval);
    }
    else {
      that.setData({ marquee_margin: "1000" });//只显示一条不滚动右边间距加大，防止重复显示
    }
  }

})
