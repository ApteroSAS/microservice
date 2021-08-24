var eventTransmitter = function(e){
	switch( e.eventType ){
	case 'mousemove':
		if (typeof window.onmousemove == 'function'){
			window.onmousemove(e);
		}
	break;
	case 'keydown':
		if (typeof window.onkeydown == 'function'){
			window.onkeydown(e);
		}
	break;
	case 'keyup':
		if (typeof window.onkeyup == 'function'){
			window.onkeyup(e);
		}
	break;
	}
}

/* Flash editer */
var flashes = document.getElementsByTagName('object');
for ( var i = 0; i < flashes.length; i++ ){
	var params = flashes[i].querySelectorAll('param[name="wmode"]');
	if( params.length == 0 ){
		var param = document.createElement('param');
		param.setAttribute('name', 'wmode');
		param.setAttribute('value', 'opaque');
		if( flashes[i].firstChild ){
			flashes[i].insertBefore(param, flashes[i].firstChild);
		}else{
			flashes[i].appendChild(param);
		}
	}else{
		if( params[0].getAttribute('value') == 'window' ){
			params[0].setAttribute('value', 'opaque');
		}
	}
}
var embeds = document.getElementsByTagName('embed');
for ( var i = 0; i < embeds.length; i++ ){
	if( embeds[i].getAttribute('wmode') == 'window' || !embeds[i].getAttribute('wmode') ){
		embeds[i].setAttribute('wmode', 'opaque');
	}
}
/* Flash editer */

if( window === window.parent ){

var FS433_state = false;
var FS433_fullscreen = false;
var FS433_ready = false;
var FS433_interval = false;
var FS433_timer = false;
var FS433_laststate = 'hide';
var FS433_topOffset = 20;
var FS433_Favs_Obj = {};
var FS433_tabs = [];
var FS433_reg=/^(http|https|ftp|file){1}:\/\/(([0-9a-zA-Z\-]*\.)*)*(aero|biz|com|coop|edu|eu|gov|info|int|mil|museum|name|net|org|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)(\/){1}.*$/

var FS433_KEY_ACTIVATE = 190;
var FS433_KEY_ACTIVATE2 = 192;
var FS433_KEY_CTRL = 17;
var FS433_KEY_ALT = 18;
var FS433_KEY_ESC = 27;
var FS433_KEY_UP = 38;
var FS433_KEY_DOWN = 40;
var FS433_KEY_ENTER = 13;

/* Favorites */
FS433_renderFavorites = function(tree) {
	var treeList = {};
	treeList.level = function(tree){
		var ul = document.createElement('ul');
		for( var i = 0; i < tree.length; i++ ){
			if( tree[i].children ){
				var li = document.createElement('li');
				var span = document.createElement('span');
				var text = document.createTextNode( tree[i].title );
				li.className = 'category close';
				span.appendChild( text );
				span.className = 'toggler';
				(function(span, li){ 
					span.onclick = function(){
						var className = li.className;
						if( className == 'category close' ){
							li.className = 'category open';
						}else{
							li.className = 'category close';
						}
					}
				})(span, li)
				li.appendChild( span );
				li.appendChild( (function(tree){return treeList.level(tree);})(tree[i].children) );
			}else{
				var li = document.createElement('li');
				var a = document.createElement('a');
				var text = document.createTextNode( tree[i].title );
				a.setAttribute('href', tree[i].url);
				a.appendChild(text);
				li.appendChild(a);
			}
			ul.appendChild( li );
		}
		return ul;
	};
	ul = treeList.level(tree[0].children);
	FS433_Favs_Obj.ul.appendChild(ul);
};
FS433_toggleFavorites = function(){
	if( FS433_Favs_Obj.div.style.display != 'block' ){
		if( !FS433_Favs_Obj.load ){
			chrome.extension.sendMessage({query: 'favorites'}, null);
			FS433_Favs_Obj.load = true;
		}
		FS433_Favs_Obj.div.style.display = 'block';
	}else{
		FS433_Favs_Obj.div.style.display = 'none';
	}
}
FS433_hideFavorites = function(){
	FS433_Favs_Obj.div.style.display = 'none';
}
/* Favorites */

var FS433_wnd = {
	obj: false,
	search: false,
	tpl: function(){
		var t1 = document.createElement('div');
		t1.setAttribute('id', 'fullScreener_Bar');
		var t2 = document.createElement('div');
		t2.setAttribute('class', 'backGrd');
		// back
		var back = document.createElement('div');
		back.setAttribute('id', 'fullScreener_back');
		// forward
		var forward = document.createElement('div');
		forward.setAttribute('id', 'fullScreener_forward');
		// reload
		var reload = document.createElement('div');
		reload.setAttribute('id', 'fullScreener_reload');
		var home = document.createElement('div');
		home.setAttribute('id', 'fullScreener_home');
	
		var favsBg = document.createElement('div');
		favsBg.className = 'fullScreener_Favorites_bg';
	
		var bar = t1;
	
		bar.addEventListener('click', function(e){ e.stopPropagation(); });
		
		if( window.history.length > 1 ){
			back.className = '';
			forward.className = '';
			back.onclick = function(){
				window.history.back();
			}
			forward.onclick = function(){
				window.history.forward();
			}
		}
		reload.onclick = function(){
			window.location.reload();
		}
		home.onclick = function(){
			chrome.storage.sync.get({
				kioskUrl: '%KIOSK_URL%',
			}, function(items) {
				window.location.href = items.kioskUrl;
				chrome.browsingData.remove({ "since" : 0 }, {
						"appcache": true,
						"cache": true,
						"cookies": true,
						"downloads": true,
						"fileSystems": true,
						"formData": true,
						"history": true,
						"indexedDB": true,
						"localStorage": true,
						"serverBoundCertificates": false,
						"pluginData": true,
						"passwords": true,
						"webSQL": true
					  });
			});
		}
		
		t1.appendChild(t2);
	
		
		t1.appendChild(back);
		t1.appendChild(forward);
		t1.appendChild(reload);
		t1.appendChild(home);
		
		
		this.obj = t1;
		document.documentElement.appendChild(this.obj);
		
		return true;
	},
	top:-46
}
var FS433_TabHeight = 28;
var FS433_TabListHeight = 0;

var FS433_show = function(){
	
	clearInterval( FS433_interval );
	if( FS433_wnd.top < 0 ){
		FS433_interval = setInterval(function(){
			FS433_show_int();
		}, 30);
	}
	
	FS433_wnd.top = 0;
	FS433_topOffset = 46 + FS433_wnd.top;
	FS433_wnd.obj.style.top = FS433_wnd.top+'px';
}

var FS433_show_int = function(){
	if( FS433_wnd.top < -4 ){
		FS433_wnd.top += 4;
		FS433_topOffset = ( 46 + FS433_wnd.top ) + 4;
		FS433_wnd.obj.style.top = FS433_wnd.top+'px';
	}else{
		FS433_wnd.top = 0;
		FS433_topOffset = 46 + FS433_wnd.top;
		FS433_wnd.obj.style.top = FS433_wnd.top+'px';
		clearTimeout(FS433_focus_timeout);
	}
}
var FS433_show_go = function(){
	clearTimeout( FS433_timer );	
	FS433_wnd.top = 0;
	FS433_topOffset = ( 46 + FS433_wnd.top ) + 4;
	FS433_wnd.obj.style.top = FS433_wnd.top+'px';
}

var FS433_init = function(){
	FS433_wnd.tpl();
	window.addEventListener('mousemove', function(e){
		if( FS433_state ){
			if( e.screenY <= FS433_topOffset ){
				if( FS433_laststate == 'hide' ){
					FS433_laststate = 'show';
					clearTimeout( FS433_timer );
					//FS433_timer = setTimeout(function(){ FS433_hide(); }, 3000);
					FS433_show();
				}
			}else{
				if( FS433_laststate == 'show' ){
					FS433_laststate = 'hide';
					clearTimeout( FS433_timer );
					//FS433_hide();
				}
			}
		}
	});
	FS433_ready = true;
};
chrome.extension.onMessage.addListener(function(data, sender, sendResponse) {
	if ((data.query == 'list')&&FS433_state) {
		//FS433_tabs = data.body; 
		FS433_suggested = data.suggest; 
		FS433_showTabs();
		FS433_Tabs_Obj.table.style.display = 'table';

		FS433_Tabs_Obj.suggest.focus();
	} else if (data.query == 'fullscreen') {
		FS433_fullscreen_change(data.status);
		
	} else if ((data.query == 'favorites')&&FS433_state) {
		FS433_renderFavorites(data.body);
	}
});
var FS433_fullscreen_change = function(fullscreen){
	if( fullscreen ){
		if ( !FS433_state ) {
		
		}
		FS433_state = true;
		FS433_fullscreen = fullscreen;
		if( !document.getElementById('fullScreener_Bar') ){
			FS433_ready = false;
			FS433_init();
			FS433_show();
		}else{
			FS433_show_go();
		}
	} else {
		if ( FS433_state ) {
		
		}
		FS433_state = false;
	}
};
var FS433_resize_timer = undefined;
var FS433_resize_query = function(){
	chrome.extension.sendMessage({query: 'check_window_state'});
};
var FS433_resize = function(){
	clearTimeout(FS433_resize_timer);
	FS433_resize_timer = setTimeout(FS433_resize_query, 500);
};
window.addEventListener('resize', FS433_resize);
FS433_resize();

/* Tabs code */
var FS433_tabstatus = false;
var FS433_tabsready = false;
var FS433_tabtimer = undefined;
var FS433_Tabs_Obj = {
	init: false
}


var FS433_focus_timeout = undefined;
window.addEventListener('keydown', function(e){
	if( ( e.keyCode == 117 ) && FS433_state ){
		if( !FS433_ready ){
			FS433_init();
		}
		FS433_show_go();
		FS433_focus_timeout = setTimeout(function(){
			FS433_wnd.search.focus();
			FS433_wnd.search.select();
		}, 400);
		e.stopPropagation();
		return false;
	}
	if( ( e.ctrlKey ) && FS433_state && FS433_fullscreen ){
		e.preventDefault();
	
	}
	if( ( e.altKey ) && FS433_state && FS433_fullscreen ){
		e.preventDefault();
	
	}
	
	if (FS433_tabstatus && FS433_tabsready) {
	//if( e.ctrlKey ){
		switch( e.keyCode ){
		case FS433_KEY_UP: // up
			e.preventDefault();
			FS433_Tabs_Up();
		break;
		case FS433_KEY_DOWN: // down
			e.preventDefault();
			FS433_Tabs_Down();
		break;
		}
	}
	if( ((e.keyCode == FS433_KEY_ACTIVATE)||(e.keyCode == FS433_KEY_ACTIVATE2)) && ( e.metaKey || e.ctrlKey ) && (e.keyIdentifier!="U+0060") ){
		if( !FS433_tabstatus ){
			FS433_tabstatus = true;
			FS433_state = true;
			//chrome.extension.sendMessage({query: 'list'}, null);
		}
	}
	if (e.keyCode == FS433_KEY_ESC) {
		if (FS433_tabstatus) {
			e.preventDefault();
		}
		FS433_tabstatus = false;
		//FS433_hideTabs();
	}
});

window.addEventListener('keyup', function(e){
	if( e.keyCode == FS433_KEY_CTRL ){
		
		e.preventDefault();
	} 
	
});

 

}else{
	document.onclick = function(e){
		chrome.extension.sendMessage({query: 'event', e: {eventType: 'keydown', keyCode: e.keyCode, ctrlKey: e.ctrlKey}});
	}
	window.onmousemove = function(e){
		chrome.extension.sendMessage({query: 'event', e: {eventType: 'mousemove', screenX: e.screenX, screenY: e.screenY}});
	}
	window.onkeydown = function(e){
		chrome.extension.sendMessage({query: 'event', e: {eventType: 'keydown', keyCode: e.keyCode, ctrlKey: e.ctrlKey}});
		chrome.extension.sendMessage({query: 'event', e: {eventType: 'keydown', keyCode: e.keyCode, ctrlKey: e.altKey}});
	}
	window.onkeyup = function(e){
		chrome.extension.sendMessage({query: 'event', e: {eventType: 'keyup', keyCode: e.keyCode, ctrlKey: e.ctrlKey}});
		chrome.extension.sendMessage({query: 'event', e: {eventType: 'keyup', keyCode: e.keyCode, ctrlKey: e.altKey}});
	}
}