<template>
	<view class="content">
		<view class="top-bar">
			<view class="header">
				<input class="search" type="search" @input="search" placeholder="搜索用户/群" placeholder-style="color:#aaa;font-weight:400;">
				<image class="search-img" src="../../static/image/index/search.png"></image>
			</view>
			<view class="top-bar-right">
				<view class="text" @tap="goBack">取消</view>
			</view>
		</view>
		
		<view class="main">
			<view class="users result">
				<view class="title" v-show="userArr.length > 0">用户</view>
				<view class="list user" v-for="(item, index) in userArr" :key="item.id">
					<navigator :url="`../userHome/userHome?id=${item._id}`" hover-class="none">
						<image :src="item.imgUrl"></image>
					</navigator>
					<view class="list-r">
						<view class="names">
							<view class="name" v-html="item.name"></view>
							<view class="email" v-html="item.email"></view>
						</view>
						<view class="right-btn send" v-show="item.tip == 1" @tap="toChatRoom(item)">发消息</view>
						<view class="right-btn addFriend" @tap="addFriendBtn(item._id)" v-show="item.tip == 0">加好友</view>
					</view>
				</view>
			</view>
			
			<!-- 好友申请弹出框 -->
			<view class="modify" :style="{bottom: -+widHeight+'px'}" :animation="animationData">
				<view class="modify-header">
					<view class="close" @tap="modifty">取消</view>
					<view class="title">添加好友</view>
					<view class="define" @tap="addFriendSubmit">确定</view>
				</view>
				<view class="modfiy-main">
					<textarea v-model="msg" class="modfiy-content"></textarea>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import datas from "../../commons/js/datas.js"
	import myfun from "../../commons/js/myfun.js"
	import base from '../../config/config.js'
	
	export default {
		data() {
			return {
				userArr: [],
				uid: '',
				token: '',
				myname: '',
				fid: '',                       // 想要申请为好友的用户的id
				msg: '',                       // 修改个人信息
				animationData: {},                       // 动画
				isModfiy: false,                         // 动画开关
				widHeight: '',                           // 页面高度
			};
		},
		onLoad() {
			this.getStorages();
		},
		onReady: function() {
			this.getElementStyle();
		},
		methods: {
			// 获取缓存数据
			
			getStorages() {
				try {
					const value = uni.getStorageSync('user');
					if (value) {
						this.uid = value.id;
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
				
				// uni.getStorage({
				// 	key: 'user',
				// 	success: (res) => {
				// 		this.uid = res.data.id;
				// 		this.token = res.data.token;
				// 		this.myname = res.data.name
				// 	},
				// 	fail: function() {
				// 		// 如果本地没有用户缓存,跳转到登录页面
				// 		uni.navigateTo({
				// 			url: '../signin/signin'
				// 		})
				// 	}
				// });
			},
			
			// 获取关键字
			search: myfun.debounce(function(e){
				this.userArr = [];
				let searchVal = e.detail.value;
				if (searchVal.length > 0) {
					this.searchUser(searchVal);
				}
			}, 500),
			
			search1: function(e) {
				this.userArr = [];
				let searchVal = e.detail.value;
				if (searchVal.length > 0) {
					console.log(searchVal)
					this.searchUser(searchVal);
				}
			},
			
			// 获取关键字匹配的好友
			searchUser: function(e) {
				uni.request({
					url: base + '/search/user',
					data: {
						data: e,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let arr = data.data.result;
							// let exp = eval("/"+e+"/g");
							for (let i = 0; i < arr.length; i++) {
								if (arr[i].name && arr[i].email) {
									this.isFriend(arr[i], e);
								}
							}
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
			
			// 判断是否为好友
			isFriend: function(arr, e) {
				let tip = 0;
				let exp = eval("/"+e+"/g");
				if (arr._id == this.uid) {
					tip = 2;
					arr.tip = tip;
					arr.imgUrl = base + arr.imgUrl;
					arr.names = arr.name.replace(exp,"<span style='color: #8fd3f4;'>"+e+"</span>");
					arr.emails = arr.email.replace(exp,"<span style='color: #8fd3f4;'>"+e+"</span>");
					this.userArr.push(arr);
				} else {
					uni.request({
						url: base + '/search/isFriend',
						data: {
							uid: this.uid,
							fid: arr._id,
							token: this.token
						},
						method: 'POST',
						success: (data) => {
							let status = data.data.status;
							//访问后端成功
							if(status == 200) {
								// 是好友
								tip = 1;
							} else if(status == 400) {
								// 不是好友
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
							arr.tip = tip;
							arr.id = arr._id;
							arr.type = 0;
							arr.imgUrl = base + arr.imgUrl;
							arr.names = arr.name.replace(exp,"<span style='color: #8fd3f4;'>"+e+"</span>");
							arr.emails = arr.email.replace(exp,"<span style='color: #8fd3f4;'>"+e+"</span>");
							this.userArr.push(arr);
						}
					})
				}
			},
			
			// 获取页面高度
			getElementStyle: function() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.modify').boundingClientRect(data => {
					this.widHeight = data.height;
					// console.log("高度："+this.widHeight)
				}).exec();
			},
			
			// 修改个人信息弹窗
			modifty(type, data, isPaw) {
				this.modiftyTitle = type;
				this.data = data;
				this.isPaw = isPaw;
				this.isModfiy = !this.isModfiy;
				var animation = uni.createAnimation({
					duration: 300,
				    timingFunction: 'ease',
				})
				
				if(this.isModfiy) {
					animation.bottom(300).top('50%').step();
				} else {
					animation.bottom(-this.isModfiy).top(1500).step();
				}
				this.animationData = animation.export();
			},
			
			// 添加好友按钮
			addFriendBtn(fid) {
				this.fid = fid;
				this.msg = this.myname + ' 请求添加为好友~';
				this.modifty();
			},
			
			// 添加好友请求发送
			addFriendSubmit() {
				if(this.msg.length > 0) {
					this.modifty();
					uni.request({
						url: base + '/friend/applyFriend',
						data: {
							uid: this.uid,
							fid: this.fid,
							token: this.token,
							msg: this.msg
						},
						method: 'POST',
						success: (data) => {
							let status = data.data.status;
							//访问后端成功
							if(status == 200) {
								// 发送好友请求
								uni.showToast({
									title: '好友请求已发送',
									icon: 'none',
									duration: 1500
								});
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
				}
			},
			
			// 跳转到聊天页面
			toChatRoom(data) {
				uni.navigateTo({
					url: '../chatRoom/chatRoom?id=' + data.id + '&name=' + data.name + '&img=' + data.imgUrl + '&type=' + data.type,
				})
			},
			
			// 返回到首页
			goBack() {
				uni.navigateBack({
					delta: 1,
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "../../commons/css/common.scss";
	
	.content {
		.top-bar {
			background: rgba(255, 255, 255, 0.96);
			border-bottom: 1px solid $uni-border-color;
			.header {
				width: 100%;
				z-index: -1;
				box-sizing: border-box;
				padding: 14rpx 118rpx 14rpx $uni-spacing-col-base;
				
				.search {
					width: 100%;
					padding: 0 60rpx 0 12rpx;
					height: 60rpx;
					background: $uni-bg-color-grey;
					border-radius: 10rpx;
				}
				
				.search-img {
					position: absolute;
					right: 160rpx;
					top: 22rpx;
					width: 40rpx;
					height: 40rpx;
				}
			}
		}
		
		.text {
			width: 66rpx;
			font-size: $uni-font-size-lg;
			font-weight: 700;
			color: $uni-text-color;
			line-height: 88rpx;
		}
		
		.main {
			padding: 88rpx $uni-spacing-col-base;
			
			.result {
				padding-top: $uni-spacing-col-base;
				.title {
					font-size: 44rpx;
					font-weight: 600;
					color: $uni-text-color;
					line-height: 60rpx;
				}
				.list {
					display: flex;
					justify-content: flex-start;
					align-items: center;
					width: 100%;
					height: 80rpx;
					padding: 20rpx 0;
					
					image {
						width: 80rpx;
						height: 80rpx;
						border-radius: $uni-border-radius-base;
						background-image:linear-gradient(0deg,#9795f0 0%, #fbc8d4 100%)
					}					
				}
				.list-r {
					display: flex;
					justify-content: space-between;
					align-items: center;
					width:100%;
				}
				.names {
					padding-left: $uni-spacing-col-base;
					.name {
						font-size: 36rpx;
						color: $uni-text-color;
						line-height: 50rpx;
					}
				}
				.email {
					font-size: $uni-font-size-sm;
					color: $uni-text-color;
					line-height: 20rpx;
				}
				.right-btn {
					width: 120rpx;
					height: 48rpx;
					border-radius: 24rpx;
					font-size: $uni-font-size-sm;
					line-height: 48rpx;
					// margin-top: 16rpx;
					text-align: center;
				}
				.send {
					background-color: $uni-color-primary;
					color: $uni-text-color;
				}
				.addFriend {
					background-color: rgba(74, 170, 255, 0.1);
					color: $uni-color-success;
				}
			}
		}
	}
	
	// 修改个人信息弹窗
	.modify {
		// position: absolute;
		top: 1400px;
		left: 50%;
		transform: translate(-50%, -70%);
		position: fixed;
		// left: 50%;
		// top: 50%;
		z-index: 1002;
		height:800rpx;
		width: 600rpx;
		// background-color:#eec;
		background-image:linear-gradient(-225deg,#E3FDF5 0%, #FFE6FA 100%);		
		border-radius: 18rpx;
		.modify-header {
			width:100%;
			height:88rpx;
			padding-top: var(--status-bar-height);
			display: flex;
			flex-direction: row;
			align-items: center;
			border-bottom: 1px solid $uni-border-color;
			.close {
				padding-left: 32rpx;
				font-size:$uni-font-size-lg;
				color: $uni-text-color;
				line-height: 44px;
			}
			.title{
				flex: auto;
				text-align: center;
				font-size: 40rpx;
				color:$uni-text-color;
				line-height:88rpx;
			}
			.define{
				padding-right:$uni-spacing-col-base;
				font-size: $uni-font-size-lg;
				color:$uni-color-success;
				line-height:44rpx;
			}
		}
		.modfiy-main{
			display: flex;
			padding: $uni-spacing-col-base;
			flex-direction: column;
			.modfiy-pwd {
				margin-bottom: $uni-spacing-col-base;
				padding: 0 20rpx;
				box-sizing: border-box;
				flex: auto;
				width:100%;
				height: 88rpx;
				background: #fff;
				border-radius: $uni-border-radius-base;
				font-size: $uni-font-size-lg;
				color: $uni-text-color;
				line-height:88rpx;
			}
	
			.modfiy-content {
				padding: 16rpx 20rpx;
				box-sizing: border-box;
				flex: auto;
				width: 100%;
				height:186rpx;
				background: #fff;
				border-radius: $uni-border-radius-base;
				font-size: $uni-font-size-lg;
				color:$uni-text-color;
				line-height: 44rpx;
			}
		}
	}
	
	// .content {
	// 	// display: flex;
	// 	// flex-direction: column;
	// 	// align-items: center;
	// 	// justify-content: center;
	// 	padding-top: var(--status-bar-height);
	// }
	// .top-bar {
	// 	position: fixed;
	// 	top: 0;
	// 	left: 0;
	// 	z-index: 1001;
	// 	height: 88rpx;
	// 	width: 100%;
	// 	padding-top: var(--status-bar-height);
	// 	background: $uni-bg-color;
		
	// 	.top-bar-right {
	// 		float: right;
	// 		padding-right: 32rpx;
			
	// 		.text {
	// 			font-size: $uni-font-size-lg;
	// 			font-weight: 700;
	// 			color: $uni-text-color;
	// 			line-height: 88rpx;
	// 		}
	// 	}
	// }
</style>
