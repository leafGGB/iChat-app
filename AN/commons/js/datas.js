export default{
	friends: function() {
		let friendar = [
			{
				id: 1,
				imgUrl: 'R-C.png',
				tip: 5221,
				name: 'wc有蚊子',
				email: '22133558@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 2,
				imgUrl: 'R-C.png',
				tip: 2,
				name: '山山而川',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 3,
				imgUrl: 'R-C.png',
				tip: 0,
				name: '出门其东',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 4,
				imgUrl: 'R-C.png',
				tip: 0,
				name: 'GGB',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 5,
				imgUrl: 'R-C.png',
				tip: 15,
				name: 'wc',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 6,
				imgUrl: 'R-C.png',
				tip: 1,
				name: '额得到的测额',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 7,
				imgUrl: 'R-C.png',
				tip: 3,
				name: '哈哈哈',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 8,
				imgUrl: 'R-C.png',
				tip: 15,
				name: '嘿嘿嘿',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 9,
				imgUrl: 'R-C.png',
				tip: 15,
				name: '嘻嘻嘻',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 10,
				imgUrl: 'R-C.png',
				tip: 15,
				name: '嘤嘤嘤',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 11,
				imgUrl: 'R-C.png',
				tip: 15,
				name: '哟哟哟',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			},
			{
				id: 12,
				imgUrl: 'R-C.png',
				tip: 15,
				name: 'TiGa',
				email: 'qwrrwrqw@123.com',
				time: new Date(),
				message: '醉后不知天在水，满船清梦压星河。',
			}
		];
		return friendar;
	},
	
	// 好友关系
	isFriend: function() {
		let isfriend = [
			{
				userId: 1,
				friend: 2,
			},
			{
				userId: 1,
				friend: 3,
			},
			{
				userId: 1,
				friend: 5,
			},
			{
				userId: 1,
				friend: 8,
			}
		];
		return isfriend;
	},
	
	// 聊天信息
	message: function() {
		let msgs = [
			{
				id: 'b',      //用户id
				imgUrl: 'dog.png',
				message: {
					name:'天安门城楼售票处222',
					address: '东长安街天安门城楼内哈哈哈哈哈',
					latitude: '39.909473',
					longitude: '116.39730899999999',
				},                     // 内容
				types: 3,              // 内容类型
				time: new Date(),
				tip: 20,
			},
			{
				id: 'a',      //用户id
				imgUrl: 'cat.png',
				message: {
					name:'天安门城楼售票处',
					address: '东长安街天安门城楼内我的我的带我飞额纷纷额发份额飞飞飞非法得到',
					latitude: '39.909473',
					longitude: '116.39730899999999',
				},                     // 内容
				types: 3,              // 内容类型
				time: new Date(),
				tip: 19,
			},
			{
				id: 'a',                 // 用户id
				imgUrl: 'cat.png',
				message: {
					voice: 'a',
					time: 60,
				},
				types: 2,                // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date(),   // 发送时间
				tip: 18,
			},
			{
				id: 'b',                 // 用户id
				imgUrl: 'dog.png',
				message: {
					voice: 'b',
					time: 20,
				},
				types: 2,                // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date(),   // 发送时间
				tip: 19,
			},
			{
				id: 'b',                 // 用户id
				imgUrl: 'dog.png',
				message: '最是人间留不住，朱颜辞镜花辞树。',
				types: 0,                // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date(),   // 发送时间
				tip: 0,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '南风知我意，吹梦到西洲。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*16,   // 发送时间
				tip: 1,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '取次花丛懒回顾，半缘修道半缘君。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*36,   // 发送时间
				tip: 2,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '我有一瓢酒，可以慰风尘。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*57,   // 发送时间
				tip: 3,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: 'dog.png',
				types: 1,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*4,   // 发送时间
				tip: 4,
			},
			{
				id: 'b',                    // 用户id
				imgUrl: 'dog.png',
				message: 'cat.png',
				types: 1,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*8,   // 发送时间
				tip: 5,
			},
			{
				id: 'b',                    // 用户id
				imgUrl: 'dog.png',
				message: '吹灭读书灯，一身都是月。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*12,   // 发送时间
				tip: 6,
			},
			{
				id: 'b',                    // 用户id
				imgUrl: 'dog.png',
				message: '吹灭读书灯，一身都是月。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*22,   // 发送时间
				tip: 7,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '桃之夭夭，灼灼其华。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*29,   // 发送时间
				tip: 8,
			},
			{
				id: 'b',                    // 用户id
				imgUrl: 'dog.png',
				message: '人生自是有情痴，此恨不关风与月。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*55,   // 发送时间
				tip: 9,
			},
			{
				id: 'b',                    // 用户id
				imgUrl: 'dog.png',
				message: '似此星辰非昨夜，为谁风露立中宵。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*4,   // 发送时间
				tip: 10,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '月黑见渔灯，孤光一点萤。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*23,   // 发送时间
				tip: 11,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '微微风簇浪，散作满河星。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*51,   // 发送时间
				tip: 12,
			},
			{
				id: 'b',                    // 用户id
				imgUrl: 'dog.png',
				message: '醉后不知天在水，满船清梦压星河。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*60*10,   // 发送时间
				tip: 13,
			},
			{
				id: 'b',                    // 用户id
				imgUrl: 'dog.png',
				message: '人间何所以，观风与月舒。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*60*30,   // 发送时间
				tip: 14,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '入室许清风，对饮惟明月3。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*60*51,   // 发送时间
				tip: 15,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '入室许清风，对饮惟明月2。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*60*51,   // 发送时间
				tip: 16,
			},
			{
				id: 'a',                    // 用户id
				imgUrl: 'cat.png',
				message: '入室许清风，对饮惟明月1。',
				types: 0,                   // 内容类型（0：文字，1：图片链接，2：音频链接...)
				time: new Date()-1000*60*60*60*53,   // 发送时间
				tip: 17,
			},
		];
		return msgs;
	}
}