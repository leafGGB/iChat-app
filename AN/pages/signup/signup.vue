<template>
	<view class="content">
		<view class="top-bar">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
		</view>
		<view class="logo">
			<image src="../../static/image/index/logo.png" mode=""></image>
		</view>
		<view class="main">
			<view class="title">注册</view>
			<view class="inputs">
				<view class="inputs-div">
					<input class="user" type="text" placeholder="用户名"  v-model="user" @blur="matchUser" placeholder-style="color:#aaa;font-weight:400;">
					<view class="employ" v-show="userEmploy">已被占用</view>
					<image class="ok" v-show="isuser" src="../../static/image/sign/ok.png"></image>
				</view>
				<view class="inputs-div">
					<input class="email" type="text" placeholder="邮箱" v-model="email" @blur="existEmail" placeholder-style="color:#aaa;font-weight:400;">
					<view class="employ" v-show="emailEmploy">已被占用</view>
					<view class="invalid" v-show="invalid">邮箱无效</view>
					<image class="ok" v-show="isemail" src="../../static/image/sign/ok.png"></image>
				</view>
				<view class="inputs-div">
					<input class="psw" :type="type" placeholder="密码" @input="getPsw" placeholder-style="color:#aaa;font-weight:400;">
					<image class="look" @tap="looks" :src="lookUrl"></image>
				</view>
			</view>
		</view>
		<view :class="checkAll ? 'active' : 'inertia'" @tap="signUp">注册</view>
	</view>
</template>

<script>
	import base from '../../config/config.js' 
	export default {
		data() {
			return {
				type: 'password',
				isuser: false,       // 用户名是否可用
				isemail: false,     // 邮箱是否可用
				islook: false,      // 是否显示密码
				invalid: false,     // 邮箱是否符合: false 符合
				userEmploy: false,       // 用户名是否被占用
				emailEmploy: false,      // 邮箱是否被占用
				lookUrl: '../../static/image/sign/nolook.png',
				email: '',          // 邮箱
				user: '',           // 用户名
				password: '',       // 密码
				checkAll: false,
			};
		},
		computed: {
			// // 是否可以注册
			// register: function() {
			// 	let that = this;
			// 	if (that.isuser && that.isemail && that.password.length > 6) {
			// 		that.checkAll = true;
			// 	} else {
			// 		that.checkAll = false;
			// 	}
			// 	return that.checkAll;
			// },
		},
		methods: {
			// 密码显示隐藏
			looks: function() {
				if (this.look) {
					this.type = "password";
					this.look = !this.look;
					this.lookUrl = '../../static/image/sign/nolook.png'
				} else {
					this.type = "text";
					this.look = !this.look;
					this.lookUrl = '../../static/image/sign/look.png'
				}
			},
			
			// 判断邮箱格式
			existEmail: function(e) {
				let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
				// this.email = e.detail.value;
				if (this.email.length > 0) {
					if (reg.test(this.email)) {
						this.invalid = false;
						// 后端验证邮箱是否被占用
						this.matchMail()
					} else {
						this.invalid = true;
						this.isemail = false;
						this.emailEmploy = false;
					}
				} else {
					this.invalid = false;
					this.isemail = false;
					this.emailEmploy = false;
					this.register();
				}
				this.register();
			},
			// 邮箱匹配
			matchMail: function(e) {
				// this.email = e.detail.value;
				uni.request({
					url: base + '/signup/judge',
					data: {
						data: this.email,
						type: "email"
					},
					method: 'POST',
					success: (data) => {
						console.log(data);
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let res = data.data.result;
							if(res>0) {
								//表示邮箱已存在
								this.emailEmploy = true;
								this.isemail = false;
								this.invalid = false;
							} else {
								//表示邮箱不存在
								this.emailEmploy = false;
								this.isemail = true;
							}
							this.register();
						} else if(status == 500) {
							uni.showToast({
								title: '错了傻逼',
								icon: 'none',
								duration: 1500
							});
						}
					}
				})
			},
			
			
			// 匹配用户名
			matchUser: function(e) {
				// this.user = e.detail.value;
				if (this.user.length > 0) {
					uni.request({
						url: base + '/signup/judge',
						data: {
							data: this.user,
							type: "name"
						},
						method: 'POST',
						success: (data) => {
							console.log(data);
							let status = data.data.status;
							//访问后端成功
							if(status == 200) {
								let res = data.data.result;
								if(res>0) {
									//表示用户名已存在
									this.userEmploy = true;
									this.isuser = false;
								} else {
									//表示用户名不存在
									this.userEmploy = false;
									this.isuser = true;
								}
								this.register();
							} else if(status == 500) {
								uni.showToast({
									title: '错了傻逼',
									icon: 'none',
									duration: 1500
								});
							}
						}
					})
				} else {
					this.userEmploy = false;
					this.isuser = false;
					this.register();
				}
			},
			// 获取密码
			getPsw: function(e) {
				this.password = e.detail.value;
				this.register();
			},
			
			// 是否可以注册
			register: function() {
				if (this.isuser && this.isemail && this.password.length > 6) {
					this.checkAll = true;
				} else {
					this.checkAll = false;
				}
			},
			
			// 返回上一页页面
			goBack: function() {
				uni.navigateBack({
					delta: 1,
				})
			},
			
			// signUp() {
			// 	uni.navigateTo({
			// 		url: '../signin/signin?user=' + this.user
			// 	})
			// },
			
			// 注册提交
			signUp() {
				if(this.checkAll) {
					uni.request({
						url: base + '/signup/register',
						data: {
							name: this.user,
							mail: this.email,
							password: this.password
						},
						method: 'POST',
						success: (data) => {
							console.log(data);
							let status = data.data.status;
							//访问后端成功
							if(status == 200) {
								// 注册成功跳转登录页面
								uni.navigateTo({
									url: '../signin/signin?user=' + this.user
								})
							} else if(status == 500) {
								uni.showToast({
									title: '错了傻逼',
									icon: 'none',
									duration: 1500
								});
							}
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss">
// @import "../../commons/css/common.scss";

.content {
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
	
	.top-bar-left {
		float: left;
		padding-left: 32rpx;
		width: 88rpx;
		height: 88rpx;
		
		.text {
			font-size: $uni-font-size-lg;
			font-weight: 700;
			color: $uni-text-color;
			line-height: 88rpx;
		}
		.back-img {
			margin-top: 21rpx;
			width: 52rpx;
			height: 52rpx;
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
	.inputs {
		padding-top: 8rpx;
		input {
			height: 88rpx;
			font-size: $uni-font-size-lg;
			font-weight: 700;
			color: $uni-text-color;
			line-height: 88rpx;
			border-bottom: 1px solid $uni-border-color;
		}
		
		.inputs-div {
			position: relative;
			
			.employ,.invalid {
				position: absolute;
				right: 0;
				top: 0;
				font-size: $uni-font-size-sm;
				font-weight: 500;
				color: $uni-color-warning;
				line-height: 88rpx;
			}
			.ok {
				position: absolute;
				right: 0;
				top: 26rpx;
				width: 52rpx;
				height: 52rpx;
			}
			.look {
				position: absolute;
				right: 0;
				top: 26rpx;
				width: 34rpx;
				height: 34rpx;
			}
		}
	}
}

.active {
	margin: 0 auto;
	width: 520rpx;
	height: 96rpx;
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
.inertia {
	margin: 0 auto;
	width: 520rpx;
	height: 96rpx;
	background: rgba(39, 40, 50, 0.2);
	border-radius: 48rpx;
	font-size: $uni-font-size-lg;
	font-weight: 700;
	color: $uni-text-color-inverse;
	line-height: 96rpx;
	text-align: center;
}
</style>
