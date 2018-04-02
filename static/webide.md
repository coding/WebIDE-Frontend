1.欢迎使用 WebIDE 手册 
-----
本手册主要描述 WebIDE 产品的相关功能说明。


2.关于WebIDE
--------

### 2.1 WebIDE 是什么？ ###

WebIDE 是一款在线集成开发环境( Integrated Development Environment )。
开发者只需要一个浏览器就可以编写代码，并在WebIDE 提供的终端环境中运行你的代码，让你告别 Local 环境，开启云端开发模式。


### 2.2 为什么使用 WebIDE ？ ###

WebIDE 致力于降低开发者编辑代码的门槛，省去了安装配置本地环境的繁琐，只需要一个浏览器就可以开始写代码。
让用户可以随时随地云端开发，减少团队开发时重复配置开发环境的工作，让开发者可以更加专注于代码本身。


### 2.3 WebIDE 的主要功能 ###

 - 基于浏览器的代码编辑环境
 - 支持主流语言的语法高亮和代码提示
 - 整合Git 版本管理
 - 环境可以保存分享给项目成员
 - 全功能的 Linux 终端
 - 支持文档上传、下载和预览



3.功能介绍
--------

### 3.1 开启WebIDE

#### 3.1.1 前提条件：
 -  已经创建好至少一个项目
 

### 3.2 界面说明 ###

1. 顶部菜单栏
2. 左边是文件树目录
3. 中间是文本编辑区和文件预览区
4. 下边是终端界面

 - 注：您也可以拖动 Tab 自定义界面。

### 3.3  文件管理
WebIDE 支持文件新建、删除、上传、下载、重命名。 右键点击文件树目录进行操作。

WebIDE 支持图片和pdf 的双击预览。

### 3.4 代码提交&更新 ###
    
#### 3.4.1 Clone 代码

    首次进入 WebIDE 项目时候 WebIDE 会默认 Clone 项目的代码到IDE的 Workspace
    
#### 3.4.2 Commit 提交本地仓库
 
当你完成代码编辑后可以点击菜单栏的 “Repository” - > “Commit” ， 选择要提交的文件，提交到本地的代码库。

![图片](https://dn-coding-net-production-pp.qbox.me/78fbf09c-b6e6-4020-a82f-daa1c55bc3fe.png) 

#### 3.4.3 分支修改

如果需要创建或者修改本地和远程分支，点击菜单栏的“Repository” - > “Branches”，或者点击右下角的分支图标，默认是“Master”。

右下角会弹出如下图的选项，对于本地和远端仓库的操作如Push，Pull ，默认都是操作本地和远端的仓库。

 ![图片](https://dn-coding-net-production-pp.qbox.me/656ca53b-83aa-411b-b051-39380965392c.png) 


#### 3.4.4 Push 提交远端仓库

当你的代码需要提交到远端Git仓库时候，点击菜单栏的“Repository” - > “Push” ，确认本地和远端的分支。

 ![图片](https://dn-coding-net-production-pp.qbox.me/6e32e236-d9a4-468e-be9c-c16816f9a02d.png) 

#### 3.4.5 Pull 从远端仓库拉取到本地

当你的远端代码仓库领先于IDE的本地代码仓库时，需要将远端仓库的代码拉取到本地，点击菜单栏的“Repository” - > “Pull” ，会将代码拉取到本地设置的分支。


 ![图片](https://dn-coding-net-production-pp.qbox.me/c389a9bc-aa96-40eb-b440-a776e6391ed3.png) 

### 3.5 环境管理&分享 ###

#### 3.5.1 什么是环境 ###

环境（Environment）是WebIDE指将终端所操控的系统环境（包括代码，修改过的文件和通过 apt-get 安装的软件等）。每个Workspace可以配置多个环境，和终端关联的环境称为当前环境。环境本质是一个Docker的Container实例。从用户的视角，环境是一个云端的操作系统。

#### 3.5.2 如何管理环境 ###

点击右边的环境设置“Environment”图标，弹出环境设置tab
点击 “ ？”可以查看，环境设置的帮助说明，用户可以将环境保存下来然后分享给其它的项目成员使用。

#### 3.5.3 如何保存环境 ###
鼠标浮动过去，点击“Save As” 可以将当前环境保存起来, 这样项目成员就可以在进入这个项目的时候使用相同的环境进行了。“Reset” 就是将当前的环境重置到，初始环境，慎重使用。 
“Save As” 后结果如下：


![图片](https://dn-coding-net-production-pp.qbox.me/15415d4d-0f86-4555-9333-41b74e328538.png) 


#### 3.5.4 如何切换和分享环境 

当存在多个环境后，点击“Use” 可以切换到不同的环境，切换时当前的 Terminal 会被终止， 然后 Terminal 重新连接到刚才选择的 Environment。

### 3.6 终端 Terminal ###

#### 3.6.1 终端 Terminal 

WebIDE 的终端是一个完成的 Ubuntu Linux Shell 环境，用户可以在里面执行任何 Linux 命令。初始的终端设置如下：

 - 系统为标准Ubuntu 14.04
 - 用户名和密码都是 coding
 - coding 用户具备 sudo 权限（`$sudo su`可切换到root用户）

#### 3.6.2 如何打开终端 Terminal
 
1. 点击“Terminal” 打开终端 Tab 
  ![图片](https://dn-coding-net-production-pp.qbox.me/874e33fa-ead9-4f30-8c6f-1a408a354fe9.png) 
  
2. 点击菜单栏 “Tools” -> “New Terminal”
 
  ![图片](https://dn-coding-net-production-pp.qbox.me/65e2b062-c972-4620-8dc0-d9280233294d.png) 


### 3.7 软件安装###

可以在终端运行 apt-get 来安装你想要的 Linux 软件，可以在/etc/apt/source.list 查看和修改apt的源。

    ➜  workspace git:(master) ✗ cat /etc/apt/sources.list  

对于想要的软件用 apt-get install 安装, 比如安装npm：

    ➜  workspace git:(master) ✗ sudo apt-get install npm    

  
### 3.7 运行程序###

#### 3.7.1 在终端运行程序

编写好的代码可以在终端( Terminal ) 里面运行，对于需要创建外部访问链接的应用需要明确绑定到 0.0.0.0 地址, 比如：

    ➜  workspace git:(master) ✗ ruby app.rb -o 0.0.0.0 -p 8080                                                                                            
    == Sinatra (v1.4.6) has taken the stage on 8080 for development with backup from Thin                                                                 
    Thin web server (v1.6.3 codename Protein Powder)                                                                                                      
    Maximum connections set to 1024                                                                                                                       
    Listening on 0.0.0.0:8080, CTRL+C to stop        

>需要强调一下，绑定在本地回环地址 127.0.0.1 是无效的。


#### 3.7.2 创建外部访问链接( Generate Access Url )

WebIDE 支持为编写好的程序创建一个外部可以访问的链接，有效期 1 个小时，点击菜单的 Tools -> Generate Access Url 如下图。

![图片](https://dn-coding-net-production-pp.qbox.me/543dfde7-8bf0-49a8-95c8-80c33f18c106.png) 

设置你需要绑定的端口，需要跟程序运行监听的端口一致, 如上面的8080，点击链接访问页面。
                                        