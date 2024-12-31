<template>
	<view class="content">
		<view class="top-bar">
			<view class="top-bar-right" @tap="toSignUp">
				<view class="text">注册</view>
			</view>
		</view>
		<view class="logo">
			<image src="../../static/image/index/logo.png" mode=""></image>
		</view>
		<view class="main">
			<view class="title" @tap="ggg">登录</view>
			<view class="slogan" @tap="ppp">欢迎登录</view>
			<view class="inputs">
				<input class="user" type="text" v-model="user" placeholder="用户名/邮箱" placeholder-style="color:#aaa;font-weight:400;">
				<input class="psw" type="password" v-model="password" placeholder="密码" placeholder-style="color:#aaa;font-weight:400;">
			</view>
			<view class="tips" v-show="nameOrPswErr">用户名或密码为空或错误</view>
		</view>
		<view class="submit" @tap="login">登录</view>
	</view>
</template>

<script>
import datas from '../../commons/js/datas';
import base from '../../config/config.js' 
	export default {
		data() {
			return {
				user: '',
				password: '',
				tokn: '',
				nameOrPswErr: false, // 用户名或密码错误
			};
		},
		onLoad(e) {
			if (e.user) {
				this.user = e.user;
				uni.showToast({
					title: '注册成功，请登录',
					icon: 'none',
					duration: 1500
				});
			} else if(e.name) {
				this.user = e.name;
				uni.showToast({
					title: '登录过期，请重新登录',
					icon: 'none',
					duration: 1500
				});
			} else if(e.alterPsw) {
				this.user = e.alterPsw;
				uni.showToast({
					title: '密码修改成功，请重新登录',
					icon: 'none',
					duration: 1500
				});
			}
		},
		methods: {
			// 跳转到注册页面
			toSignUp: function() {
				uni.navigateTo({
					url: '/pages/signup/signup',
				})
			},
			
			ggg() {
				uni.navigateTo({
					url: '../live/live'
				})
			},
			ppp() {
				uni.navigateTo({
					url: '../live/livePlay'
				})
			},
			
			// 登录提交
			login() {
				uni.request({
					url: base + '/signin/login',
					data: {
						data: this.user,
						password: this.password
					},
					method: 'POST',
					success: (data) => {
						// console.log(data);
						let status = data.data.status;
						// 访问后端成功
						if(status == 200) {
							// 登录成功
							let res = data.data.back;
							this.nameOrPswErr = false;
							// 本地存储用户信息
							// try {
							// 	uni.setStorageSync('user', {'id': res.id, 'name': res.name, 'imgUrl': res.imgUrl, 'token': res.token});
							// } catch (e) {
							// 	console.log('本地存储用户数据失败');
							// }
							// try {
							// 	uni.setStorageSync('user', {'id': res.id, 'name': res.name, 'imgUrl': res.imgUrl, 'token': res.token});
							// 	console.log('本地存储用户数据成功');
							// } catch (e) {
							// 	// error
							// }
							uni.setStorage({
								key: 'user',
								data: {'id': res.id, 'name': res.name, 'imgUrl': res.imgUrl, 'token': res.token},
								success: function () {
									console.log('本地存储用户数据成功');
								}
							});
							
							// 跳转到首页
							uni.navigateTo({
								url: '../index/index'
							})
						} else if(status == 400) {
							// 用户名或密码错误
							this.nameOrPswErr = true;
						}
						else if(status == 500) {
							// 服务器出错
							uni.showToast({
								title: '服务器出错',
								icon: 'none',
								duration: 1500
							});
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
.content {
	// display: flex;
	// flex-direction: column;
	// align-items: center;
	// justify-content: center;
	padding-top: var(--status-bar-height);
}
	
.top-bar {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1001;
	height: 88rpx;
	width: 100%;
	padding-top: var(--status-bar-height);
	background: $uni-bg-color;
	
	.top-bar-right {
		float: right;
		padding-right: 32rpx;
		
		.text {
			font-size: $uni-font-size-lg;
			font-weight: 700;
			color: $uni-text-color;
			line-height: 88rpx;
		}
	}
}

.logo  {
	text-align: center;
	image {
		padding-top: 256rpx;
		width: 148rpx;
		height: 152rpx;
		margin: 0 auto;
	}
	
}

.main {
	padding: 54rpx $uni-spacing-col-lg 120rpx;
	// width: 100%;
	
	.title {
		font-size: 56rpx;
		font-weight: 700;
		color: $uni-text-color;
		line-height: 80rpx;
	}
	.slogan {
		font-size: 40rpx;
		color: $uni-text-color-grey;
		line-height: 56rpx;
	}
	.inputs {
		padding-top: 8rpx;
		input {
			padding-top: 30rpx;
			height: 88rpx;
			font-size: $uni-font-size-lg;
			font-weight: 700;
			color: $uni-text-color;
			line-height: 88rpx;
			border-bottom: 1px solid $uni-border-color;
		}
	}
	.tips {
		float: left;
		font-size: $uni-font-size-lg;
		color: $uni-color-warning;
		line-height: 56rpx;
	}
}

.submit {
	margin: 0 auto;
	width: 520rpx;
	height: 96rpx;
	// background: $uni-color-primary;
	background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
	box-shadow: 0px 50rpx 32rpx -36rpx rgba(177, 214, 252, 0.8);
	border-radius: 48rpx;
	font-size: $uni-font-size-lg;
	font-weight: 700;
	color: $uni-text-color;
	line-height: 96rpx;
	text-align: center;
	
	&:active {
		box-shadow: 0px 50rpx 32rpx -36rpx rgba(177, 214, 252, 0.8);
		box-shadow: inset 4px 4px 4px rgba(0, 0, 0, 0.3), inset -4px -4px 4px rgba(233, 244, 255, 0.5);
	}
}
</style>
