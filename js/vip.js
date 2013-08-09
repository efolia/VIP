// javascript wrapper for VIP

var vip = function() {
		var player,
		videoPlayerModule,
		experienceModule,
		cuePointsModule,
		currentVideo,
		APIModules,
		currentC,
		nextC,
		currentP,
		currentV;
	return {
		onTemplateLoad : function (id) {
			APIModules = brightcove.api.modules.APIModules;
			player = brightcove.api.getExperience(id);
			experienceModule = player.getModule(APIModules.EXPERIENCE);
			cuePointsModule = player.getModule(APIModules.CUE_POINTS);
			videoPlayerModule = player.getModule(APIModules.VIDEO_PLAYER);
		},

		onTemplateReady : function (event) {
			videoPlayerModule.getCurrentVideo(vip.onGetCurrentVideoResult);
		},

		onGetCurrentVideoResult : function (video) {
			currentVideo = video;
			console.log(currentVideo);
			currentC = '';
			nextC = '';
			currentP = '';
			currentV = '';
		}

	};
}();

// var vplayer = function() {
//		return {
//		}
// }();