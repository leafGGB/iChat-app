<template>
	<view class="concent">
		<view class="top-bar">
			<view class="top-bar-left" @tap="goBack">
				<image class="back-img" src="../../static/image/common/back.png" mode=""></image>
			</view>
		</view>
		<view class="main">
			<view class="title">
				选择好友
			</view>
			<view class="friends">
				<view class="user" v-for="(item, index) in friends" :key="index">
					<view class="selected" :class="item.select ? 'isselected' : ''" v-show="!groupMember.includes(item.id)" @tap="selectFriend(index)">
						<image class="seleced-img" src="../../static/image/sign/ok.png" v-show="item.select"></image>
					</view>
					<view class="none-selected" v-show="groupMember.includes(item.id)">
						
					</view>
					<image class="user-img" :src="item.imgUrl"></image>
					<view class="name">{{item.name}}</view>
				</view>
			</view>
			
			<view class="bottom-bar">
				<view class="add-btn btn1" :class="selectNumber > 0 ? 'none-select' : ''" @tap="createGropSubmit">邀请好友({{selectNumber}})</view>
			</view>
		</view>
	</view>
</template>

<script>
	import base from '../../config/config.js'
	
	export default {
		data() {
			return {
				uid: '',
				gid: '',
				groupMember: [],   // 群成员列表
				friends: [],  // 好友列表
				user: [],              // 已经选择的好友Id数组
			};
		},
		onLoad(e) {
			this.uid = e.uid;
			this.gid = e.gid;
			this.getMember();
			this.getFriendsList();
		},
		computed: {
		    // 使用计算属性实时计算选中用户的数量
		    selectNumber() {
		      return this.friends.filter(friends => friends.select).length;
		    }
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
							let res = data.data.userList;
							for(let i = 0; i < res.length; i++) {
								// res[i].userDetail.imgUrl = base + res[i].userDetail.imgUrl
								this.groupMember.push(res[i].uid)
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
						// console.log(status)
						//访问后端成功
						if(status == 200) {
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
									// console.log(this.friends)
								}
							} else {
								// 没有好友
								// this.isSleep = true;
							}
							// 获取群列表
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
				} else {
					this.friends[e].select = !this.friends[e].select;
				}
			},
			
			// 创建邀请好友提交
			createGropSubmit() {
				// 符合条件才能提交
				if (this.selectNumber > 0) {
					for(let i = 0; i < this.friends.length; i++) {
						if (this.friends[i].select) {
							this.user.push(this.friends[i].id)
						}
					}
					console.log(this.user)
					uni.request({
						url: base + '/group/inviteFriend',
						data: {
							gid: this.gid,
							user: this.user,
							token: this.token,
						},
						method: 'POST',
						success: (data) => {
							this.refresh = false;
							let status = data.data.status;
							console.log(status)
							//访问后端成功
							if(status == 200) {
								// 创建成功跳转到首页
								// uni.navigateTo({
								// 	url: '../index/index'
								// })
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
	}
	
	.main {
		padding-top: 80rpx;
		.title {
			padding: $uni-spacing-row-base $uni-spacing-col-base 20rpx;
			font-size: 44rpx;
			font-weight: 600;
			color: $uni-text-color;
			line-height: 60rpx;
		}
		.friends {
			padding: 0rpx $uni-spacing-col-base 180rpx;
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
				.none-selected{
					flex: none;
					width: 48rpx;
					height: 48rpx;
					margin-right: 30rpx;
					// background: rgba(255, 228, 49, 0.5);
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
			background: $uni-bg-color-grey;
			margin: 0 $uni-spacing-col-base;
		}
		.none-select {
			// background: $uni-color-primary;
			background-image:linear-gradient(120deg,#a1c4fd 0%, #c2e9fb 100%);
		}
	}

</style>
