(function () {

	var port = null;
	var hostName = "com.google.chrome.example.echo";

	connect();
	window.sendNativeMessage = sendNativeMessage;
	function connect() {
		console.log("Connecting to native messaging host <b>" + hostName + "</b>")
		port = chrome.runtime.connectNative(hostName);
		port.onMessage.addListener(onNativeMessage);
		port.onDisconnect.addListener(onDisconnected);
	}

	function sendNativeMessage(message) {
		port.postMessage(message);
		console.log("Sent message: <b>" + JSON.stringify(message) + "</b>");
	}

	function onNativeMessage(message) {
		console.log("Received message: <b>" + JSON.stringify(message) + "</b>");
	}

	function onDisconnected() {
		console.log("Failed to connect: " + chrome.runtime.lastError.message);
		port = null;
	}

	var applicationId = "gmjofilnmjmbckkaagofaeojobnikajm";
	var filesChosen = {};

	function MessageToApp (taskName) {
		this.eventName = function () {};
		this.doIt = function () {
			chrome.runtime.sendMessage(applicationId, {
				name: this.eventName(),
				task: this.getTask(),
				ext: this.getExt()
			});
		};
	}

	function BindFolderMessage (taskName, ext) {
		var self = this;
		this.getTask = function () {
			return taskName;
		};
		this.getExt = function () {
			return ext;
		};
		this.eventName = function () {
			return "plugin:bindFolder";
		};
		this.doIt = function (content) {
			chrome.runtime.sendMessage(applicationId, {
				name: this.eventName(),
				task: this.getTask(),
				ext: this.getExt(),
				content: content
			});
		};
	}
	BindFolderMessage.prototype = new MessageToApp();
	BindFolderMessage.prototype.constructor = BindFolderMessage;

	function GetFileMessage (taskName, ext) {
		var self = this;
		this.getTask = function () {
			return taskName;
		};
		this.getExt = function () {
			return ext;
		};
		this.eventName = function () {
			return "plugin:getFile";
		};
	}
	GetFileMessage.prototype = new MessageToApp();
	GetFileMessage.prototype.constructor = GetFileMessage;

	function CheckFileMessage (taskName, ext, sender) {
		var self = this;
		var parent = this.__proto__;
		this.getTask = function () {
			return taskName;
		};
		this.getExt = function () {
			return ext;
		};
		this.eventName = function () {
			return "plugin:checkFile"
		};
		this.doIt = function () {
			var fileChosen = filesChosen[taskName] || {};
			parent.doIt.call(this);
		};
	}
	CheckFileMessage.prototype = new MessageToApp();
	CheckFileMessage.prototype.constructor = CheckFileMessage;

	function ChooseDefaultFolder () {
		this.getTask = function () {
			return "";
		};
		this.eventName = function () {
			return "plugin:chooseDefaultFolder";
		};
	}
	ChooseDefaultFolder.prototype = new MessageToApp();
	ChooseDefaultFolder.prototype.constructor = ChooseDefaultFolder;

	function ChooseDefaultFile () {
		this.getTask = function () {
			return "";
		};
		this.eventName = function () {
			return "plugin:chooseDefaultFile";
		};
	}
	ChooseDefaultFile.prototype = new MessageToApp();
	ChooseDefaultFile.prototype.constructor = ChooseDefaultFile;

	function NewWebContentMessage (taskName, ext) {
		this.getTask = function () {
			return taskName;
		};
		this.getExt = function () {
			return ext;
		};
		this.eventName = function () {
			return "plugin:webContent";
		};
		this.doIt = function (content) {
			chrome.runtime.sendMessage(applicationId, {
				name: this.eventName(),
				task: this.getTask(),
				ext: this.getExt(),
				content: content
			});
		};
	}
	NewWebContentMessage.prototype = new MessageToApp();
	NewWebContentMessage.prototype.constructor = NewWebContentMessage;

	function WebContentDefaultMessage (taskName, ext) {
		this.getTask = function () {
			return taskName;
		};
		this.getExt = function () {
			return ext;
		};
		this.eventName = function () {
			return "plugin:webContentDefault";
		};
		this.doIt = function (content) {
			chrome.runtime.sendMessage(applicationId, {
				name: this.eventName(),
				task: this.getTask(),
				ext: this.getExt(),
				content: content
			});
		};
	}
	WebContentDefaultMessage.prototype = new MessageToApp();
	WebContentDefaultMessage.prototype.constructor = WebContentDefaultMessage;

	function UnbindFolderMessage (taskName,ext) {
		var self = this;
		var parent = this.__proto__;
		this.getTask = function () {
			return taskName;
		};
		this.getExt = function () {
			return ext;
		};
		this.eventName = function () {
			return "plugin:unbindFolder";
		};
		this.doIt = function () {
			filesChosen[taskName] = null;
			parent.doIt.call(this);
		};
	}
	UnbindFolderMessage.prototype = new MessageToApp();
	UnbindFolderMessage.prototype.constructor = UnbindFolderMessage;

	function MessageToContent () {
		this.doIt = function () {};
		this.eventName = function () {};
		this.fireEvent = function (taskName, value) {
			var self = this;
			chrome.tabs.query({url: "https://*.checkio.org/*"}, function (tabs) {
				for (var i = 0 , li = tabs.length ; i < li ; ++i) {
					chrome.tabs.sendMessage(tabs[i].id, {
						name: self.eventName(),
						task: taskName,
						value: value
					});
				}
			});
		};
	}

	function FileChosenMessage (taskName) {
		this.eventName = function () {
			return "background:fileChosen";
		};
		this.doIt = function (value) {
			filesChosen[taskName] = value;
			this.fireEvent(taskName, value);
		};
	}
	FileChosenMessage.prototype = new MessageToContent();
	FileChosenMessage.prototype.constructor = FileChosenMessage;

	function FileContentMessage (taskName) {
		this.eventName = function () {
			return "background:fileContent";
		};
		this.doIt = function (value) {
			filesChosen[taskName] = value;
			this.fireEvent(taskName, value);
		};
	}
	FileContentMessage.prototype = new MessageToContent();
	FileContentMessage.prototype.constructor = FileContentMessage;

	function FileContentSetMessage (taskName) {
		this.eventName = function () {
			return "background:fileContentSet";
		};
		this.doIt = function (value) {
			filesChosen[taskName] = value;
			this.fireEvent(taskName, value);
		};
	}
	FileContentSetMessage.prototype = new MessageToContent();
	FileContentSetMessage.prototype.constructor = FileContentSetMessage;

	function FileCheckedMessage (taskName) {
		this.eventName = function () {
			return "background:fileChecked";
		};
		this.doIt = function (value) {
			filesChosen[taskName] = value;
			this.fireEvent(taskName, value);
		};
	}
	FileCheckedMessage.prototype = new MessageToContent();
	FileCheckedMessage.prototype.constructor = FileCheckedMessage;

	function FileUnboundMessage (taskName) {
		this.eventName = function () {
			return "background:unboundFile";
		};
		this.doIt = function () {
			filesChosen[taskName] = {};
			this.fireEvent(taskName, {});
		};
	}
	FileUnboundMessage.prototype = new MessageToContent();
	FileUnboundMessage.prototype.constructor = FileUnboundMessage;

	function MessageToOptions () {
		this.doIt = function () {};
		this.eventName = function () {};
		this.fireEvent = function (info) {
			var self = this;
			chrome.tabs.query({url: "chrome-extension://*/options/options.html"}, function (tabs) {
				for (var i = 0 , li = tabs.length ; i < li ; ++i) {
					chrome.tabs.sendMessage(tabs[i].id, {
						name: self.eventName(),
						info: message
					});
				}
			});
		};	
	}

	function ChousenDefaultFolder () {
		this.eventName = function () {
			return "background:defaultFolder";
		};
		this.doIt = function (message) {
			filesChosen["defaultFolder"] = message;
			this.fireEvent(message);
		};
	}
	ChousenDefaultFolder.prototype = new MessageToOptions();
	ChousenDefaultFolder.prototype.constructor = ChousenDefaultFolder;

	function ChousenDefaultFile () {
		this.eventName = function () {
			return "background:defaultFile";
		};
		this.doIt = function (message) {
			filesChosen["defaultFile"] = message;
			this.fireEvent(message);
		};
	}
	ChousenDefaultFile.prototype = new MessageToOptions();
	ChousenDefaultFile.prototype.constructor = ChousenDefaultFile;


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
		}
	}

	function AppMessageManager () {
		var self = this;
		chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
			self.fireEvent(message.name, message, sender, sendResponse);
		});
	}
	AppMessageManager.prototype = new MessageManager();
	AppMessageManager.prototype.constructor = AppMessageManager;

	function ContentMessageManager () {
		var self = this;
		chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
			self.fireEvent(message.name, message, sender, sendResponse);
		});
	}
	ContentMessageManager.prototype = new MessageManager();
	ContentMessageManager.prototype.constructor = ContentMessageManager;

	var g_contentMessageManager = new ContentMessageManager();
	g_contentMessageManager.addEventListener("content:bindFolder", function (evt, message) {
		(new BindFolderMessage(message.task, message.ext)).doIt(message.content);
	});
	g_contentMessageManager.addEventListener("content:getFile", function (evt, message) {
		(new GetFileMessage(message.task, message.ext)).doIt();
	});
	g_contentMessageManager.addEventListener("content:webContent", function (evt, message) {
		(new NewWebContentMessage(message.task, message.ext)).doIt(message.content);
	});
	g_contentMessageManager.addEventListener("content:webContentDefault", function (evt, message) {
		(new WebContentDefaultMessage(message.task, message.ext)).doIt(message.content);
	});
	g_contentMessageManager.addEventListener("content:unbindFolder", function (evt, message, sender, sendResponse) {
		(new UnbindFolderMessage(message.task, message.ext, sender, sendResponse)).doIt();
	});
	g_contentMessageManager.addEventListener("content:checkFile", function (evt, message, sender, sendResponse) {
		(new CheckFileMessage(message.task, message.ext, sender, sendResponse)).doIt();
	});
	g_contentMessageManager.addEventListener("options:chooseDefaultFolder", function (evt, message, sender, sendResponse) {
		(new ChooseDefaultFolder()).doIt();
	});
	g_contentMessageManager.addEventListener("options:chooseDefaultFile", function (evt, message, sender, sendResponse) {
		(new ChooseDefaultFile()).doIt();
	});

	var g_appMessageManager = new AppMessageManager();
	g_appMessageManager.addEventListener("app:fileContent", function (evt, message) {
		(new FileContentMessage(message.task)).doIt(message);
	});
	g_appMessageManager.addEventListener("app:fileChosen", function (evt, message) {
		(new FileChosenMessage(message.task)).doIt(message);
	});
	g_appMessageManager.addEventListener("app:fileChecked", function (evt, message) {
		(new FileCheckedMessage(message.task)).doIt(message);
	});
	g_appMessageManager.addEventListener("app:fileUnbound", function (evt, message) {
		(new FileUnboundMessage(message.task)).doIt(message);
	});
	g_appMessageManager.addEventListener("app:fileContentSet", function (evt, message) {
		(new FileContentSetMessage(message.task)).doIt(message);
	});
	

	setInterval(function () {
		chrome.runtime.sendMessage(applicationId, {});
	}, 1500);

})();