<template>
	<view class="content">
		<view class="top-bar">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
			<view class="top-bar-center">
				<view class="title">好友请求</view>
			</view>
			<view class="top-bar-right">
				<view class="pice"></view>
			</view>
		</view>
		<view class="main">
			<view class="requester" v-for="(item, index) in requesters" :key="item.id">
				<view class=" request-top">
					<view class="reject btn" @tap="refuseFriendApply(item.id)">拒绝</view>
					<view class="header-img">
						<image :src="item.imgUrl"></image>
					</view>
					<view class="aggree btn" @tap="consentFriendApply(item.id)">同意</view>
				</view>
				<view class="request-center">
					<view class="title">{{item.name}}</view>
					<view class="time">{{changeTime(item.lastTime)}}</view></view>
				<view class="notic">
					<text>留言: </text>
					{{item.message}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import myfun from '../../commons/js/myfun.js'
	import base from '../../config/config.js'
	
	export default {
		data() {
			return {
				requesters: [],
				uid: '',      // 用户id
				myname: '',   // 用户名
				token: '',    // 用户token
			};
		},
		onLoad() {
			this.getStorages();
			this.friendRequest();
		},
		
		// 返回到登录页面
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
				// 		this.myname = res.data.name;
				// 	},
				// 	fail: function() {
				// 		// 如果本地没有用户缓存,跳转到登录页面
				// 		uni.navigateTo({
				// 			url: '../signin/signin'
				// 		})
				// 	}
				// });
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
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let res = data.data.result;
							for(let i = 0; i < res.length; i++) {
								res[i].imgUrl = base + res[i].imgUrl;
								this.getLeave(res, i)
							}
							this.requesters = res;
							console.log(res)
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
			
			// 获取留言
			getLeave(arr, i) {
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
						//访问后端成功
						if(status == 200) {
							let res = data.data.result;
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
			
			// 拒绝好友申请
			refuseFriendApply(fid) {
				uni.request({
					url: base + '/friend/deleteFriend',
					data: {
						uid: this.uid,
						fid: fid,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						// console.log(data.data)
						//访问后端成功
						if(status == 200) {
							for(let i = 0; i < this.requesters.length; i++) {
								if(this.requesters[i].id = fid) {
									this.requesters.splice(i, 1);
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
			
			// 同意好友申请
			consentFriendApply(fid) {
				uni.request({
					url: base + '/friend/updateFriendState',
					data: {
						uid: this.uid,
						fid: fid,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						console.log(data.data)
						//访问后端成功
						if(status == 200) {
							for(let i = 0; i < this.requesters.length; i++) {
								if(this.requesters[i].id = fid) {
									this.requesters.splice(i, 1);
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
			
			// 返回到登录页面
			goBack: function() {
				uni.navigateBack({
					delta: 1,
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "../../commons/css/common.scss";
	
	.top-bar {
		background: rgba(255, 255, 255, 0.96);
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
	}
	
	.main{
		padding: 88rpx $uni-spacing-col-base;
		.requester{
			margin: 112rpx 0 20rpx;
			padding: $uni-spacing-col-base;
			background : rgba(255,255,255,1);
			box-shadow: 0px 24rpx 64rpx -8rpx rgba(0,0,0,0.1);
			border-radius: $uni-border-radius-base;
		}
		
		.request-top{
			display: flex;
			flex-direction: row;
			.btn {
				flex: none;
				text-align: center;
				width: 160rpx;
				height:64rpx;
				background : rgba( 255,93,91,0.1);
				border-radius: 40rpx;
				font-size: $uni-font-size-lg;
				line-height: 64rpx;
			}
			.reject{
				color: $uni-color-warning;
				background-color: rgba(255,93,91,0.1);
			}
			.aggree{
				color: $uni-text-color;
				background-color: $uni-color-primary;
			}

			.header-img {
				margin-top: -104rpx;
				flex: auto;
				text-align: center;
				image {
					width:144rpx;
					height: 144rpx;
					border-radius: 50%;
					background-color: $uni-color-primary;
				}
			}
		}
		
		.request-center{
			text-align: center;
			padding-top: 20rpx;
			padding-bottom: 30rpx;
			.title{
				font-size: 40rpx;
				font-weight:500;
				color:$uni-text-color;
				line-height:50rpx;
			}
			.time{
				font-size:$uni-font-size-base;
				color:$uni-text-color-disable;
				line-height: 34rpx;
				padding-top: 10rpx;
			}
		}
		
		.notic{
			padding: $uni-spacing-row-sm $uni-spacing-col-base;
			border-radius: $uni-border-radius-base;
			background-color: $uni-bg-color-grey;
			font-size:$uni-font-size-lg;
			color: #000;
			line-height: 40rpx;
		}
	}


</style>
