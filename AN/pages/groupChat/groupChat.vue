<template>
	<view class="content">
		<view class="top-bar">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
			<view class="tap-bar-right">
				<view class="more-img">
					<image src="../../static/image/userHome/more.png"></image>
				</view>
			</view>
		</view>
		
		<view class="background">
			<image :src="gimg" class="bg-img" mode="aspectFill"></image>
		</view>
		
		<view class="main">
			<view class="main-inner">
				<view class="info">
					<view class="group-name">{{group.groupName}}</view>
					<view class="create-time">{{group.time}}</view>
				</view>
				<view class="notice">{{groupNotice}}</view>
			</view>
			<!-- 群成员列表 -->
			<view class="member">
				<view class="top">
					<view class="title">群成员</view>
					<view class="more" @tap="goAdmin" v-if="group.userID == uid">管理群成员</view>
					<image src="../../static/image/userHome/more.png" mode="aspectFit" class="more-img"  v-if="group.userID == uid"></image>
				</view>
				<view class="member-list">
					<view class="member-item" v-for="(item, index) in groupMember" :key="index">
						<view class="imgs">
							<!-- <image class="delete" src="../../static/image/groupChat/delete.png" @tap="cancelDelete" mode="aspectFill"></image> -->
							<image :src="item.imgUrl" mode="aspectFit" @tap="goUserPage(item.uid)" class="user-img"></image>
						</view>
						<view class="name">{{item.name}}</view>
					</view>
					<view class="member-item invite" @tap="goInvitePage">
						<image class="user-invite" src="../../static/image/groupChat/invite.png" mode=""></image>
						<view class="title">邀请</view>
					</view>
				</view>
				<view class="clear"></view>
			</view>
			
			<view class="infoList">
				<!-- 群名称 -->
				<view class="row" @tap="modifty('groupName', '群名称', group.groupName, false)">
					<view class="title">群名称</view>
					<view class="cont">{{group.groupName}}</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit" ></image>
					</view>
				</view>
				<!-- 群头像 -->
				<view class="row">
					<view class="title">群头像</view>
					<view class="cont">
						<view class="user-head">
							<image-cropper  :src="tempFilePath" @confirm="confirm" @cancel="cancel"></image-cropper>
							<image :src="gimg" @tap="upload" class="group-img" ></image>
						</view>
					</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit" ></image>
					</view>
				</view>
				<!-- 群公告 -->
				<view class="row" @tap="modifty('notice', '群公告', groupNotice, false)">
					<view class="title">群公告</view>
					<view class="cont">{{groupNotice}}</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit" ></image>
					</view>
				</view>
				<!-- 群内名 -->
				<view class="row" @tap="modifty('gSelfName', '群内名', 'GGB', false)">
					<view class="title">群内名</view>
					<view class="cont">GGB</view>
					<view class="more">
						<image src="../../static/image/userHome/more.png" mode="aspectFit" ></image>
					</view>
				</view>
				<!-- 群消息免打扰 -->
				<view class="row">
					<view class="title">消息免打扰</view>
					<view class="cont"></view>
					<view class="more">
						<switch class="switch" color="#FFCC33" :checked="swit" @change="switchChange"/>
					</view>
				</view>
				<view class="quitBtn"  @tap="deleteUser(0)" v-if="group.userID != uid">退出群聊</view>
				<view class="quitBtn"  @tap="deleteUser(1)" v-if="group.userID == uid">解散群聊</view>
			</view>
		</view>
		
		<!-- 弹出框 -->
		<view class="modify" :style="{bottom: -+widHeight+'px'}" :animation="animationData">
			<view class="modify-header">
				<view class="close" @tap="modifty('', '', '', false)">取消</view>
				<view class="title">{{modiftyTitle}}</view>
				<view class="define" @tap="modiftyStbmit">确定</view>
			</view>
			<view class="modfiy-main">
				<textarea v-model="data" class="modfiy-content"></textarea>
			</view>
		</view>
		
		<!-- 确认踢出群弹窗 -->
		<view class="deleteFriend" :class="isDelete ? 'active' : ''">
			<view class="text" v-if="group.userID != uid">是否退出群聊</view>
			<view class="text" v-if="group.userID == uid">是否解散群聊</view>
			<view class="ensure">
				<view class="btn" @tap="deleteUser">取消</view>
				<view class="btn" @tap="deleteFriend">确认</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import ImageCropper from "../../uni_modules/ling-imgcropper/components/ling-imgcropper/ling-imgcropper.vue"
	import base from '../../config/config.js'
	import myfun from '../../commons/js/myfun.js'
	import datas from '../../commons/js/datas.js'
	
	export default {
		data() {
			return {
				gid: '',
				gimg: '',
				// adminId: '',        // 群主id
				uid: '',            // 自己的id
				groupMember: [],
				group: [],          // 群的大部分信息
				// groupName: '',      // 群名称
				groupNotice: '',    // 群公告
				// registerTime: '',   // 注册时间 
				swit: false,       // 开关
				tempFilePath: '',
				modiftyTitle: '',
				data: '',                       // 修改个人信息
				oldData: '',                             // 修改前的数据
				type: '',                                // 修改项
				animationData: {},                       // 动画
				isModfiy: false,                         // 动画开关
				widHeight: '',                           // 页面高度
				isDelete: false,                // 踢出群聊确认弹窗
				deleteType: 0,                  // 确认是退出群聊还是解散群聊
			};
		},
		onLoad(e) {
			this.gid = e.gid;
			this.gimg = e.gimg;
			this.getStorages()
			this.getMember();
			this.getGroupDetail();
		},
		components: {ImageCropper},
		methods: {
			// 获取缓存数据
			getStorages() {
				try {
					const value = uni.getStorageSync('user');
					if (value) {
						this.uid = value.id;
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
			
			//获取群成员
			getMember: function(){
				uni.request({
					url: base + '/group/getGroupUserLst',
					data: {
						gid: this.gid,
						token: this.token
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let res = data.data.userList
							for(let i = 0; i < res.length; i++) {
								res[i].userDetail.imgUrl = base + res[i].userDetail.imgUrl
								this.groupMember.push(res[i].userDetail)
							};
							console.log(this.groupMember)
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
			
			// 获取该群的详细信息
			getGroupDetail()  {
				uni.request({
					url: base + '/group/getGroupInfo',
					data: {
						gid: this.gid,
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							let res = data.data.result
							this.group = res;
							this.groupName = res.groupName;
							this.registerTime = myfun.dateTime(res.time)
							this.adminId = res.userID;
							this.group.time = myfun.dateTime(res.time)
							this.groupNotice = res.notice
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
			
			

			// 消息免打扰
			switchChange: function (e) {
				console.log('switch1 发生 change 事件，携带值为', e.detail.value)
			},

			// 群头像裁剪
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
				this.gimg = e.detail.tempFilePath
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
							url: 'group',
							token: this.token
						},                         // 传递参数
						success: (uploadFileRes) => { 
							let backstr = uploadFileRes.data;
							console.log(backstr)
							// 修改头像保存到数据库
							this.update(backstr, 'imgUrl')
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

			// 后端群信息修改
			update(content, type) {
				// console.log("data: "+data + ' type: '+type+' psw: '+password)
				// console.log(type)
				uni.request({
					url: base + '/group/GroupUpdate',
					data: {
						gid: this.gid,
						type: type,
						data: content,
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						// console.log(status)
						//访问后端成功
						if(status == 200) {
							if(type == 'notice') {
								this.modifty();
								this.groupNotice = data.data.updatedGroup.notice;
							} else if(type == "groupName" || type == "gSelfName"){
								this.modifty();
								this.group[type] = content;
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

			// 修群信息弹窗
			modifty: function(t, type, data) {
				// 获取修改项
				this.type = t;
				this.modiftyTitle = type;
				this.oldData = data
				this.data = data;
				
				this.isModfiy = !this.isModfiy;
				var animation = uni.createAnimation({
					duration: 300,
				    timingFunction: 'ease',
				})
				
				if(this.isModfiy) {
					animation.bottom(300).top('50%').step();
				} else {
					animation.bottom(-this.isModfiy).top(1100).step();
				}
				this.animationData = animation.export();
			},
			
			// 信息修改确认
			modiftyStbmit: function() {
				// 提交修改
				// console.log(this.data)
				if(this.data.length > 0 && this.oldData != this.data) {
					// console.log('密码：'+this.password + ' data: ' + this.data+' type: '+this.type)
						this.update(this.data, this.type);
						// 前端替换修改项
						// this.user[this.type] = this.data;
				}
				// this.modifty();
			},

			// 取消退出群聊
			deleteUser(type) {
				this.deleteType = type;
				this.isDelete = !this.isDelete
			},
			
			// 确认退出/解散群聊
			deleteFriend() {
				let Url;
				let title;
				if(this.deleteType == 0) {
					Url = base + '/group/deleteGroupMember';
					title = '已退出群聊';
				} else {
					Url = base + '/group/deleteGroup';
					title = '已解散群聊';
				}
				uni.request({
					url: Url,
					data: {
						uid: this.uid,
						gid: this.gid
					},
					method: 'POST',
					success: (data) => {
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							this.goIndexPage()
							setTimeout(() => {
								uni.showToast({
									title: title,
									icon: 'none',
									duration: 1500
								});
							}, 100)
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
				this.isDelete = !this.isDelete
			},

			// 进入用户主页
			goUserPage(id) {
				uni.navigateTo({
					url: '../userHome/userHome?id=' + id,
				})
			},
			
			// 回到首页
			goIndexPage() {
				uni.navigateTo({
					url: '../index/index',
				})
			},
			
			// 跳转到好友邀请页面
			goInvitePage() {
				uni.navigateTo({
					url: '../invitePage/invitePage?uid=' + this.uid + '&gid=' + this.gid,
				})
			},
			
			// 群成员管理页面
			goAdmin() {
				uni.navigateTo({
					url: '../groupMemberAdmin/groupMemberAdmin?gid=' + this.gid,
				})
			},

			// 返回上一个页面
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
		border-bottom: 1px solid $uni-border-color;
		
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
		
		.more-img {
			padding-top: 10rpx;
			padding-right: $uni-spacing-col-base;
			image {
				width: 52rpx;
				height: 52rpx;
			}
		}
	}
	
	.clear {
		clear: both;
	}
	
	.background {
		width: 100%;
		height: 100%;
		background-color: #fff;
		position: fixed;
		top: 0;
		left: 0;
		z-index: -1;
		.bg-img {
			width: 100%;
			height: 750rpx;
		}
	}

.main{
	padding-top: 360rpx;
	.main-inner {
		width: 100%;
		min-height: 300rpx;
		// background-color:#fff;
		background-color: #ffffff;
		// background-image:linear-gradient(0deg,#fff1eb 0%, #ace0f9 100%);
		border-radius: 40rpx 40rpx 0 0 ;
	}
	.info{
		padding:$uni-spacing-row-base $uni-spacing-col-base 0;
		padding-bottom: 20rpx;
		box-sizing: border-box;
		border-bottom: 1px solid #eee;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.group-name {
			// float: left;
			font-size: 48rpx;
			font-weight: 600;
			color: #272832;
			line-height: 66rpx;
		}
		.create-time{
			// float: right;
			font-size: 28rpx;
			color: rgba( 39, 40, 50, 0.5);
			line-height: 66rpx;
		}
	}
	.notice {
		padding: 20rpx $uni-spacing-col-base 40rpx;
		font-size: 30rpx;
		color: #272832;
		line-height: 40rpx;
		clear: both;
		display: -webkit-box;
		-webkit-box-orient: -vertical;
		-webkit-line-clamp:·2;
		overflow: hidden;
	}
	
	.member {
		border-bottom: 1px solid #eee;
		background-color: #ffffff;
		.top {
			padding: $uni-spacing-row-base $uni-spacing-col-base 0;
			box-sizing: border-box;
			height: 100rpx;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			.title {
				flex:1;
				font-size: 36rpx;
				font-weight: 600;
				color: #272832;
			}
			.more {
				float:right;
				padding-right: 20rpx;
				font-size: 32rpx;
				font-weight: 400;
				color: rgba( 39,40, 50, 0.6);
			}
			.more-img {
				width: 42rpx;
				height: 42rpx;
			}
		}
		.member-list {
			width: 100%;
			padding: 20rpx 16rpx;
			box-sizing: border-box;
		}
		.member-item {
			padding-bottom:32rpx;
			width: 20%;
			float: left;
			text-align: center;
			.imgs {
				display: inline-block;
				position: relative;width: 104rpx;
				height:104rpx;
				border-radius: 20rpx;
				background-color: $uni-color-primary;
			}
			.user-img {
				width: 104rpx;
				height: 104rpx;
				border-radius: 20rpx;
			}
			.delete {
				width: 40rpx;height: 40rpx;
				position: absolute;
				top: -16rpx;
				right: -16rpx;
				z-index:1001;
			}
			.name {
				padding: 0 8rpx;
				font-size: 28rpx;
				color: #272832;
				line-height: 40rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}
			.user-invite {
				width: 104rpx;
				height: 104rpx;
				padding: 32rpx;
				box-sizing: border-box;
				border-radius: 20rpx;
				// background-color: $uni-color-primary;
				background-image: linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%), url(../../static/image/group/group.png);
			}
		}
	}
	
	.infoList {
		display: flex;
		flex-direction: column;
		padding-top: 22rpx;
		width: 100%;
		border-bottom: 1px solid #eee;
		.row {
			display: flex;
			flex-direction: row;
		}
		.title {
			flex: none;
			padding: 0 $uni-spacing-col-base;
			font-size: 36rpx;
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
			// display: flex;
			// justify-content: center;
			// align-items: center;
			flex: auto;
			font-size: $uni-font-size-lg;
			color: $uni-text-color-grey;
			line-height: 112rpx;
			height: 112rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.group-img{
			width: 80rpx;
			height: 80rpx;
			border-radius: 20rpx;
			margin-top: 16rpx;
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
	
	.quitBtn {
		margin-top: 80rpx;
		text-align: center;
		font-size: $uni-font-size-lg;
		color: $uni-color-warning;
		line-height: 88rpx;
		padding-bottom: env(safe-area-inset-bottom);
		margin-bottom: 20rpx;
	}
}

.deleteFriend {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 100rpx;
		margin: auto;
		width: 420rpx;
		height: 160rpx;
		background-color: #bbb;
		z-index: 1002;
		border-radius: 12rpx;
		opacity: 0;
		pointer-events: none; /* 初始状态下禁用按钮的交互性 */
		transform: scale(1.2);
		 transition: opacity 0.2s 0s ease-in-out,
		              transform 0.2s 0s ease-in-out;
	
		.text {
			text-align: center;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 36rpx;
		}
		.ensure {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 20rpx;
			border-top: 1rpx solid #eee;
			
			.btn  {
				// border-right: 1px solid blue;
				// padding-right: 126rpx;
				padding: 0rpx 40rpx;
			}
		}
	}
	.active {
		opacity: 1;
		pointer-events: auto; /* 激活状态下启用按钮的交互性 */
		transform: scale(1);
		transition: opacity 0.2s 0s ease-in-out,
		            transform 0.2s 0s ease-in-out;
	}

</style>
