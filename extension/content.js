
(function (_window) {
	var test = location.href.match(/checkio\.org(:.+)?\/mission\/(.+)\/solve/);
	if (test && test[2]) {
		var exts = location.href.match(/https?:\/\/(.+)\.checkio\.org/);
		console.log(exts);
		var taskName = test[2];
		var taskExt = (exts && exts.length === 2 ? exts[1]: "py");
		taskName = taskName + "_" + taskExt;
		console.log(taskName, taskExt);
		var webAlreadyLoaded = false;
		var contentLoaded = false;
		var PluginReady = null;
		var BindDefault = false;
		var FirstContent = '';
		var DeferredEvents = (function () {
			var deferredEvents = [];
			function appnedNewEvent (evt) {
				var found = false;
				for (var i = 0 , li = deferredEvents.length ; i < li && !found; ++i) {
					if (deferredEvents[i].type === evt.type) {
						deferredEvents[i] = evt;
						found = true;
					}
				}
				if (!found) {
					deferredEvents.push(evt);
				}
			}
			function clear () {
				deferredEvents = [];
			}
			function fire () {
				for (var i = 0 , li = deferredEvents.length ; i < li; ++i) {
					_window.dispatchEvent(deferredEvents[i]);
				}
				clear();
			}
			return {
				append: appnedNewEvent,
				clear: clear,
				fire: fire
			}
		})();

		function MessageManager () {
			var m_callbacks = {};
			this.fireEvent = function (eventName, message, sender, sendResponse) {
				var callbacks = m_callbacks[eventName];
				if (callbacks && callbacks.length) {
					for (var i = 0 , li = callbacks.length ; i < li ; ++i) {
						callbacks[i](eventName, message, sender, sendResponse);
					}
				}
			};
			this.addEventListener = function (eventName, callback) {
				if (!m_callbacks[eventName]) {
					m_callbacks[eventName] = [callback];
				} else {
					m_callbacks[eventName].push(callback)
				}
			};
		}

		function BackgroundMessageManager () {
			var self = this;
			chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
				if (message.task === taskName) {
					self.fireEvent(message.name, message, sender, sendResponse);
				}
			});
		}
		BackgroundMessageManager.prototype = new MessageManager();
		BackgroundMessageManager.prototype.constructor = BackgroundMessageManager;

		var g_backgroundMessageManager = new BackgroundMessageManager();

		function MessageFromBg () {
			this.getName = function () {}; 
			this.doIt = function () {};
			this.eventName = function () {};
			this.again = function () {
				this.fireToWeb(this.storedValue);
			};
			this.fireToWeb = function (value) {
				var event = document.createEvent('CustomEvent');
				var path = (value.info || "").split("_");
				event.initCustomEvent(this.eventName(), true, true, JSON.stringify({
					filePath: (path.length === 2? (path[0] + "." + taskExt): path[0]),
					content: value.content || ""
				}));
				if (true === webAlreadyLoaded) {
					_window.dispatchEvent(event);
				} else {
					DeferredEvents.append(event);
				}
			};
		}
		function FileContent() {
			this.eventName = function () {
				return "plugin:contentChanged";
			};
			this.doIt = function (value) {
				this.fireToWeb(value);
			};
		}
		FileContent.prototype = new MessageFromBg();
		FileContent.prototype.constructor = FileContent;
		
		function FileChosen () {
			this.eventName = function () {
				return "plugin:fileBound";
			};
			this.doIt = function (value) {
				this.fireToWeb(value);
			};
		}
		FileChosen.prototype = new MessageFromBg();
		FileChosen.prototype.constructor = FileChosen;

		function UnboundFile () {
			this.eventName = function () {
				return "plugin:fileBound";
			};
			this.doIt = function (value) {
				this.fireToWeb(value);
			};
		}
		UnboundFile.prototype = new MessageFromBg();
		UnboundFile.prototype.constructor = UnboundFile;

		function CheckedFile () {
			var parent = this.__proto__;
			this.eventName = function () {
				return "plugin:ready";
			};
			this.fireToWeb = function (value) {
				var event = document.createEvent('CustomEvent');
				var path = (value.info || "").split("_");
				event.initCustomEvent(this.eventName(), true, true, JSON.stringify({
					filePath: (path.length === 2? (path[0] + "." + taskExt): path[0]),
					content: (value.content || ""),
					version: '0.0.0.14'
				}));
				_window.dispatchEvent(event);
			};
			this.doIt = function (fileChosen) {
				this.storedValue = fileChosen;
				this.fireToWeb(fileChosen);
			};
		}
		CheckedFile.prototype = new MessageFromBg();
		CheckedFile.prototype.constructor = CheckedFile;

		function MessageFromWeb () {
			this.getName = function () {};
			this.doIt = function () {
				chrome.runtime.sendMessage({
					name: this.getName(),
					task: taskName,
					ext: taskExt
				});
			};
		}

		function BindFolder () {
			this.getName = function () {
				return "content:bindFolder";
			};
			this.doIt = function (content) {
				chrome.runtime.sendMessage({
					name: this.getName(),
					task: taskName,
					content: content,
					ext: taskExt
				});
			};
		}
		BindFolder.prototype = new MessageFromWeb();
		BindFolder.prototype.constructor = BindFolder;

		function UnbindFolder () {
			this.getName = function () {
				return "content:unbindFolder";
			};
		}
		UnbindFolder.prototype = new MessageFromWeb();
		UnbindFolder.prototype.constructor = UnbindFolder;


		function NewWebContent () {
			this.getName = function () {
				return "content:webContent";
			};
			this.doIt = function (content) {
				chrome.runtime.sendMessage({
					name: this.getName(),
					task: taskName,
					content: content,
					ext: taskExt
				});
			};
		}
		NewWebContent.prototype = new MessageFromWeb();
		NewWebContent.prototype.constructor = NewWebContent;

		function WebContentDefault () {
			this.getName = function () {
				return "content:webContentDefault";
			};
			this.doIt = function (content) {
				chrome.runtime.sendMessage({
					name: this.getName(),
					task: taskName,
					content: content,
					ext: taskExt
				});
			};
		}
		WebContentDefault.prototype = new MessageFromWeb();
		WebContentDefault.prototype.constructor = WebContentDefault;

		_window.addEventListener("web:contentChanged", function (evt) {
			(new NewWebContent).doIt(evt.detail.content);
		});
		_window.addEventListener("web:bindFolder", function (evt) {
			var content = evt.detail.content;
			(new BindFolder).doIt(content);
		});
		_window.addEventListener("web:unbindFolder", function (evt) {
			(new UnbindFolder).doIt();
		});
		_window.addEventListener("web:ready", function (evt) {
			if (evt.detail.content && BindDefault) {
				(new WebContentDefault).doIt(evt.detail.content);
			} else {
				PluginReady && PluginReady.again();
			}
		});
		_window.addEventListener("web:startSync", function (evt) {
			webAlreadyLoaded = true;
			DeferredEvents.fire();
			_window.addEventListener("focus", function (evt) {
				chrome.runtime.sendMessage({
					name: "content:getFile",
					task: taskName,
					ext: taskExt
				});
			});
		});

		chrome.runtime.sendMessage({
			name: "content:checkFile",
			task: taskName,
			ext: taskExt
		});

		g_backgroundMessageManager.addEventListener("background:fileChecked", function (eventName, message) {
			if (message.value.isDefault && !message.value.content) {
				BindDefault = true;
			} else {
				PluginReady = new CheckedFile();
				PluginReady.doIt(message.value);	
			}
		});
		g_backgroundMessageManager.addEventListener("background:fileContentSet", function (eventName, message) {
			if (BindDefault) {
				PluginReady = new CheckedFile();
				PluginReady.doIt(message.value);
			}
		});
		g_backgroundMessageManager.addEventListener("background:fileContent", function (eventName, message) {
			(new FileContent()).doIt(message.value);
		});
		g_backgroundMessageManager.addEventListener("background:fileChosen", function (eventName, message) {
			(new FileChosen()).doIt(message.value);
		});
		g_backgroundMessageManager.addEventListener("background:unboundFile", function (eventName, message) {
			(new UnboundFile()).doIt({});
		});
	}
})(window);
