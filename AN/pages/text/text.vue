<template>
	<view>
		<view class="upload" @tap="upload">
			上传文件
		</view>
		<image v-for="(item,index) in img" :src="item" :key="item"></image>
		
		
		
		
		
	</view>
</template>

<script>
	import base from '../../config/config.js'
	import myfun from '../../commons/js/myfun.js'
	
	export default {
		data() {
			return {
				img: []
			}
		},
		methods: {
			upload() {
				// 当前日期文件夹
				let fileUrl = myfun.fileName(new Date())
				uni.chooseImage({
					count: 9, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'cemare'], //从相册选择
					success: (chooseImageRes) => {
						const tempFilePaths = chooseImageRes.tempFilePaths;
						
						for(let i = 0; i < tempFilePaths.length; i++) {
							const uploadTask = uni.uploadFile({
								url: base + '/files/upload', 
								filePath: tempFilePaths[i],
								name: 'file',
								formData: {
									url: fileUrl
								},
								success: (uploadFileRes) => {
									// console.log(JSON.parse(uploadFileRes.data)[0]);
									// console.log(uploadFileRes)
									let path = base +  uploadFileRes.data;
									// let path = "http://192.168.3.15:3000/" +  JSON.parse(uploadFileRes.data)[0].path;
									// let path = "http://192.168.3.15:3000/" + fileUrl + '/' +  JSON.parse(uploadFileRes.data)[0].filename;
									// console.log(path);
									this.img.push(path)
								}
							});
											
							uploadTask.onProgressUpdate((res) => {
								console.log('上传进度' + res.progress);
								console.log('已经上传的数据长度' + res.totalBytesSent);
								console.log('预期需要上传的数据总长度' + res.totalBytesExpectedToSend);
											
								// 测试条件，取消上传任务。
								// if (res.progress > 50) {
								// 	uploadTask.abort();
								// }
							});
						}
						
					}
				});
			},
			
			serchUser() {
				uni.request({
					url: base + '/search/user',
					data: {
						data: '小',
					},
					method: 'POST',
					success: (data) => {
						// console.log(data);
						let status = data.data.status;
						// 访问后端成功
						if(status == 200) {
							// 登录成功
							let res = data.data.result;
							console.log(res)
						} else if(status == 500) {
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
	.upload {
		padding-top: 40rpx;
		text-align: center;
	}
</style>
