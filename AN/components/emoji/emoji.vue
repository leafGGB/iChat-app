<template>
	<view class="container" :style="{height: height + 'rpx'}">
		<view class="emoji" v-for="(line,index) in emoji" :key="index">
			<view class="emoji-item" v-for="(item,index) in line" :key="index" @tap="clickEmoji(item)">
				{{item}}
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			height: {
				type: Number,
				default: 460
			},
		},
		data() {
			return {
				emoji:[
					['😀','😁','😂','🤣','😴','😄','😅','😆'],
					['😉','😊','😋','😎','😍','😘','😗','😙'],
					['😌','🙂','🤗','🤔','😐','😑','😶','🙄'],
					['😏','😣','😥','😮','🤐','😯','😪','😫'],
					['😌','😛','😜','😝','🤤','😒','😓','😔'],
					['😕','🙃','🤑','😲','🙁','😖','😤','😢'],
					['😭','😦','😨','😩','🤯','😬','😰','😱'],
					['😳','🤪','😵','😡','😠','🤬','😷','🤒'],
					['🤕','🤕','🤧','😇','🤡','🤥','🤫','🤭'],
					['🧐','💩','😈','💀','👻','🙈','🙉','🙊'],					
					['👶','🧒','👧','👧','🧑','👨','👩','🧓'],
					['👴','👵','👨‍','👩‍','💏','💑','👪','👅'],
					['👄','💋','💘','❤️','️💓','💔','💕','💖'],
					['💗','💙','💚','💛','🧡','💜','🖤','💝'],
					['💞','❣','💌','💬','➡️','⬆️','⬇️','⬅️'],
				]
			};
		},
		methods: {
			clickEmoji:function(item){
				this.$emit('emotion', item);
			}
		}
	}
</script>

<style lang="scss">
	.container{
		position:relative;
		overflow-y: auto;
		// height:460rpx;
		// padding-top: 16rpx;
		padding: 30rpx 10rpx 100rpx 10rpx;
		box-sizing: border-box;
		.emoji{
			display: flex;
			box-sizing: border-box;
			overflow: hidden;
			.emoji-item{
				width: 100%;
				height:100rpx;
				// padding:10rpx;
				flex:1;
				text-align: center;
				font-size: 40rpx;
			}
		}
	}
</style>
