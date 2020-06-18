# gwebmgr

#### 介绍
gps51.com 前端网页完整代码，主要功能：定位、管理设备、在线视频。

#### 软件架构
服务器开发环境为linux java：
整个系统分为6部分：
1. 网关：支持各种设备接入(单独项目)
2. 应用服务器：应用服务和数据库(单独项目)
3. 视频服务器：视频推送和订阅(单独项目)
4. 网页：采用接口分离式开发（单独项目，目前已开源计划）
5. 应用程序：包括ios和安卓（单独项目，后续有开源计划）
6. 微信小程序：微信搜索 gps51（单独项目，后续有开源计划）
目前支持的设备接入的通讯协议：
1. 部标808协议
2. 部标1078视频协议：在线视频播放、历史回放、对讲
3. 苏标adas协议
4. 谷米定位器协议
5. 康凯斯定位器协议
6. 三基同创儿童手表协议

#### Api文档
托管在：
https://www.apiview.com/doc/12232#/doc/dashbord
需要注册一个账号，然后把注册账号的邮箱发给 微信：15814449222 授权查看Api.
后面我们个可以完全开放的托管网站。

#### 安装教程

1.  windows或者linux
2.  安装 java 1.7
3.  安装 tomcat7.0

#### 使用说明

1.  下载全部代码
2.  复制到 tomcat 的 webapps 目录下
3.  配置好 tomcat的端口 80 和 网站根目录
4.  启动tomcat
5.  输入ip地址测试是否出现网页登录界面

#### 修改登录背景图片和备案信息
1. 在目录下找到custom目录，替换loginbg1.jpg 文件
2. 在目录下找到custom目录, 替换logo.png文件
3. 在目录下找到custom目录，打开language.js搜索beiAn1 beiAn2，替换beiAn1 beiAn2的文字
4. 在目录下找到custom目录，打开language.js搜索title，替换title的文字
3. 修改是否启用对讲，对讲需要域名认证ssl,如果用ip或者域名没认证，在 config.js 文件把 
    var isNeedTalk = true; 
   改为: 
    var isNeedTalk = false;

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


