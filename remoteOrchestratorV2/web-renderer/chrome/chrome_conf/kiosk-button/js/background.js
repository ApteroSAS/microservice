var tabsList = [];
var contextMenuId = undefined;
var contextMenuInc = 0;
var contextMenuList = [];
var contextMenuContext = ["all"];
var contextMenuAlias = {};

var currentWindowId = undefined;
var currentWindowFullscreen = false;

var _updateTabListTimer = undefined;
var _updateTabListLocked = false;

const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, result =>
            chrome.runtime.lastError ?
            reject(Error(chrome.runtime.lastError.message)) :
            resolve(result)
        )
    )


var init = async function() {
	//Idle Detection and Return to Homepage
	const items = await getStorageData({
		kioskTimer: 300 //Time in seconds
	});

	var kTimer = Number(items.kioskTimer);
	if (kTimer < 15) {
		kTimer = 15;
	}
	console.log(kTimer + ' timer');
	chrome.idle.setDetectionInterval(kTimer); 
};

var requestTabList = function() {
    _updateTabListLocked = true;

    chrome.windows.getCurrent({}, function(wnd) {
        chrome.tabs.query({}, function(tabs) {
            var currentWindowTabs = [];
            var otherWindowTabs = [];
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].windowId == wnd.id) {
                    currentWindowTabs.push(tabs[i]);
                } else {
                    otherWindowTabs.push(tabs[i]);
                }
            }
            tabsList = currentWindowTabs.concat(otherWindowTabs);
            dictionary.update({
                array: tabsList,
                keys: ['title', 'url']
            });
            //updateContextMenu();
            _updateTabListLocked = false;
        });
    });
};
var updateTabList = function() {
    clearTimeout(_updateTabListTimer);
    if (!_updateTabListLocked) {
        _updateTabListTimer = setTimeout(requestTabList, 1000);
    } else {
        _updateTabListTimer = setTimeout(updateTabList, 1000);
    }
};

chrome.tabs.onActiveChanged.addListener(updateTabList);

chrome.extension.onMessage.addListener(function(data, sender, sendResponse) {
    var self = this;
    switch (data.query) {
        case 'list':
            chrome.tabs.sendMessage(sender.tab.id, {
                query: 'list',
                suggest: data.suggest,
                body: dictionary.suggest(data.suggest)
            }, null);
            if (data.suggest) {                
            } else {                
            }
            break;
        case 'tab':
            openTab(parseInt(data.id));
            break;
        case 'newtab':
            chrome.tabs.create({
                'url': chrome.extension.getURL('newtab.html')
            });
            
            break;
        case 'event':
            switch (data.e.eventType) {
                case 'mousemove':
                    chrome.tabs.executeScript(sender.tab.id, {
                        code: 'eventTransmitter({"eventType": "mousemove", "screenX":' + data.e.screenX + ', "screenY":' + data.e.screenY + '})',
                        allFrames: false
                    });
                    break;
                case 'keydown':
                    chrome.tabs.executeScript(sender.tab.id, {
                        code: 'eventTransmitter({"eventType": "keydown", "keyCode":' + data.e.keyCode + ', "ctrlKey":' + data.e.ctrlKey + '})',
                        allFrames: false
                    });
                    break;
                case 'keyup':
                    chrome.tabs.executeScript(sender.tab.id, {
                        code: 'eventTransmitter({"eventType": "keyup", "keyCode":' + data.e.keyCode + ', "ctrlKey":' + data.e.ctrlKey + '})',
                        allFrames: false
                    });
                    break;
            }
            break;
        case 'favorites':
            chrome.bookmarks.getTree(function(tree) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    query: 'favorites',
                    body: tree
                }, null);
            });
            break;
        case 'check_window_state':
            chrome.windows.getCurrent({}, function(wnd) {
                if (wnd.id != -1) {
                    var fullscreen = (wnd.state == 'fullscreen');
                    currentWindowFullscreen = fullscreen;
                    chrome.tabs.query({
                        windowId: wnd.id
                    }, function(tabs) {
                        for (var i = 0; i < tabs.length; i++) {
                            chrome.tabs.sendMessage(tabs[i].id, {
                                query: 'fullscreen',
                                status: fullscreen
                            }, null);
                        }
                    });
                }
            });
            break;
        case 'popup:show':
           // _gaq.push(['_trackEvent', 'popup_show', 'clicked']);
            break;
    }
});


requestTabList();

init();

chrome.idle.onStateChanged.addListener(async function(newState) {
    console.log(newState);
    if (newState == "idle") {
		items = await getStorageData({
			kioskUrl: 'https://google.com',
		});
		chrome.tabs.update({
			url: items.kioskUrl,
			active: true
		}, function(currTab) {
			chrome.browsingData.remove({
				"since": 0
			}, {
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
});

chrome.windows.onFocusChanged.addListener(function() {
    chrome.windows.getCurrent({}, function(wnd) {
        if (wnd.id != -1) {
            var fullscreen = (wnd.state == 'fullscreen');
            chrome.tabs.query({
                windowId: wnd.id
            }, function(tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    chrome.tabs.sendMessage(tabs[i].id, {
                        query: 'fullscreen',
                        status: fullscreen
                    }, null);
                }
            });
        }
    });
});
