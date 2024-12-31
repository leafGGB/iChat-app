<template>
	<view class="content">
		<view class="top-bar">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
			<view class="top-bar-center">
				<view class="title">详情</view>
			</view>
			<view class="top-bar-right">
				<view class="pice"></view>
			</view>
		</view>
		<view class="main">
			<view class="column heads">
				<view class="row head">
					<view class="title">头像</view>
					<view class="user-head" v-if="id == uid">
						<image-cropper  :src="tempFilePath" @confirm="confirm" @cancel="cancel"></image-cropper>
						<image :src="cropFilePath" @tap="upload" class="user-img" ></image>
					</view>
					<view class="more" v-if="id == uid">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
					<image :src="cropFilePath" v-if="id != uid" class="user-img" ></image>
				</view>
				<view class="row" @tap="modifty('explain', '签名', user.explain, false)" v-if="id == uid">
					<view class="title">签名</view>
					<view class="cont">
						{{user.explain}}
					</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="row" v-if="id != uid">
					<view class="title">签名</view>
					<view class="cont">
						{{user.explain}}
					</view>
				</view>
				<view class="row">
					<view class="title">注册</view>
					<view class="cont">
						{{changeTime(user.registerTime)}}
					</view>
				</view>
			</view>
			
			<view class="column">
				<view class="row" @tap="modifty('name', '昵称', user.name, false)" v-if="id == uid">
					<view class="title">昵称</view>
					<view class="cont">
						{{user.name}}
					</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="row" @tap="modifty('markname', '昵称', markname, false)" v-if="id != uid">
					<view class="title">昵称</view>
					<view class="cont">
						{{markname}}
					</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
				
				<view class="row">
					<view class="title">性别</view>
					<view class="cont">
						<picker @change="bindPickerChange" :value="index" :range="array" v-if="id == uid">
							<view class="uni-input">{{array[index]}}</view>
						</picker>
						<view class="uni-input" v-if="id != uid">{{array[index]}}</view>
					</view>
					<view class="more" v-if="id == uid">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
				
				<view class="row">
					<view class="title">生日</view>
					<view class="cont">
						<picker mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange" v-if="id == uid">
							<view class="uni-input">{{date}}</view>
						</picker>
						<view class="uni-input" v-if="id != uid">{{date}}</view>
					</view>
					<view class="more" v-if="id == uid">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
				
				<view class="row" @tap="modifty('phone', '电话', user.phone, false)" v-if="id == uid">
					<view class="title">电话</view>
					<view class="cont">
						{{user.phone}}
					</view>
					<view class="more" v-if="id == uid">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="row" v-if="id != uid">
					<view class="title">电话</view>
					<view class="cont">
						{{user.phone}}
					</view>
				</view>
				
				<view class="row" v-if="id == uid" @tap="modifty('email', '邮箱', user.email, true)">
					<view class="title">邮箱</view>
					<view class="cont">
						{{user.email}}
					</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="row" v-if="id != uid">
					<view class="title">邮箱</view>
					<view class="cont">
						{{user.email}}
					</view>
				</view>
			</view>
			
			<view class="column" v-if="id == uid" @tap="modifty('password', '密码', '', true)">
				<view class="row">
					<view class="title">密码</view>
					<view class="cont">
						******
					</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit"></image>
					</view>
				</view>
			</view>
			
			<view class="exit" v-if="id == uid" @tap="logOut">退出登录</view>
			<view class="exit" v-if="id != uid" @tap="deleteFriend">删除好友</view>
		</view>
		
		<view class="modify" :style="{bottom: -+widHeight+'px'}" :animation="animationData">
			<view class="modify-header">
				<view class="close" @tap="modifty('', '', '', false)">取消</view>
				<view class="title">{{modiftyTitle}}</view>
				<view class="define" @tap="modiftyStbmit">确定</view>
			</view>
			<view class="modfiy-main">
				<input type="text" v-model="password" class="modfiy-pwd" placeholder="原密码" placeholder-style="color:#aaa;font-weight:400;" v-show="isPaw"></input>
				<textarea v-model="data" class="modfiy-content"></textarea>
			</view>
		</view>
	</view>
</template>

<script>
	import ImageCropper from "../../uni_modules/ling-imgcropper/components/ling-imgcropper/ling-imgcropper.vue"
	// import myfun from '../../commons/js/myfun.js'
	import myfun from '../../commons/js/myfun.js'
	import base from '../../config/config.js'
	
	export default {
		data() {
			const currentDate = this.getDate({
				format: true
			})
			return {
				// imgUrl: '',
				id: '',
				uid: '',
				myname: '',
				token: '',
				user: '',
				markname: '',
				array: ['男', '女', '未知'],              // 性别选择器
				index: 0,                                // 默认值
				date: currentDate,
				cropFilePath:'../../static/image/index/cat.png',
				tempFilePath: '',
				headimg: '',
				modiftyTitle: '',
				data: '',                       // 修改个人信息
				oldData: '',                             // 修改前的数据
				password: undefined,                     // 原密码
				isPaw: false,                            // 是否显示密码
				type: '',                                // 修改项
				animationData: {},                       // 动画
				isModfiy: false,                         // 动画开关
				widHeight: '',                           // 页面高度
			};
		},
		components: {ImageCropper},
		computed: {
			startDate() {
				return this.getDate('start');
			},
			endDate() {
				return this.getDate('end');
			}
		},
		onLoad(e) {
			this.id = e.id;
			this.getStorages();
			this.getUser();
			this.getFriendNickname();
		},
		onReady: function() {
			this.getElementStyle();
		},
		methods: {
			// 返回到登录页面
			goBack: function() {
				uni.navigateBack({
					delta: 1,
				})
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
			
			// 性别判断
			sexJudge(gender) {
				if (gender == 'male') {
					// 男性
					this.index = 0;
				} else if (gender == 'female') {
					// 女性
					this.index = 1;
				} else {
					// 未知
					this.index = 2;
				}
			},
			
			// 获取用户信息
			getUser() {
				uni.request({
					url: base + '/user/detail',
					data: {
						id: this.id,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let res = data.data.result;
							// 处理头像链接
							this.cropFilePath = base + res.imgUrl;
							//处理简介
							if(res.explain == undefined){
								res.explain = '这个人很懒,什么都没有留下~';
							}
							//处理生日
							if(res.birth == undefined){
								this.date = '0000-00-00';
							} else {
								let birth = myfun.birthdayTime(res.birth)
								this.date = birth
							}
							//处理手机号
							if(res.phone == undefined){
								res.phone = '000';
							}
							//处理markname
							if(this.markname.length == 0){
								this.markname = res.name;
							}
							this.sexJudge(res.sex)
							this.user = res;
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
			
			// 获取好友昵称
			getFriendNickname() {
				if(this.id != this.uid) {
					uni.request({
						url: base + '/user/getNickname',
						data: {
							uid: this.uid,
							fid: this.id,
							token: this.token
						},
						method: 'POST',
						success: (data) => {
							// console.log(data)
							let status = data.data.status;
							//访问后端成功
							if(status == 200) {
								let res = data.data.result;
								// this.markname = res.markname;
								if (res.markname != undefined) {
									// 如果昵称存在
									this.markname = res.markname;
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
				}
			},
			
			
			// 性别选择器
			bindPickerChange: function(e) {
			    // console.log('picker发送选择改变，携带值为', e.detail.value)
			    let oldIndex = this.index;
				this.index = e.detail.value
				if(this.index != oldIndex) {
					let sex = 'asexual';
					if(this.index == 0) {
						// 男
						sex = 'male';
					} else if(this.index == 1) {
						// 女
						sex = 'female';
					}
					console.log("改变")
					this.update(sex, 'sex', undefined);
				}
			},
			
			// 生日选择器
			bindDateChange: function(e) {
				let oldDate = this.date;
				this.date = e.detail.value
				if(this.date != oldDate) {
					this.update(this.date, 'birth', undefined);
				}
				// console.log(e.detail)
			},
			getDate(type) {
				const date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();
	
				if (type === 'start') {
					year = year - 60;
				} else if (type === 'end') {
					year = year + 2;
				}
				month = month > 9 ? month : '0' + month;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}-${day}`;
			},
			
			// 图片裁剪
			upload() {	
			    uni.chooseImage({
			        count: 1, //默认9
			        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			        sourceType: ['album', 'camera'], //从相册选择
			        success: (res) => {
			            this.tempFilePath = res.tempFilePaths[0];
			        }
			      });
			},
			confirm(e) {
				this.tempFilePath = ''
				this.cropFilePath = e.detail.tempFilePath
			  	this.headimg = e.detail.tempFilePath;
				this.uploadimg()
			},
			uploadimg(){
				if(this.headimg!='') {
					uni.showLoading({
						title: '上传中'
					});	 
					uni.uploadFile({
						url: base + '/files/upload',
						filePath: this.headimg,
						name: 'file',
						fileType:'image',
						formData:{
							url: 'user',
							name: this.uid,
							token: this.token
						},                         // 传递参数
						success: (uploadFileRes) => { 
							let backstr = uploadFileRes.data;
							console.log(backstr)
							// 本地存储用户信息修改
							uni.setStorage({
								key: 'user',
								data: {'id': this.uid, 'name': this.myname, 'imgUrl': backstr, 'token': this.token},
								success: function () {
									console.log('本地存储用户数据成功');
								}
							});
							// 修改头像保存到数据库
							this.update(backstr, 'imgUrl', undefined)
						},
						complete() {
							uni.hideLoading();
						},
						fail(e) {
							console.log("this is errormes "+e.message)	
						}	
					});
				} else {
					uni.showModal({
						title: '提示',
						content: '没有选择图片',
						showCancel:false
					});					
				}			  
			},
			cancel() {
				console.log('canceled')
			},
			
			// 后端用户信息修改
			update(content, type, password) {
				// console.log("data: "+data + ' type: '+type+' psw: '+password)
				uni.request({
					url: base + '/user/update',
					data: {
						id: this.uid,
						data: content,
						type: type,
						oldPassword: password,
						newPassword: content,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						console.log(status)
						//访问后端成功
						if(status == 200) {
							console.log(type)
							if(type != 'birth' && type != 'sex' && type != 'imgUrl') {
								this.modifty();
							}
							this.user[type] = content;
							if(type == 'password') {
								// console.log(content + ' ' + type + ' ' + password)
								// // 清除缓存
								uni.removeStorage({
									key: 'user',
									success: function (res) {
										console.log('success');
									}
								});
								// 用户需要重新登录
								uni.navigateTo({
									url: '../signin/signin?alterPsw=' + this.myname
								})
							}
						} else if(status == 300) {
							// token过期，跳转登录页面
							uni.navigateTo({
								url: '../signin/signin?name=' + this.myname
							})
						} else if(status == 400) {
							// console.log("错误")
							// 原密码错误
							uni.showToast({
								title: '原密码错误',
								icon: 'none',
								duration: 1500
							});
						} else if(status == 450) {
							// 密码为空
							uni.showToast({
								title: '密码不能为空',
								icon: 'none',
								duration: 1500
							});
						} else if(status == 500) {
							uni.showToast({
								title: '服务器出错',
								icon: 'none',
								duration: 1500
							});
						} else if(status == 600) {
							uni.showToast({
								title: '手机号长度不能小于十一位',
								icon: 'none',
								duration: 1500
							});
						} else if(status == 700) {
							uni.showToast({
								title: '邮箱已被占用',
								icon: 'none',
								duration: 1500
							});
						}
					}
				})
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
			modifty: function(t, type, data, isPaw) {
				// console.log(type)
				// 获取修改项
				this.type = t;
				this.modiftyTitle = type;
				this.oldData = data
				this.data = data;
				if(isPaw) {
					this.isPaw = isPaw;
					// this.password = '00000000'
				} else {
					this.isPaw = false;
					this.password = undefined;
				}
				
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
			
			// 信息修改确认
			modiftyStbmit: function() {
				// 提交修改
				if(this.data.length > 0 && this.oldData != this.data) {
					// console.log('密码：'+this.password + ' data: ' + this.data+' type: '+this.type)
					if(this.type == 'markname') {
						this.updateFrinedName();
						this.markname = this.data
						this.modifty()
					} else if(this.type == 'email'){
						if(this.password == undefined) {
							uni.showToast({
								title: '密码不能为空',
								icon: 'none',
								duration: 1500
							});
						} else {
							// 判断邮箱格式
							let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
							if (reg.test(this.data)) {
								this.update(this.data, this.type, this.password);
							} else {
								uni.showToast({
									title: '邮箱格式错误',
									icon: 'none',
									duration: 1500
								});
							}
						}
					}  else {
						this.update(this.data, this.type, this.password);
						// 前端替换修改项
						// this.user[this.type] = this.data;
					}
				}
				// this.modifty();
			},
			
			// 好友昵称修改
			updateFrinedName() {
				if(this.data.length > 0 && this.oldData != this.data) {
					uni.request({
						url: base + '/user/alterNickname',
						data: {
							uid: this.uid,
							fid: this.id,
							name: this.data,
							token: this.token
						},
						method: 'POST',
						success: (data) => {
							let status = data.data.status;
							console.log(status)
							//访问后端成功
							if(status == 200) {
								// console.log("nskhshdhshhj")
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
			
			// 时间处理
			changeTime: function(date) {
				return myfun.detialTime(date);
			},
			
			// 退出登录
			logOut() {
				// // 清除缓存
				uni.removeStorage({
					key: 'user',
					success: function (res) {
						console.log('success');
					}
				});
				uni.navigateTo({
					url: '../signin/signin'
				})
			},
		
			// 删除好友
			deleteFriend() {
				uni.showModal({
					title: '提示',
					content: '确定删除该好友',
					success: (res) => {
						if (res.confirm) {
							console.log('用户点击确定');
							uni.request({
								url: base + '/friend/deleteFriend',
								data: {
									uid: this.uid,
									fid: this.id,
									token: this.token
								},
								method: 'POST',
								success: (data) => {
									let status = data.data.status;
									console.log(status)
									//访问后端成功
									if(status == 200) {
										// 删除成功，跳回首页
										uni.navigateTo({
											url: '../index/index',
										})
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
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
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
		padding-top: 70rpx;
		display: flex;
		flex-direction: column;
		.column {
			display: flex;
			flex-direction: column;
			padding-top: 12rpx;
			width: 100%;
			border-bottom: 1px solid $uni-border-color;
			.row {
				display: flex;
				flex-direction: row;
			}
			.title {
				flex: none;
				
				padding: 0 $uni-spacing-col-base;
				font-size: 40rpx;
				color: $uni-text-color;
				line-height: 112rpx;
			}
			.head {
				height: 148rpx;
				display: flex;
				align-items: center;
			}
			.user-head {
				flex: auto;
				
			}
			.user-img{
				margin-top: 22rpx;
				width: $uni-img-size-lg;
				height:$uni-img-size-lg;
				border-radius: $uni-border-radius-base;
			}

			.cont{
				flex: auto;
				font-size: $uni-font-size-lg;
				color:$uni-text-color-grey;
				line-height: 112rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			.more{
				flex: none;
				height: 112rpx;
				display: flex;
				align-items: center;
				margin: 0 32rpx;
				image {
					width: 52rpx;
					height: 52rpx;
				}
			}
		}
		.exit {
			margin-top: 160rpx;
			text-align: center;
			font-size: $uni-font-size-lg;
			color: $uni-color-warning;
			line-height:88rpx;
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
		z-index: 102;
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



</style>
