// vip: very interesting player

var vip = (function() {
	var player,
			video,
			experience,
			c,
			currentVideo,
			currentCue,
			currentCueIndex,
			APIModules,
			contentEvent,
			cEvent,
			mediaEvent,
			data;

	return {

	onTemplateLoad : function (id) {
			currentCueIndex = -1;
			vip.loadData();

			APIModules = brightcove.api.modules.APIModules;
			player = brightcove.api.getExperience(id);
			experience = player.getModule(APIModules.EXPERIENCE);
			c = player.getModule(APIModules.CUE_POINTS);
			video = player.getModule(APIModules.VIDEO_PLAYER);
			cEvent = brightcove.api.events.CuePointEvent;
			mediaEvent = brightcove.api.events.MediaEvent;
	},

	onTemplateReady : function (event) {
			video.getCurrentVideo(vip.onGetCurrentVideoResult);
			video.addEventListener(mediaEvent.PROGRESS, vip.onProgress);
			video.addEventListener(cEvent.CUE, vip.onCuePoint);
			video.addEventListener(mediaEvent.SEEK_NOTIFY, vip.onSeek);
			video.addEventListener(mediaEvent.BEGIN, vip.onBegin);
			video.addEventListener(mediaEvent.STOP, vip.onStop);
			video.addEventListener(mediaEvent.PLAY, vip.onPlay);
			video.getIsPlaying(vip.onInit);
			skin.apply('default');
	},

	// not used
	onProgress : function (event) {
			//vip.display(event.position, 'w');
	},

	onGetCurrentVideoResult : function (video) {
			currentVideo = video;
			if(currentVideo) {
				c.getCuePoints(currentVideo.id, vip.cHandler);
			}
	},

	onCuePoint : function (point) {
		if(!$('#control-seektoggle').prop('checked'))
			return;

			currentCue = point;
			var name = currentCue.cuePoint.name;
			var index = vip.indexOfByKeyValue(data.cuepoints, 'name', name);
			console.log(point, index);
			vip.displayElement(index);
			// var element = data.elements[vip.indexOfByKeyValue(data.elements, 'name', name)];
			// switch (element.type) {
			// 	default:
			// 	case 'slide':
			// 		vip.displaySlide(element);
			// 		break;
			// }
			// console.log(cuepoint, element.name);
	},

	onInit : function(isPlaying) {
			if (!isPlaying) {
				 $( "#controls").hide();
				console.log('slide init');
				var element = data.elements[vip.indexOfByKeyValue(data.elements, 'name', '@init')];
				if (typeof element != 'undefined') {
						vip.display(element.content, element.tab, element.mode, element.transition);
						// vip.displaySlide(element);
				}
			}
	},

	onSeek : function(seek) {
			console.log('seeking');
			vip.getCurrentC(seek.position);
	},

	onBegin : function (begin) {
			$("#control-playtoggle").html('<span class="glyphicon glyphicon-pause"></span>');
			// console.log(begin);
	},

	onStop : function(stop) {
			$("#control-playtoggle").html('<span class="glyphicon glyphicon-play"></span>');
	},

	onPlay : function(play) {
			$( "#controls").show();
			$("#control-playtoggle").html('<span class="glyphicon glyphicon-pause"></span>');
	},

	browseSlides : function(slide) {
		if(slide == 'prev') {
			if(currentCueIndex > 0)
				currentCueIndex--;
			else
				return;
		}
		else { //next
			if(currentCueIndex < data.cuepoints.length - 1)
				currentCueIndex++;
			else
				return;
		}

		vip.displayElement(currentCueIndex);

		if($('#control-seektoggle').prop('checked')) {
			video.seek(data.cuepoints[currentCueIndex].time);
			video.play();

		}
	},

	cHandler : function (cuePoints) {
      //clear all pre-set cue points and replace with the custom set
      c.clearCodeCuePoints(currentVideo.id);
      c.clearAdCuePoints(currentVideo.id);
			vip.addDefaultCuePoints();
			vip.injectElementOrder();
			c.addCuePoints(currentVideo.id, data.cuepoints);
	},

	displayElement : function (index) {
		currentCueIndex = index;
		var element = data.elements[vip.indexOfByKeyValue(data.elements, 'name', data.cuepoints[index].name)];
		console.log('display '+ index + ': ' + element.name);
		vip.display(element.content, element.tab, element.mode, element.transition);
	},

	// displaySlide : function(element) {
	// 	vip.display(element.content, element.tab, element.mode, element.transition);
	// },

	display : function(copy, tab, mode, transition) {
			mode = mode || 'w';
			tab = tab || 'slide';
			transition = transition || 'fade';
			id = '#'+tab+'-content';
			var output = document.getElementById(tab+'-content');
			if (mode == 'w') {
				// replace with an actual jquery transition effect from jquery-ui
				$(id).fadeOut('fast', function() {
						$(id).html(copy);
						$(id).fadeIn('fast');
				});
			} else {
				$(id).append('<br />' + copy);
				$(id).fadeIn('fast');
			}
	},

	getCurrentC : function(pos) {
			var cuepoints = vip.extractArrayKey(data.cuepoints, 'time');
			var closestC = vip.getClosest(cuepoints, pos);
			var index = vip.indexOfByKeyValue(data.cuepoints, 'time', closestC);

			if(index !== currentCueIndex)
				vip.displayElement(index);

			// var index = vip.indexOfByKeyValue(data.cuepoints, 'time', closestC);
			// var element = data.elements[vip.indexOfByKeyValue(data.elements, 'name', data.cuepoints[index].name )];
			// vip.display(element.content, element.type);
			console.log(pos, element.name, currentCue.cuePoint.name);
	},

	loadData : function (source) {
			source = source || "data/data.json"; // dummy data source for initial implementation only
			$.getJSON(source, function(d) {
				data = d;
			});
	},

	playToggle : function () {
			video.getIsPlaying (function(status) {
			switch (status) {
				case false:
						video.play();
						break;
				case true:
						video.pause();
						break;
			}
	});},

	tabsToggle : function () {
	 $( "#vip-tabs").toggle('slow');
	},
	videoToggle : function () {
	 $( "#vip-video").toggle('slow');
	},

	playReset : function () {
			var autostart = video.canPlayWithoutInteraction();
			video.seek(0);
			if (autostart) {
				video.pause();
			} else {
				video.play();
			}
	},

	addDefaultCuePoints : function () {
		console.log('adding default');
			var begin = 0;
			var end = Math.floor(currentVideo.length/1000); // expressed in seconds
			if (currentVideo.length/1000 == end) end = end-1; // cue points not triggered if same as end of video
			if (typeof data.cuepoints[vip.indexOfByKeyValue(data.cuepoints, 'time', begin)] === "undefined") {
				data.cuepoints.push({"name":"@begin","metadata":"", "time":0 });
			}
			if (typeof data.cuepoints[vip.indexOfByKeyValue(data.cuepoints, 'time', end)] === "undefined") {
				data.cuepoints.push({"name":"@end","metadata":"", "time": Math.floor(end) });
			}
	},

	/* http://inderpreetsingh.com/2010/10/14/javascriptjson-find-index-in-an-array-of-objects/ */
	indexOfByKeyValue : function (obj, key, value) {
			for (var i = 0; i < obj.length; i++) {
				if (obj[i][key] == value) {
					return i;
				}
			}
			return null;
	},

	extractArrayKey : function (obj, key) {
			var output = [];
			for (var i=0; i < obj.length; i++) output.push(obj[i][key]);
			return(output.sort(function(a,b){return a - b;}));
	},

	// http://stackoverflow.com/questions/4431259/formal-way-of-getting-closest-values-in-array-in-javascript-given-a-value-and-a
	getClosest :  function(a, x) {
			var lo = -1, hi = a.length;
			while (hi - lo > 1) {
					var mid = Math.round((lo + hi)/2);
					if (a[mid] <= x) {
							lo = mid;
					} else {
							hi = mid;
					}
			}
			if (a[lo] == x) hi = lo;
			//return [a[lo], a[hi]];
			return a[lo];
	},
	
	isPlaying : function(status) {
			video.getIsPlaying (function(status) {
				 return status;
			});
	},

	// leftovers...
	injectElementOrder : function() {
			console.log('sorting');
			data.cuepoints.sort(vip.compare('time'));
	},

	compare : function (prop) {
		return function(a, b) {
			if (a[prop] < b[prop])
					return -1;
			if (a[prop] > b[prop])
				return 1;
			return 0;
		};
	}

};
}());

var skin = (function() {
	 
	 var data
	 
	 return {

	 apply : function (source) {
			console.log('applying skin');
			source = source || "default"; // dummy data source for initial implementation only
			$.getJSON("data/skins/"+source+".json", function(d) {
				skin.inject(d);
			});
	 },
	 
	 /** http://css-tricks.com/snippets/javascript/inject-new-css-rules/ **/
	 inject : function (d) {
			$.each(d.rules, function(key, value) {
				 var div = document.createElement('div');
				 div.innerHTML = '&shy;<style>' + value.rule + '</style>';
				 document.body.appendChild(div.childNodes[1]);
			});
	 }

};
}());

