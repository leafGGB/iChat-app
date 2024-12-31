<template>
	<view>
		<view class="submit">
			<view class="submit-chat">
				<!-- 语言 -->
				<view class="btn-img" @tap="records">
					<image :src="this.toc" mode=""></image>
				</view>
				<textarea auto-height="true" class="chat-send btn" v-show="!isRecoed" @input="inputs" v-model="msg" @focus="focus"></textarea>
				<view class="record btn" v-show="isRecoed" @touchstart="touchstart" @touchend="touchend" @touchmove="touchmove">按住说话</view>
				<!-- 表情按钮 -->
				<view class="btn-img" @tap="emoji">
					<image src="../../static/image/submit/face.png" mode=""></image>
				</view>
				<!-- 更多按钮 -->
				<view class="btn-img" @tap="moreFun" v-show="isFeat">
					<image src="../../static/image/submit/addition.png" mode=""></image>
				</view>
				<!-- 发送按钮 -->
				<view class="sendBtn btn" @tap="sendMsg" v-show="isSendBtn">
					发送
				</view>
			</view>
			<view class="emoji" v-show="isEmoji">
				<emoji @emotion="emotion" :height="460"></emoji>
				<!-- 删除按钮 -->
				<view class="deleteBtn" @tap="deleteMsg">
					<image src="../../static/image/submit/delete.png" mode=""></image>
				</view>
			</view>
			<!-- 更多功能模块详细内容 -->
			<view class="moreModule" v-show="isMoreModule">
				<view class="more-list" @tap="sendImage('album')">
					<view class="icon">
						<image src="../../static/image/submit/photo.png" mode=""></image>
					</view>
					<view class="more-list-title">图片</view>
				</view>
				<view class="more-list" @tap="sendImage('camera')">
					<view class="icon">
						<image src="../../static/image/submit/shoot.png" mode=""></image>
					</view>
					<view class="more-list-title">拍照</view>
				</view>
				<view class="more-list" @tap="goLivePage">
					<view class="icon">
						<image src="../../static/image/submit/video.png" mode=""></image>
					</view>
					<view class="more-list-title">视频</view>
				</view>
				<view class="more-list" @tap="location">
					<view class="icon">
						<image src="../../static/image/submit/location.png" mode=""></image>
					</view>
					<view class="more-list-title">定位</view>
				</view>
				<view class="more-list">
					<view class="icon">
						<image src="../../static/image/submit/file.png" mode=""></image>
					</view>
					<view class="more-list-title">文件</view>
				</view>
			</view>
		</view>
		<!-- 语音发送 -->
		<view class="voice-transcribe" v-show="isRecording">
			<view class="voice-extent">
				<view class="voice-time" :style="{width: vlength/0.6+'%'}">{{vlength}}"</view>
			</view>
			<view class="cancel-voice">上滑取消录音</view>
		</view>
	</view>
</template>

<script>
	import emoji from '../emoji/emoji.vue'
	
	// 录音
	const recorderManager = uni.getRecorderManager();
	
	export default {
		data() {
			return {
				isRecoed: false,
				isEmoji: false,
				msg: '',
				toc: '../../static/image/submit/voice.png',
				isFeat: true,					// 更多按钮
				isSendBtn: false,				// 发送信息按钮
				// sendBtnWidth: 0,
				isMoreModule: false,            // 更多功能模块显示与否
				timer: '',                      // 计时器
				vlength: 0,                     // 音频时长
				isRecording: false,             // 是否正在录制语音
				pageY: 0,                       // 点击录音时y轴位置
			};
		},
		components:{
			emoji,
		},
		methods: {
			// 文字/语音切换
			records: function() {
				// 关闭表情/更多功能模块
				this.isEmoji = false;
				this.isMoreModule = false;
				setTimeout(() => {
					this.getElementHeight();
				}, 10)
				if (this.isRecoed) {
					this.isRecoed = false;
					this.toc = '../../static/image/submit/voice.png'
				} else {
					this.isRecoed = true;
					this.toc = '../../static/image/submit/voicePlay2.png'
				}
			},
			
			// 获取模块高度
			getElementHeight: function() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.submit').boundingClientRect(data => {
					this.$emit('height', data.height);
				}).exec();
			},
			
			// 表情
			emoji: function() {
				this.isEmoji = !this.isEmoji;
				// 关闭更多功能模块
				this.isMoreModule = false;
				// 语音输入关闭
				this.isRecoed = false;
				this.toc = '../../static/image/submit/voice.png'
				setTimeout(() => {
					this.getElementHeight();
				}, 10)
			},
			
			// 更多功能按钮
			moreFun: function(){
				this.isMoreModule = !this.isMoreModule ;
				// 关闭表情模块
				this.isEmoji = false;
				// 语言输入关闭
				this.isRecoed = false;
				this.toc = '../../static/image/submit/voice.png'
				setTimeout(() => {
					this.getElementHeight();
				}, 10)
			},
			
			// 音频处理
			// 开始录音
			touchstart: function(e) {
				// 点击录音时y轴位置
				this.pageY = e.changedTouches[0].pageY;
				// console.log("kaishi");
				this.isRecording = true;
				let i = 1;
				this.timer = setInterval(() => {
					this.vlength = i;
					i++;
					console.log(i);
					if(i>60){
						//结束记时
						clearInterval(this.timer);
						this.touchend();
					}
				},1000);
				// 开始录音
				recorderManager.start();
			},
			// 结束录音
			touchend: function() {
				// console.log("jiesu");
				clearInterval(this.timer);
				// 结束录音
				recorderManager.stop();
				recorderManager.onStop((res) => {
					let data = {
						voice: res.tempFilePath,
						time: this.vlength,
					}
					if (this.isRecording) {
						this.send(data, 2);
					}
					// 时长归零
					this.vlength = 0;
					this.isRecording = false;
				});
			},
			
			// 删除录音
			touchmove: function(e) {
				if(this.pageY - e.changedTouches[0].pageY > 100) {
					// console.log("delete");
					// 关闭录音控件
					this.isRecording = false;
				}
			},
			
			//文字发送
			inputs: function(e) {
				var chatm = e.detail.value;
				if (chatm.length) {
					// this.sendBtnWidth = 140;
					this.isFeat=false;
					this.isSendBtn=true;
				} else {
					this.isFeat=true;
					this.isSendBtn=false;
				}
			},
			
			// 发送按钮
			sendMsg: function() {
				// this.$emit('inputs', this.msg);
				this.send(this.msg, 0);
				setTimeout(() => {
					// this.msg = '';
					this.isFeat = true;
					this.isSendBtn = false;
				}, 10);
			},
			
			// 表情发送
			emotion:function(item){
				this.msg += item;
				if(item.length){
					this.isFeat=false;
					this.isSendBtn=true;
				}else{
					this.isFeat=true;
					this.isSendBtn=false;
				}
			},
			
			// 删除按钮
			deleteMsg:function(){
				if(this.msg.length > 0){
					this.msg=this.msg.substring(0,this.msg.length-1)//从第0位开始，切割字符串-1的信息
				}
				if(this.msg.length===0){
					this.isSendBtn=false
					this.isFeat=true
				}
			},
			
			// 输入框聚焦的时候
			focus:function(){
				// 关闭其他功能项
				this.isEmoji = false;
				this.isMoreModule = false;
				setTimeout(() => {
					this.getElementHeight();
				}, 10)
			},
			
			// 发送
			send:function(msg,type){
				let data = {
					message: msg,
					types: type//type1为图片类型
				}
				this.$emit('inputs',data);
				setTimeout(() => {
					this.msg = ''; 
				},0)
			},
			
			// 发送图片
			sendImage: function(e){
				let count;
				if(e==='album'){
					count = 9
				}else{
					count = 1;
				}
				uni.chooseImage({
					count: count, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: [e], //从相册选择
					success: (res) => {
						// console.log(JSON.stringify(res.tempFilePaths));
						const filePaths = res.tempFilePaths;
						// console.log(filePaths, 'filepaths');
						for(let i = 0; i < filePaths.length; i++){
							this.send(filePaths[i], 1);
						}
					}
				});
			},
			
			// 定位
			location: function() {
				uni.chooseLocation({
					success: res => {
						let data = {
							name: res.name,
							address: res.address,
							latitude: res.latitude,
							longitude: res.longitude,	
						}
						// JSON 转为 js 字符串
						let stringData = JSON.stringify(data);
						this.send(stringData, 3);
						// console.log('位置名称：' + res.name);
						// console.log('详细地址：' + res.address);
						// console.log('纬度：' + res.latitude);
						// console.log('经度：' + res.longitude);
					}
				});
			},
			
			// 跳转视频通话页面
			goLivePage() {
				uni.navigateTo({
					url: '/pages/live/live'
				})
			}
		}
	}
</script>

<style lang="scss">
	.submit {
		background: rgba(244, 244, 244, 0.96);
		border-top: 1px solid $uni-border-color;
		width: 100%;
		position: fixed;
		bottom: 0;
		z-index: 1002;
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	.submit-chat {
		width: 100%;
		display: flex;
		align-items: flex-end;
		box-sizing: border-box;
		padding: 14rpx 14rpx;
		image {
			width: 66rpx;
			height: 66rpx;
			margin: 0 10rpx;
			flex: auto;
		}
		.btn {
			flex: auto;
			background-color:#fff;
			border-radius: 10rpx;
			padding: 20rpx;
			max-height: 160rpx;
			margin: 5rpx 10rpx;
		}
		.record{
			text-align: center;
			font-size: $uni-font-size-lg;
			color:$uni-text-color-grey;
		}
		.sendBtn{
			flex: auto;
			line-height: 28rpx;
			width: 140rpx;
			height: 28rpx;
			background-color: limegreen;
			color: white;
			margin: 8rpx 10rpx;
			text-align: center;
			// transition: width 2s;
		}
	}
	
	.emoji{
		width:100%;
		height:460rpx;
		background : rgba(236,237,238,1);
		box-shadow:0px -1rpx 0px 0px rgba(0,0,0,0.1);
		
		.deleteBtn{
			position:absolute;
			bottom:38rpx;
			right:16rpx;
			background-color: white;
			width: 116rpx;
			height:86rpx;
			line-height:86rpx;
			text-align:center;
			border-radius: 20rpx;
			box-shadow: 0px -1rpx 0px 0px rgba(0,0,0,0.1);
			image {
				width: 62rpx;
				height: 62rpx;
				padding-top: 12rpx;
			}
		}
	}
	
	.moreModule {
		width:100%;
		height:460rpx;
		background : rgba(236,237,238,1);
		padding: 20rpx;
		box-sizing: border-box;
		box-shadow:0px -1rpx 0px 0px rgba(0,0,0,0.1);
		bottom: env(safe-area-inset-bottom);
		
		.more-list {
			width: 25%;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			float: left;
			// padding: 0 20rpx;
			// text-align: center;
			.icon {
				width: 100rpx;
				height: 100rpx;
				border-radius:28rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				background : rgba( 255,255,255,1);
				margin: 20rpx;
				image{
					width: 65rpx;
					height: 65rpx;
				}
			}
			.more-list-title {
				font-size: 28rpx;
				color: gray;
				line-height: 34rpx;
			}
		}
	}
	
	.voice-transcribe {
		height:100%;
		width:100%;
		background-color: rgba(0,0,0,0.3);
		position: fixed;
		top: 0;
		bottom: 0;
		z-index: 1001;
		.voice-extent {
			height: 84rpx;
			width: 600rpx;
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;
			background-color: rgba(255,255,255,0.4);
			border-radius: 42rpx;
			text-align: center;
			
			.voice-time {
				display: inline-block;
				min-width: 120rpx;
				line-height: 84rpx;
				background-color: $uni-color-primary;
				border-radius: 42rpx;
			}
		}
		.cancel-voice {
			position: absolute;
			bottom: 150rpx;
			margin-bottom: env(safe-area-inset-bottom);
			width: 100%;
			text-align: center;
			color: #fff;
			font-size: $uni-font-size-lg;
		}
	}


</style>
