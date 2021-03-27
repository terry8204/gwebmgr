# gwebmgr
#### 秒播视频效果
[毫秒级演示视频](http://jiuhuwq.com/downloadbin/gps51show.mp4)

#### 介绍
gps51.com 前端网页完整代码，主要功能：定位、管理设备、在线视频，全面支持H265播放：网页、App、小程序都支持H265播放。

#### 软件架构
服务器开发环境为linux java：
整个系统分为6部分：

1. 网关：支持各种设备接入(单独项目)
2. 应用服务器：应用服务和数据库(单独项目)
3. 视频服务器：视频推送和订阅(单独项目)
4. 网页：采用接口分离式开发（单独项目，目前已开源计划）
5. 应用程序：包括ios和安卓（单独项目，后续有开源计划）
6. 微信小程序：微信搜索 gps51（单独项目，后续有开源计划）
7. 微信公众号：微信搜索 gps51 公众号，支持微信通知报警
8. pc安装版本，已经打包在release里面提供下载

目前支持的设备接入的通讯协议：

1. 部标808协议 支持2011版本 2013版本 2109版本
2. 部标1078视频协议：在线视频播放、历史回放、对讲
3. 苏标adas协议
4. 谷米定位器协议
5. 康凯斯定位器协议
6. 博实结超长待机定位器协议
7. 三基同创儿童手表协议
8. 星安协议
9. 天禾协议
10. 天琴协议

#### 外设支持
1. 油耗：油杆、超声波、各种油液，4路同时监控
2. 温湿度：支持4路温度+1路湿度
3. 正反转：混凝土车正反转监控
4. 载重：载重外设
5. 对讲：视频机自带的对讲外设

#### Api文档
请参考wiki部分，有疑问请添加 微信：15814449222 

#### 安装教程

1.  windows或者linux
2.  安装 java 1.7
3.  安装 tomcat7.0

#### 使用说明

1.  下载全部代码
2.  解压后，复制trunk目录下的全部文件到 tomcat 的 webapps 目录下的gwebserver目录下面
3.  配置好 tomcat的端口 80 和 网站根目录
4.  启动tomcat
5.  输入ip地址测试是否出现网页登录界面

#### 修改登录背景图片和备案信息
1. 在目录下找到custom目录，替换loginbg1.jpg 文件
2. 在目录下找到custom目录, 替换logo.png文件
3. 在目录下找到custom目录，打开language.js搜索beiAn1 beiAn2，替换beiAn1 beiAn2的文字
4. 在目录下找到custom目录，打开language.js搜索title，替换title的文字


#### 参与贡献

急需编写Windows 自动升级工具，随着越来越多的用户安装网页服务器，直接解压覆盖会丢失掉用户已经配置好了的logo，需要编写工具实现自动化配置和升级。 

#### UI预览
![输入图片说明](https://images.gitee.com/uploads/images/2020/1025/115221_5ed6a9d7_1763104.jpeg "login.jpg")
![输入图片说明](https://images.gitee.com/uploads/images/2020/1025/115252_b64d6a5e_1763104.jpeg "main.jpg")
![输入图片说明](https://images.gitee.com/uploads/images/2020/1025/115316_d59ef52b_1763104.jpeg "playing.jpeg")
![输入图片说明](https://images.gitee.com/uploads/images/2020/1025/115351_5d500877_1763104.jpeg "capture.jpg")
![输入图片说明](https://images.gitee.com/uploads/images/2021/0120/192713_dbcab4ad_1763104.jpeg "track.jpg")
#### 秒播视频效果
[毫秒级演示视频](http://jiuhuwq.com/downloadbin/gps51show.mp4)

平台几乎天天在进行改进，建议star和watch一份，您的支持是我们最大的动力。