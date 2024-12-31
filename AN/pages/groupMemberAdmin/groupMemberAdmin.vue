<template>
	<view class="concent">
		<view class="top-bar">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
		</view>
		<view class="main">
			<view class="title">群成员</view>
			<view class="memberList">
				<view class="memberItem" v-for="(item, index) in groupMemberList" :key="index">
					<image :src="item.imgUrl" mode="aspectFill"></image>
					<view class="name">{{item.name}}</view>
					<view class="delete" @tap="deleteUser(item.uid)">删除</view>
				</view>
			</view>
		</view>
		
		<!-- 确认踢出群弹窗 -->
		<view class="deleteFriend" :class="isDelete ? 'active' : ''">
			<view class="text">是否移出群聊</view>
			<view class="ensure">
				<view class="btn" @tap="deleteUser('')">取消</view>
				<view class="btn" @tap="deleteFriend">确认</view>
			</view>
		</view>
	</view>
</template>

<script>
	import base from '../../config/config.js'
	
	export default {
		data() {
			return {
				gid: '',
				groupMemberList: [],   //群成员列表
				deleteUserId: '',      // 要踢出群聊的用户的id
				isDelete: false,                // 踢出群聊确认弹窗
			};
		},
		onLoad(e) {
			this.gid = e.gid;
			this.getMember()
		},
		methods: {
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
								this.groupMemberList.push(res[i].userDetail)
							};
							console.log(this.groupMemberList)
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
			
			// 取消删除好友
			deleteUser(uid) {
				this.deleteUserId = uid;
				this.isDelete = !this.isDelete
			},
			
			// 踢出群聊
			deleteFriend() {
				uni.request({
					url: base + '/group/deleteGroupMember',
					data: {
						uid: this.deleteUserId,
						gid: this.gid
					},
					method: 'POST',
					success: (data) => {
						this.refresh = false;
						let status = data.data.status;
						//访问后端成功
						if(status == 200) {
							uni.showToast({
								title: '已移出群聊',
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
				this.isDelete = !this.isDelete
			},
			
			// 返回上一个页面
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
	
	.main {
		width: 100%;
		height: 100vh;
		background: rgba(221, 221, 221, 0.2);
		// padding-top: 100rpx;
	}
	.title {
		box-sizing: border-box;
		position: fixed;
		// padding-top: 148rpx;
		// background-color: #fff;
		width: 100%;
		z-index: 100;
		padding: 120rpx 40rpx 20rpx;
		font-weight: 700;
		font-size: 48rpx;
	}
	.memberList {
		// margin: 0 ;
		padding: 250rpx 40rpx 60rpx;
		// background-color: #fff;
		
		.memberItem {
			display: flex;
			// justify-content: center;
			align-items: center;
			padding-bottom: 20rpx;
			// background-color: red;
			image {
				width: 104rpx;
				height: 104rpx;
				border-radius: 20rpx;
				padding-right: 20rpx;
			}
			.delete {
				margin-left: auto;
				padding-right: 40rpx;
				color: red;
			}
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
		// visibility: visible; 
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
		transform: scale(1);
		pointer-events: auto; /* 激活状态下启用按钮的交互性 */
		visibility: visible;
		transition: opacity 0.2s 0s ease-in-out,
		            transform 0.2s 0s ease-in-out;
	}
</style>
