<template>
	<view class="concent">
		<view class="top-bar" :class="{ 'image-cropper-visible': isImageCropperVisible }">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
			<view class="top-bar-center">
				<view class="title">创建群聊</view>
			</view>
			<view class="top-bar-right">
				<view class="pice"></view>
			</view>
		</view>
		<view class="main">
			<view class="top">
				
				<!-- 群头像 -->
				<view class="group-img">
					<image-cropper  :src="tempFilePath" @confirm="confirm" @cancel="cancel"></image-cropper>
					<image :src="cropFilePath" class="img" @tap="upload"></image>
					<image src="../../static/image/group/amend.png" class="amend" ></image>
				</view>
				<!-- 群名字 -->
				<view class="group-name">
					<input class="group-name-text" type="text" placeholder="群聊名称" placeholder-style="color:#aaa;" v-model="groupName"/>
				</view>
				<view class="title">用户</view>
			</view>
			
			<!--选择用户-->
			<view class="friends">
				<view class="user" v-for="(item, index) in friends" :key="index" @tap="selectFriend(index)">
					<view class="selected" :class="item.select ? 'isselected' : ''">
						<image class="seleced-img" src="../../static/image/sign/ok.png" v-show="item.select"></image>
					</view>
					<image class="user-img" :src="item.imgUrl"></image>
					<view class="name">{{item.name}}</view>
				</view>
			</view>

			<view class="bottom-bar">
				<view class="add-btn btn1" :class="selectNumber > 0 && groupName.length > 0 ? 'none-select' : ''" @tap="createGropSubmit">创建群聊({{selectNumber}})</view>
			</view>
		</view>
	</view>
</template>

<script>
	import ImageCropper from "../../uni_modules/ling-imgcropper/components/ling-imgcropper/ling-imgcropper.vue"
	import base from '../../config/config.js'
	
	export default {
		data() {
			return {
				uid: '',
				token: '',
				gImgUrl: '/group/group.png',        // 头像最终地址
				friends: [],                      // 好友数组
				isImageCropperVisible: false,
				tempFilePath: '',                 // 头像临时地址
				cropFilePath:'../../static/image/group/group.png',
				headimg: '',
				groupName: '',         // 群聊名称
				// selectNumber: 0,    // 选择的好友数量
				user: [],              // 已经选择的好友Id数组
			};
		},
		components: {ImageCropper},
		onLoad() {
			this.getStorages();
			this.getFriendsList();
			// console.log(this.friends)
			// this.getSelectNumber();
		},
		computed: {
		    // 使用计算属性实时计算选中用户的数量
		    selectNumber() {
		      return this.friends.filter(friends => friends.select).length;
			  // let selectNumber = this.user.filter(user => user.select).length;
			  // return selectNumber;
		    }
		},
		methods: {
			// 获取缓存数据
			getStorages() {
				try {
					const value = uni.getStorageSync('user');
					if (value) {
						this.uid = value.id;
						this.token = value.token;
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
			
			// 图片裁剪
			upload() {	
			    uni.chooseImage({
			        count: 1, //默认9
			        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			        sourceType: ['album', 'camera'], //从相册选择
			        success: (res) => {
			            this.tempFilePath = res.tempFilePaths[0];
						this.isImageCropperVisible = true; // ImageCropper 可见
			        }
			      });
			},
			confirm(e) {
				this.tempFilePath = ''
				this.cropFilePath = e.detail.tempFilePath
			  	this.headimg = e.detail.tempFilePath;
				this.isImageCropperVisible = false; // ImageCropper 隐藏
				// console.log(e.detail.tempFilePath)
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
							url: 'group',
							name: this.uid + new Date().getTime(),
							token: this.token
						},                         // 传递参数
						success: (uploadFileRes) => { 
							let backstr = uploadFileRes.data;
							console.log(backstr)
							// 获取群头像地址
							this.gImgUrl = backstr;
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
			
			// 获取好友
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
									res[i].select = false;
									res[i].imgUrl = base + res[i].imgUrl;
									if(res[i].markname) {
										res[i].name = res[i].markname;
									}
									this.friends.push(res[i]);
								}
							} else {
								// 没有好友
								// this.isSleep = true;
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
			
			// 动态选择好友
			selectFriend(e) {
				if(this.friends[e].select) {
					this.friends[e].select = !this.friends[e].select;
					// console.log(this.selectNumber)
					// this.selectNumber--;
				} else {
					this.friends[e].select = !this.friends[e].select;
					// console.log(this.selectNumber)
					// this.selectNumber++;
				}
			},
			
			// 创建群提交
			createGropSubmit() {
				// 符合条件才能提交
				if (this.selectNumber > 0 && this.groupName.length > 0) {
					for(let i = 0; i < this.friends.length; i++) {
						if (this.friends[i].select) {
							this.user.push(this.friends[i].id)
						}
					}
					// console.log(this.groupName)
					// console.log(this.user)
					uni.request({
						url: base + '/group/createGroup',
						data: {
							uid: this.uid,
							token: this.token,
							groupName: this.groupName,
							imgUrl: this.gImgUrl,
							user: this.user,
						},
						method: 'POST',
						success: (data) => {
							this.refresh = false;
							let status = data.data.status;
							// console.log(status)
							//访问后端成功
							if(status == 200) {
								// 创建成功跳转到首页
								uni.navigateTo({
									url: '../index/index'
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
				}
				this.user = [];
			},
			
			// 返回到登录页面
			goBack: function() {
				uni.navigateBack({
					delta: 1,
				})
			},
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
	
	.main {
		display: flex;
		flex-direction: column;
		.top{
			box-sizing: border-box;
			position: fixed;
			padding-top: 148rpx;
			background-color: #fff;
			width: 100%;
			z-index: 100;
		}
		

		.group-img {
			margin: 0 auto;
			width: 196rpx;
			height: 196rpx;
			// background: #FFE431 url(../../static/image/group/group.png) center / 100%;
			background-image: linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%), url(../../static/image/group/group.png);
			box-shadow: 0px 36rpx 40rpx 0px rgba(39, 40, 50, 0.1);
			border-radius: 40rpx;
			overflow: hidden;
			position: relative;
			.img {
				width: 199rpx;
				height: 196rpx;
			}
			.amend {
				position: absolute;
				z-index:10;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				margin: auto;
				width: 52rpx;
				height: 52rpx;
			}
		}
		.group-name{
			padding: 62rpx $uni-spacing-col-base 0;
		}
		.group-name-text{
			text-align: center;
			height: 92rpx;
			background: $uni-bg-color-grey;
			border-radius: 46rpx;
			font-size: 32rpx;
			color: $uni-text-color;
			// line-height: 44px;
		}
		.title{
			padding: $uni-spacing-row-base $uni-spacing-col-base 20rpx;
			font-size: 44rpx;
			font-weight: 600;
			color: $uni-text-color;
			line-height: 60rpx;
		}
		.friends {
			padding: 620rpx $uni-spacing-col-base 180rpx;
			.user {
				display:flex;
				flex-direction: row;
				align-items: center;
				height: 120rpx;
				.selected{
					flex: none;
					width: 48rpx;
					height: 48rpx;
					margin-right: 30rpx;
					// background: rgba(255, 228, 49, 0.5);
					background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
					border-radius: 12rpx;
					position: relative;
					.seleced-img {
						width: 52rpx;
						height: 52rpx;
						position: absolute;
						left: -1rpx;
					}
				}
				.isselected {
					// background: rgba(255, 228, 49, 1);
					background: #fff;
				}
				.user-img{
					width: 80rpx;
					height: 80rpx;
					flex: none;
					// background: rgba(255, 228, 49, 0.5);
					background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
					border-radius: $uni-border-radius-base;
				}
				.name {
					padding-left: 32rpx;
					font-size: 36rpx;
					color: $uni-text-color;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 1;
					overflow: hidden;
				}

			}
		}
	}
	
	.bottom-bar{
		background: rgba(250, 250, 250, 0.9);
		box-shadow: 0px 1px 0px 0px rgba(0, 0, 0, 0.25);
		.add-btn{
			// background: $uni-bg-color-grey;
			background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
			margin: 0 $uni-spacing-col-base;
		}
		.none-select {
			background: $uni-color-primary;
		}
	}
.image-cropper-visible {
		  display: none;
		}

</style>
