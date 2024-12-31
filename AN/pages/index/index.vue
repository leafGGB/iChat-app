<template>
	<view class="content">
		<view class="top-bar">
			<navigator :url="`../userHome/userHome?id=${uid}`" class="top-bar-left" hover-class="none">
				<!-- <image :src="imgUrl" mode=""></image> -->
				<image class="self-img" :src="imgUrl"></image>
			</navigator>
			<view class="top-bar-center">
				<image class="logo" src="../../static/image/index/logo.png" mode=""></image>
			</view>
			<view class="top-bar-right">
				<image class="search" @tap="toSearch" src="../../static/image/index/search.png" mode=""></image>
				<image class="add" @tap="toGroup" src="../../static/image/index/add.png" mode=""></image>
			</view>
		</view>
		
		<view class="main">
			<!-- 没有网络时，显示加载动画 -->
			<view class="refresh" v-if="refresh">
				<image src="../../static/image/common/refresh.gif" mode=""></image>
				<view class="text">下拉刷新</view>
			</view>
			
			<!-- 没有好友的时候显示 -->
			<view class="noneFriend" v-if="isSleep">
				<image src="../../static/image/common/sleep.gif" mode="aspectFill"></image>
				<view class="title">你还没有好友</view>
				<view class="select-btn" @tap="toSearch">搜索用户</view>
			</view>
			
			<!-- 好友申请通知 -->
			<view class="friends" v-show="friendReqData > 0" @tap="goReqPage">
				<view class="friend-list">
					<view class="friend-list-l">
						<text class="tip">{{friendReqData}}</text>
						<view class="newFriends">
							<image class="friends" src="../../static/image/index/friendAdd.png" mode=""></image>
						</view>
					</view>
					<view class="friend-list-r">
						<view class="top">
							<view class="name">好友申请</view>
							<view class="time">{{changeTime(lastReqTime)}}</view>
						</view>
						<view class="message">
							您有新的好友请求
						</view>
					</view>
				</view>
			</view>
			
			<!-- 好友列表 -->
			<view class="friends">
				<view class="friend-list" v-for="(item,index) in friends" :key="item.id" @tap="toChatRoom(item)">
					<view class="friend-list-l">
						<text class="tip" v-show="item.tip>0">{{item.tip}}</text>
						<image :src="item.imgUrl" mode=""></image>
						<view class="group-item" v-show="item.type == 1"></view>
					</view>
					<view class="friend-list-r">
						<view class="top">
							<view class="name">{{item.name}}</view>
							<view class="time">{{changeTime(item.lastTime)}}</view>
						</view>
						<view class="message" v-if="item.type ==  1 && item.lastMessage">
							{{item.lastMessage.message}}
						</view>
						<view class="message" v-else>
							{{item.message}}
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import datas from '../../commons/js/datas.js'
	import myfun from '../../commons/js/myfun.js'
	import base from '../../config/config.js' 
	
	export default {
		data() {
			return {
				friends: [],  // 好友
				groups: [],   // 群
				uid: '',      // 用户id
				myname: '',   // 用户名
				imgUrl: '',   // 用户头像
				token: '',    // 用户token
				friendReqData: 0,   // 好友申请数
				lastReqTime: '',        // 最后一次好友申请时间
				refresh: false,          // 是否需要下拉刷新
				isSleep: false,         // 是否显示没有好友而显示的组件
			}
		},
		onLoad() {
			this.getStorages();
			this.friendRequest();
			this.getFriendsList();
			this.getGroupsList();
			// console.log(this.uid)
			this.join(this.uid);
			this.receiveSocketMsg();
			this.groupsReceive();
			this.leaveChatRoom();
		},
		onPullDownRefresh() {
			this.friends = [];
			this.groups = [];
			this.getStorages();
			this.friendRequest();
			this.getFriendsList();
			this.getGroupsList();
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			// 获取时间
			changeTime: function(date) {
				return myfun.dateTime(date);
			},
			// 获取缓存数据
			getStorages() {
				try {
					const value = uni.getStorageSync('user');
					if (value) {
						this.uid = value.id;
						this.imgUrl = base + value.imgUrl;
						this.token = value.token;
						this.myname = value.name;
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
			
			// 好友请求数据
			friendRequest() {
				uni.request({
					url: base + '/home/getFriends',
					data: {
						uid: this.uid,
						state: 1,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						this.refresh = false;
						let status = data.data.status;
						// console.log('状态： ' + status)
						// console.log('上班卡是不: ' + this.token)
						//访问后端成功
						if(status == 200) {
							this.isSleep = false;
							let res = data.data.result;
							this.friendReqData = res.length;
							if(res.length > 0) {
								this.lastReqTime = res[0].lastTime;
								for (let i = 0; i < res.length; i++) {
									if(this.lastReqTime < res[i].lastTime){
										this.lastReqTime = res[i].lastTime;
									}
								}
							} else {
								// 没有好友
								this.isSleep = true;
							}
						} else if(status == 300) {
							// token过期，跳转登录页面
							uni.navigateTo({
								url: '../signin/signin?name=' + this.myname
							})
							// console.log("token过期")
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
			
			// 获取好友列表
			getFriendsList() {
				uni.request({
					url: base + '/home/getFriends',
					data: {
						uid: this.uid,
						state: 0,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						this.refresh = false;
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							this.isSleep = false;
							let res = data.data.result;
							// console.log(res)
							if(res.length > 0) {
								for(let i = 0; i < res.length; i++) {
									res[i].imgUrl = base + res[i].imgUrl;
									if(res[i].markname) {
										res[i].name = res[i].markname;
									}
									this.friends.push(res[i]);
								}
								// 排序
								this.sort(this.groups);
							} else {
								// 没有好友
								this.isSleep = true;
							}
							// 获取群列表
							// this.getGroupsList();
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
			
			// 获取群列表
			getGroupsList() {
				uni.request({
					url: base + '/home/getGroups',
					data: {
						uid: this.uid,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let res = data.data.result;
							// console.log(res)
							if(res.length > 0) {
								for(let i = 0; i < res.length; i++) {
									res[i].imgUrl = base + res[i].imgUrl;
									// this.friends.push(res[i]);
									this.groups.push(res[i]);
									this.socket.emit('group', res[i].id);
									// console.log(this.groups[1])
								}
							}
							// 排序
							this.sort(this.friends)
	
							// 获取群内最后一条信息
							// console.log(this.groups)
							// console.log(res)
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
			
			// 好友与群排序
			sort(e) {
				if (e.length > 0) {
					// 数组拼接
					this.friends = this.friends.concat(this.groups);
					// 排序
					this.friends = myfun.sort(this.friends, 'lastTime', 0)
					// console.log(this.friends[1].latestMessage.message)
					// console.log(this.friends)
				}
			},
			
			
			// 已废弃
			// 获取最后一条好友消息
			getLastMsg(arr, i) {
				uni.request({
					url: base + '/home/getLastMsg',
					data: {
						uid: this.uid,
						fid: arr[i].id,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						// console.log('群: '+status)
						//访问后端成功
						if(status == 200) {
							let res = data.data.result;
							if(res.types == 0) {
								// 文字
							} else if(res.types == 1) {
								// 图片
								res.message = '[图片]'
							} else if(res.types == 2) {
								// 音频
								res.message = '[音频]'
							} else if(res.types == 3) {
								// 定位
								res.message = '[定位]'
							}
							let e = arr[i];
							e.message = res.message;
							arr.splice(i, 1, e)
							// console.log(res)
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
			
			// 已废弃
			// 未读消息数
			unreadMsgAmount(arr, i) {
				uni.request({
					url: base + '/home/unreadMsg',
					data: {
						uid: this.uid,
						fid: arr[i].id,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let res = data.data.result;
							let e = arr[i];
							e.tip = res;
							arr.splice(i, 1, e)
							// console.log(res)
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
			
			// socket模块
			// 用户登录时，注册socket
			join(uid) {
				this.socket.emit('login', uid);
			},
			
			// socket聊天数据接收
			receiveSocketMsg() {
				this.socket.on('msg', (msg, fromid, tip) => {
					let nMsg = '';
					if (msg.types == 0) {
						nMsg = msg.message;
					} else if (msg.types == 1) {
						nMsg = '[图片]'
					} else if (msg.types == 2) {
						nMsg = '[音频]'
					} else if (msg.types == 3) {
						nMsg = '[定位]'
					}
					
					// 查找到对应项，然后修改
					for (let i = 0; i < this.friends.length; i++) {
						if(this.friends[i].id == fromid) {
							let e = this.friends[i];
							e.lastTime = new Date();
							e.message = nMsg;
							if (tip != 1) {
								e.tip++;
							}
							// 删除原来数据项
							this.friends.splice(i, 1);
							// 新消息插入到最顶部
							this.friends.unshift(e);
						}
					}
				})
			},
			
			// 群消息接收
			groupsReceive() {
				this.socket.on('groupmsg', (msg, fromid, gid, name, tip) => {
					let nMsg = '';
					if (msg.types == 0) {
						nMsg = msg.message;
					} else if (msg.types == 1) {
						nMsg = '[图片]'
					} else if (msg.types == 2) {
						nMsg = '[音频]'
					} else if (msg.types == 3) {
						nMsg = '[定位]'
					}
					// 查找到对应项，然后修改
					for (let i = 0; i < this.friends.length; i++) {
						if(this.friends[i].id == gid) {
							let e = this.friends[i];
							e.lastTime = new Date();
							if (fromid == this.uid) {
								e.message = nMsg;
							}else {
								e.message = name + '：' + nMsg;
							}
							if (fromid != this.uid) {
								e.tip++;
							}
							// e.tip++;
							// 删除原来数据项
							this.friends.splice(i, 1);
							// 新消息插入到最顶部
							this.friends.unshift(e);
						}
					}
				})
			},
			
			// 跳转到搜索页面
			toSearch() {
				uni.navigateTo({
					url: '../search/search',
				})
			},
			
			// 离开当前聊天页面触发的socket
			leaveChatRoom() {
				this.socket.on('leaveChat', (uid, fid) => {
					// 查找到对应项，然后修改
					for (let i = 0; i < this.friends.length; i++) {
						if(this.friends[i].id == fid) {
							let e = this.friends[i];
							// if (fromid != this.uid) {
							// 	e.tip++;
							// }
							e.tip = 0;
							// 替换原来数据项
							this.friends.splice(i, 1, e);
						}
					}
				})
			},
			
			// 跳转到好友请求页面
			goReqPage() {
				uni.navigateTo({
					url: '../friendRequest/friendRequest',
				})
			},
			
			// 跳转到聊天页面
			toChatRoom(data) {
				console.log(data)
				uni.navigateTo({
					url: '../chatRoom/chatRoom?id=' + data.id + '&name=' + data.name + '&img=' + data.imgUrl + '&type=' + data.type,
				})
			},
			
			// 建群
			toGroup() {
				uni.navigateTo({
					url: '../group/group',
				})
			},
		}
	}
</script>

<style lang="scss">
	@import "../../commons/css/common.scss";
	.content {
		display: flex;
		flex-direction: column;
		padding-top: var(--status-bar-height);
		padding-bottom: $uni-spacing-col-base;
		
		.top-bar {
			border-bottom: 1px solid $uni-border-color;
			.top-bar-right {
				image {
					width: 52rpx;
					height: 52rpx;
				}
			}
			
		}
	}
	
	.main {
		padding-top: 104rpx;
		padding-bottom: $uni-spacing-col-base;
	}
	.refresh{
		text-align: center;
		padding-top: 500rpx;
		image {
			width: 32rpx;height: 32rpx;
		}
		.ref-title{
			padding-top: 10rpx;
			font-size: $uni-font-size-base;
			font-family: PingFangSC-Regular,PingFang SC;
			color: rgba( 39,40,50,0.4);
			line-height: 40rpx;
		}
	}
	
	.noneFriend {
		text-align: center;
		padding-top: 400rpx;
		image {
			width: 354rpx;
			height: 292rpx;
		}
		.title {
			padding: 32rpx 0;
			font-size: $uni-font-size-base;
			font-family: PingFangSC-Regular,PingFang SC;
			color: rgba( 39,40,50,0.4);
			line-height: 40rpx;
		}
		.select-btn {
			display: inline-block;
			width: 240rpx;
			height: 96rpx;
			background :$uni-color-primary;
			box-shadow: 0px 52rpx 36rpx -32rpx rgba(255,228,49,0.4);
			border-radius: 48rpx;
			font-size: $uni-font-size-base;
			font-family: PingFangSC-Regular,PingFang SC;
			color: $uni-text-color;
			line-height: 96rpx;

		}
	}

	
	.friend-list {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 96rpx;
		padding: 16rpx $uni-spacing-col-base;
		&:active {
			background-color: $uni-bg-color-grey;
		}
		
		.friend-list-l {
			position: relative;
			width: 96rpx;
			height: 96rpx;
			image {
				width: 96rpx;
				height: 96rpx;
				border-radius: $uni-border-radius-base;
				// background-color: $uni-color-primary;
				background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
			}
			.tip {
				position: absolute;
				top: -8rpx;
				left: 68rpx;
				min-width: 24rpx;
				height: 36rpx;
				padding: 0 6rpx;
				z-index: 100;
				background: $uni-color-warning;
				border-radius: 18rpx;
				font-size: $uni-font-size-sm;
				color: $uni-text-color-inverse;
				line-height: 36rpx;
				text-align: center;
			}
			.newFriends {
				border-radius: $uni-border-radius-base;
				background-color: $uni-color-primary;
				padding: 22rpx;
				.friends {
					width: 52rpx;
					height: 52rpx;
				}
			}
			.group-item {
				position: absolute;
				bottom: 8rpx;
				right: 0rpx;
				width: 16rpx;
				height: 16rpx;
				z-index: 100;
				background: $uni-color-primary;
				border-radius: 8rpx;
				opacity: 0.8;
				box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.3);
			}
		}
		
		.friend-list-r {
			padding-left: 32rpx;
			display: flex;
			flex-direction: column;
			width:calc(100% - 60rpx);
			.top {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width:100%;
				.name {
					font-size: 36rpx;
					font-weight: 400;
					color: $uni-text-color;
					line-height: 50rpx;
				}
				.time {
					font-size: $uni-font-size-sm;
					color: $uni-text-color-disable;
					line-height: 50rpx;
				}
			}
			
			.message {
				font-size: $uni-font-size-base;
				color: $uni-text-color-grey;
				line-height: 40rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}
		}
	}
		
	
</style>
