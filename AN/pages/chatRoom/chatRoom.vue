<template>
	<view class="content">
		<view class="top-bar">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
			<view class="top-bar-center">
				<view class="title">{{fname}}</view>
			</view>
			<view class="top-bar-right">
				<view class="pice"></view>
				<view class="group-img" v-show="type == 1" @tap="toGroupPage">
					<image :src="fimgUrl" mode=""></image>
				</view>
			</view>
		</view>
		<scroll-view class="chat" scroll-y="true" :scroll-with-animation="swanition" :scroll-into-view="scrollToView" @scrolltoupper="nextPage()">
			<view class="chat-main" :style="{paddingBottom: inputh + 'px'}" @tap="clickBlank">
				<!-- <image class="loading-img" src="../../static/image/common/loading.gif" mode=""></image> -->
				<view class="space"></view>
				<!-- 加载动画 -->
				<view class="loading" v-show="isLoading">
					<image class="loading-img" :animation="animationData" src="../../static/image/common/loading.gif" mode=""></image>
				</view>
				<view class="chat-ls" v-for="(item, index) in msgs" :key="index" :id="'msg'+item.id">
					<view class="chat-time" v-show="item.time != ''">{{changeTime(item.time)}}</view>
					<view class="msg-m msg-left" v-if="item.fromId != uid">
						<image class="user-img" :src="item.imgUrl" @tap="goUserPage(item.fromId)"></image>
						<!-- 文字 -->
						<view class="message" v-if="item.types == 0">
							<view class="msg-text">{{item.message}}</view>
						</view>
						<!-- 图片 -->
						<view class="message" v-if="item.types == 1" @tap="previewImg(item.message)">
							<image :src="item.message" class="msg-img" mode="widthFix"></image>
						</view>
						<!-- 音频 -->
						<view class="message" v-if="item.types == 2">
							<view class="msg-text voice" :style="{width: item.message.time*8+'rpx'}" @tap="playVoice(item.message.voice)">
								<image src="../../static/image/chatRoom/sound.png" class="voice-img"></image>
								<view class="time">
									{{item.message.time}}"
								</view>
							</view>
						</view>
						
						<!-- 定位 -->
						<view class="message" v-if="item.types == 3">
							<view class="msg-map" @tap="openLocaton(item.message)">
								<view class="map-name">{{item.message.name}}</view>
								<view class="map-address">{{item.message.address}}</view>
								<image class="map-img" src="../../static/image/chatRoom/map.jpg" mode="aspectFit"></image>
								<!-- <map class="map" :longitude="item.message.longitude" :latitude="item.message.latitude" :markers="covers(item.message)"></map> -->
							</view>
						</view>
					</view>
					<view class="msg-m msg-right" v-if="item.fromId == uid">
						<image class="user-img" :src="item.imgUrl" @tap="goUserPage(uid)"></image>
						<!-- 文字 -->
						<view class="message" v-if="item.types == 0">
							<view class="msg-text">{{item.message}}</view>
						</view>
						<!-- 图片 -->
						<view class="message" v-if="item.types == 1" @tap="previewImg(item.message)">
							<image :src="item.message" class="msg-img" mode="widthFix"></image>
						</view>
						<!-- 音频 -->
						<view class="message" v-if="item.types == 2">
							<view class="msg-text voice" :style="{width: item.message.time*8+'rpx'}" @tap="playVoice(item.message.voice)">
								<view class="time">
									{{item.message.time}}"
								</view>
								<image src="../../static/image/chatRoom/sound.png" class="voice-img"></image>
							</view>
						</view>
						
						<!-- 定位 -->
						<view class="message" v-if="item.types == 3">
							<view class="msg-map" @tap="openLocaton(item.message)">
								<view class="map-name">{{item.message.name}}</view>
								<view class="map-address">{{item.message.address}}</view>
								<image class="map-img" src="../../static/image/chatRoom/map.jpg" mode="aspectFit"></image>
								<!-- <map class="map" :longitude="item.message.longitude" :latitude="item.message.latitude" :markers="covers(item.message)"></map> -->
							</view>
						</view>
					</view>
				</view>
				<!-- <view class="padbt"></view> -->
			</view>
		</scroll-view>
		<submit @inputs="inputs" @height="heightFn" ref="submit"></submit>
	</view>
</template>

<script>
	import datas from '../../commons/js/datas.js'
	import myfun from '../../commons/js/myfun.js'
	import submit from '../../components/submit/submit.vue'
	
	// 音频
	const innerAudioContext = uni.createInnerAudioContext();
	import base from '../../config/config.js'
	
	export default {
		data() {
			return {
				uid: '',
				uimgUrl: '',
				uname: '',
				token: '',
				fid: '',                 // 好友id或群id
				fimgUrl: '',
				fname: '',
				type: '',                // 0：私聊；1：群聊
				msgs: [],
				imgMsg: [],
				scrollToView: '',
				inputh: '60',
				oldTime: 0,
				animationData: {},       // 加载动画
				pageNumber: 0,           // 当前页码
				msgQuantity: 10,         // 每页最大信息条数
				loading: '',
				isLoading: false,        // 是否在加载中
				swanition: true,
				beginloading: true,      // 禁止重复加载
			};
		},
		onLoad: function(e) {
			this.fid = e.id;
			// console.log(this.fid)
			this.fname = e.name;
			this.type = e.type;
			this.fimgUrl = e.img;
			// console.log(e)
			this.getStorages();
			this.getMsg();
			this.receiveSocketMsg();
			this.groupsReceive();
			// this.nextPage();
		},
		components: {
			submit,
		},
		methods: {
			// 获取缓存数据
			getStorages() {
				try {
					const value = uni.getStorageSync('user');
					if (value) {
						this.uid = value.id;
						this.uimgUrl = base + value.imgUrl;
						this.token = value.token;
						this.uname = value.name;
					} else {
						// 如果本地没有用户缓存,跳转到登录页面
						uni.navigateTo({
							url: '../signin/signin'
						})
					}
				} catch (e) {
					// error
					console.log('取缓存失败')
				}
			},
			
			// 时间处理
			changeTime: function(date) {
				return myfun.chatTime(date);
			},
			
			// 获取聊天数据
			getMsg: function(page) {
				// console.log(this.uid + '   ' + this.fid)
				let reqUrl;
				let reqData;
				if (this.type == 0) {
					reqUrl = base + '/chat/message'
					reqData = {
						uid: this.uid,
						fid: this.fid,
						pageNumber: this.pageNumber,
						msgQuantity: this.msgQuantity,
						token: this.token
					}
				} else if(this.type == 1)  {
					reqUrl = base + '/chat/groupMessage'
					reqData = {
						gid: this.fid,
						pageNumber: this.pageNumber,
						msgQuantity: this.msgQuantity,
						token: this.token
					}
				}
				uni.request({
					url: reqUrl,
					data: reqData,
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let msg = data.data.result;
							// console.log(msg)
							// 将得到的数组倒序
							msg.reverse()
							// console.log(msg)
							
							if(msg.length > 0) {
								let oldTime = msg[0].time;
								let imgArr = [];
								for (var i = 1; i < msg.length; i++) {
									msg[i].imgUrl = base + msg[i].imgUrl;
									
									// 时间间隔
									if (i < msg.length - 1) {
										let t = myfun.spaceTime(oldTime, msg[i].time);
										// msg[i].time = t;
										if(t) {
											oldTime = t;
										}
										msg[i].time = t;
									}
									// 匹配最大时间
									if(this.pageNumber == 0) {
										if(msg[i].time > this.oldTime) {
											this.oldTime = msg[i].time;
										}
									}
									
									// 补充图片地址
									if (msg[i].types == 1) {
										msg[i].message = base + msg[i].message;
										imgArr.push(msg[i].message);
									}
									// js 字符串转回 JSON 格式
									if (msg[i].types == 3) {
										msg[i].message = JSON.parse(msg[i].message);
									}
									// this.msgs.unshift(msg[i]);
								}
								this.msgs = msg.concat(this.msgs);
								this.imgMsg = imgArr.concat(this.imgMsg);
							}
							// 判断当前页码
							if (msg.length == 10) {
								// 页码加1
								this.pageNumber++;
							} else {
								// 数据全部取完
								this.pageNumber = -1;
							}
							
							// 页面滚动
							this.$nextTick(function() {
								// console.log(this.msgs[msg.length-1].id)
								this.swanition = false;
								if(this.msgs.length > 0) {
									this.scrollToView = 'msg' + this.msgs[msg.length-1].id;
								}
							})
							
							// 关闭loading
							clearInterval(this.loading);
							this.isLoading = false;
							// 开启加载
							this.beginloading = true;
						} else if(status == 300) {
							// token过期，跳转登录页面
							uni.navigateTo({
								url: '../signin/signin?name=' + this.myname
							})
						} else if(status == 500) {
							uni.showToast({
								title: '服务器出错',
								icon: 'none',
								duration: 1500
							});
						}
					}
				})
				
			},
			
			getMsg1: function(page) {
				let msg = datas.message();
				let maxpages = msg.length;
				if (msg.length > (page+1)*10) {
					maxpages = (page+1)*10;
					// 页码加1
					this.pageNumber++;
				} else {
					// 数据全部取完
					this.pageNumber = -1;
				}
				
				for (var i = page*10; i < maxpages; i++) {
					msg[i].imgUrl = '../../static/image/index/' + msg[i].imgUrl;
					
					// 时间间隔
					if (i < msg.length - 1) {
						let t = myfun.spaceTime(msg[i].time, msg[i+1].time);
						msg[i].time = t;
					}
					
					// 补充图片地址
					if (msg[i].types == 1) {
						msg[i].message = '../../static/image/index/' + msg[i].message;
						this.imgMsg.unshift(msg[i].message);
					}
					this.msgs.unshift(msg[i]);
				}
				
				this.$nextTick(function() {
					this.swanition = false;
					this.scrollToView = 'msg' + this.msgs[maxpages-page*10-1].tip;
				})
				
				// 关闭loading
				clearInterval(this.loading);
				this.isLoading = false;
				// 开启加载
				this.beginloading = true;
			},
			
			// 预览图片
			previewImg: function(e) {
				let index = 0;
				for (let i = 0; i < this.imgMsg.length; i++) {
					if (this.imgMsg[i] == e) {
						index = i;
					}
				}
				
				uni.previewImage({
					current: index,
					urls: this.imgMsg,
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				});
			},
			
			// 接收输入内容
			inputs: function(e) {
				this.receiveMsg(e, this.uid, this.uimgUrl, 0);
			},
			
			receiveMsg: function(e, id, img, tip) {
				// tip=0: 自己发的；tip=1：别人发的
				if(e.types == 0 || e.types == 3) {
					// 发送给后端：文字、表情、定位
					this.sendSocket(e);
				}
				if (e.types == 1) {
					this.imgMsg.push(e.message);
					
					// 当前日期文件夹
					let fileUrl = myfun.fileName(new Date())
					// 提交图片到后端
					const uploadTask = uni.uploadFile({
						url: base + '/files/upload', 
						filePath: e.message,
						name: 'file',
						formData: {
							url: fileUrl
						},
						success: (uploadFileRes) => {
							// console.log(JSON.parse(uploadFileRes.data)[0]);
							console.log(uploadFileRes)
							let data = {
								message: uploadFileRes.data,
								types: e.types,
							}
							this.sendSocket(data);
							// let path = base +  uploadFileRes.data;
							// this.img.push(path)
						}
					});
									
					uploadTask.onProgressUpdate((res) => {
						// console.log('上传进度' + res.progress);
						// console.log('已经上传的数据长度' + res.totalBytesSent);
						// console.log('预期需要上传的数据总长度' + res.totalBytesExpectedToSend);
									
						// 测试条件，取消上传任务。
						// if (res.progress > 50) {
						// 	uploadTask.abort();
						// }
					});
				}
				
				if (e.types == 2) {
					// 当前日期文件夹
					let fileUrl = myfun.fileName(new Date())
					// 提交音频到后端
					const uploadTask = uni.uploadFile({
						url: base + '/files/upload', 
						filePath: e.message.voice,
						name: 'file',
						formData: {
							url: fileUrl
						},
						success: (uploadFileRes) => {
							// console.log(JSON.parse(uploadFileRes.data)[0]);
							console.log(uploadFileRes)
							let data = {
								message: uploadFileRes.data,
								types: e.types,
							}
							this.sendSocket(data);
							// let path = base +  uploadFileRes.data;
							// this.img.push(path)
						}
					});
									
					uploadTask.onProgressUpdate((res) => {
						// console.log('上传进度' + res.progress);
						// console.log('已经上传的数据长度' + res.totalBytesSent);
						// console.log('预期需要上传的数据总长度' + res.totalBytesExpectedToSend);
									
						// 测试条件，取消上传任务。
						// if (res.progress > 50) {
						// 	uploadTask.abort();
						// }
					});
				}
				
				this.swanition = true;
				let len = this.msgs.length;
				
				// 时间间隔
				let nowTime = new Date();
				let t = myfun.spaceTime(this.oldTime, nowTime);
				if (t) {
					this.oldTime = t;
				}
				nowTime = t;
				
				if(e.types == 3) {
					// js 字符串转回 JSON 格式
					e.message = JSON.parse(e.message);
				}
				// console.log(e.message)
				let data = {
					fromId: id,                 // 发送者id
					imgUrl: img,
					message: e.message,
					types: e.types,                // 内容类型（0：文字，1：图片链接，2：音频链接...)
					time: nowTime,        // 发送时间
					id: len,
				};
				this.msgs.push(data);
				this.$nextTick(function() {
					setTimeout(() => {
					    this.scrollToView = 'msg' + len;
					}, 0);
					// this.scrollToView = 'msg' + len;
				})
				
				
				
			},
			
			// 聊天数据发送到后端
			sendSocket(e) {
				// console.log(e)
				if(this.type == 0) {
					// 私聊
					this.socket.emit('msg', e, this.uid, this.fid);
				} else {
					// 群聊
					this.socket.emit('groupMsg', e, this.uid, this.fid, this.uname, this.uimgUrl);
				}
			},
			
			// socket私聊聊天数据接收
			receiveSocketMsg() {
				this.socket.on('msg', (msg, fromid, tip) => {
					console.log("sszxc")
					if(fromid == this.fid && tip == 0) {
						this.swanition = true;
						let len = this.msgs.length;
						let nowTime = new Date();
						let t = myfun.spaceTime(this.oldTime, nowTime);
						if (t) {
							this.oldTime = t;
						}
						nowTime = t;
						
						if(msg.types == 1 || msg.types == 2) {
							msg.message = base + msg.message
						}
						
						let data = {
							fromId: fromid,                 // 发送者id
							imgUrl: this.fimgUrl,
							message: msg.message,
							types: msg.types,                // 内容类型（0：文字，1：图片链接，2：音频链接...)
							time: nowTime,        // 发送时间
							id: len,
						};
						this.msgs.push(data);
						if(msg.type == 1) {
							this.imgMsg.push(msg.message)
						}
						this.$nextTick(function() {
							setTimeout(() => {
							    this.scrollToView = 'msg' + len;
							}, 0);
							// this.scrollToView = 'msg' + len;
						})
					}
				})
			},
			
			// 群聊天数据接收
			groupsReceive() {
				this.socket.on('groupmsg', (msg, fromid, gid, name, headPortrait, tip) => {
					// console.log(msg + fromid + name + headPortrait)
					if(gid == this.fid && tip == 0) {
						this.swanition = true;
						let len = this.msgs.length;
						let nowTime = new Date();
						let t = myfun.spaceTime(this.oldTime, nowTime);
						if (t) {
							this.oldTime = t;
						}
						nowTime = t;
						
						if(msg.types == 1 || msg.types == 2) {
							msg.message = base + msg.message
						}
						
						let data = {
							fromId: fromid,                 // 群id
							imgUrl: headPortrait,
							message: msg.message,
							types: msg.types,                // 内容类型（0：文字，1：图片链接，2：音频链接...)
							time: nowTime,        // 发送时间
							id: len,
						};
						this.msgs.push(data);
						if(msg.type == 1) {
							this.imgMsg.push(msg.message)
						}
						this.$nextTick(function() {
							setTimeout(() => {
							    this.scrollToView = 'msg' + len;
							}, 0);
							// this.scrollToView = 'msg' + len;
						})
					}
				})
			},
			
			// 输入框高度
			heightFn: function(e) {
				this.inputh = Math.round(e);
				this.locationLastMsg();
			},
			// 滚动到底部
			locationLastMsg: function() {
				this.swanition = true;
				this.scrollToView = '';
				this.$nextTick(function() {
					let len = this.msgs.length - 1;
					// this.scrollToView = 'msg' + this.msgs[len].id;
					if(this.msgs.length > 0) {
						this.scrollToView = 'msg' + this.msgs[len].id;
					}
				})
			},
			
			// 滚动到顶部加载页面
			nextPage: function(){
			// 	var animation = uni.createAnimation({
			// 		duration: 1000,
			// 		timingFunction: 'ease',
			// 	})
			
			// 	this.animation = animation
			
			// 	animation.scale(2,2).rotate(45).step()
			
			// 	// this.animationData = animation.export()
			
			// 	let aaa = setInterval(function() {
			// 	  animation.translate(30).step()
			// 	  this.animationData = animation.export()
			// 	}.bind(this), 1000)
			
				if (this.pageNumber > 0 && this.beginloading) {
					this.isLoading = true;
					// 禁止重复加载
					this.beginloading = false;
					
					this.loading = setTimeout(() => {
						this.getMsg(this.pageNumber);
					}, 2000);
				}
			},
			
			// 点击空白区域,收起区域
			clickBlank: function(){
				if(this.$refs.submit.isEmoji === true){
					this.$refs.submit.emoji()
				}
				if(this.$refs.submit.isMoreModule === true){
					this.$refs.submit.moreFun()
				}
			},
			
			// 音频播放
			playVoice: function(e) {
				innerAudioContext.src = e;
				innerAudioContext.play();
			},
			
			// 地图展示
			covers: function(e) {
				let map = [{
					latitude: e.latitude,
					longitude: e.longitude,
					iconPath: '../../static/image/chatRoom/location-map.png'
				}]
				return (map);
			},
			
			// 进入用户主页
			goUserPage(id) {
				uni.navigateTo({
					url: '../userHome/userHome?id=' + id,
				})
			},
			
			// 跳转到群详细页面
			toGroupPage() {
				uni.navigateTo({
					url: '../groupChat/groupChat?gid=' + this.fid + '&gimg=' + this.fimgUrl,
				})
			},
			
			// 导航
			openLocaton: function(e) {
				uni.openLocation({
					latitude: e.latitude,
					longitude: e.longitude,
					name: e.name,
					address: e.address,
					success: function () {
						console.log('success');
					}
				});
			},
			
			// 返回上一个页面
			goBack: function() {
				this.socket.emit('leaveChatRoom', this.uid, this.fid);
				uni.navigateBack({
					delta: 1,
				})
			},
		}
	}
</script>

<style lang="scss">
	@import "../../commons/css/common.scss";
	
	page {
		height: 100%;
	}
	.content {
		height: 100%;
		background: rgba(244, 244, 244, 1);
	}
	
	.top-bar {
		background: rgba(244, 244, 244, 0.96);
		border-bottom: 1px solid $uni-border-color;
		
		.top-bar-left {
			width: 88rpx;
			height: 88rpx;
			.back-img {
				margin-top: 21rpx;
				width: 52rpx;
				height: 52rpx;
			}
		}
		
		.top-bar-center {
			font-size: 40rpx;
		}
		
		.top-bar-right {
			.group-img {
				padding-left: 32rpx;
				image {
					border-radius: 12rpx;
					width: 52rpx;
					height: 52rpx;
				}
			}
		}
	}
	
	.space {
		width: 100%;
		height: 100rpx;
	}
	.chat{
		height: 100%;
		.padbt {
			height: env(safe-area-inset-bottom);
			width: 100%;
		}
		
		.loading {
			text-align: center;
			.loading-img {
				width: 133rpx;
				height: 75rpx;
			}
		}
		
		.chat-main {
			padding-left: $uni-spacing-col-base;
			padding-right: $uni-spacing-col-base;
			padding-top: 100rpx;
			padding-bottom: 120rpx;
			display: flex;
			flex-direction: column;
		}
		
		.chat-ls{
			.chat-time {
				font-size: $uni-font-size-sm;
				color: rgba(39,40,50,0.3);
				line-height: 34rpx;
				padding: 20rpx 0;
				text-align: center;
			}
			.msg-m {
				display: flex;
				padding: 20rpx 0;
				.user-img {
					flex: none;
					width: $uni-img-size-sm;
					height:$uni-img-size-sm;
					border-radius: $uni-border-radius-base;
					// background-image:linear-gradient(0deg,#9795f0 0%, #fbc8d4 100%)
					background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
				}
				.message{
					flex: none;
					max-width: 480rpx;
				}
				.msg-text{
					font-size: 35rpx;
					color: $uni-text-color;
					line-height: 44rpx;
					padding: 18rpx 24rpx;
				}
				.msg-img {
					max-width: 400rpx;
					border-radius: $uni-border-radius-base;
				}
				.msg-map {
					background: #fff;
					width: 464rpx;
					height: 284rpx;
					overflow: hidden;
					.map-name {
						font-size: $uni-font-size-lg;
						color: $uni-text-color;
						line-height: 44rpx;
						padding: 18rpx 24rpx 0 24rpx;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 1;
						overflow: hidden;
					}
					.map-address {
						font-size: $uni-font-size-sm;
						color: $uni-text-color-disable;
						padding: 0rpx 24rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 1;
						overflow: hidden;
					}
					.map-img {
						padding-top: 8rpx;
						width: 480rpx;
						height: 190rpx;
					}
				}

				.voice {
					width: 200rpx;
				}
				.voice-img {
					width: 52rpx;
					height: 52rpx;
				}
			}
			.msg-left{
				flex-direction: row;
				.msg-text{
					margin-left: 16rpx;
					background-color: #fff;
					border-radius: 0rpx 20rpx 20rpx 20rpx;
				}
				.msg-img {
					margin-left: 16rpx;
				}
				.msg-map{
					margin-left: 16rpx;
					border-radius :0px 20rpx 20rpx 20rpx;
				}
				.voice {
					min-width: 140rpx;
					max-width: 400rpx;
					display: flex;
					justify-content: start;
					align-items: center;
					.time {
						font-size: 32rpx;
						padding-left: 8rpx;
					}
					.voice-img {
						width: 54rpx;
						height: 54rpx;
					}
				}
			}
			.msg-right{
				flex-direction: row-reverse;
				.msg-text{
					margin-right: 16rpx;
					background-color: #c2e9fb;
					border-radius :20rpx 0px 20rpx 20rpx;
				}
				.msg-img {
					margin-right: 16rpx;
				}
				.msg-map{
					margin-right: 16rpx;
					border-radius :20px 0rpx 20rpx 20rpx;
				}
				.voice {
					// width: 140rpx;
					min-width: 140rpx;
					max-width: 400rpx;
					display: flex;
					justify-content: flex-end;
					margin-left: auto;
					align-items: center;
					.time {
						font-size: 32rpx;
						padding-right: 8rpx;
					}
					.voice-img {
						width: 54rpx;
						height: 54rpx;
					}
				}
			}
		}

	}

</style>
