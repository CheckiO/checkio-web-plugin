(function () {
	var isChrome = (/google/i).test(navigator.vendor),
		mc_browser = isChrome ? chrome : browser;

	var port = null;
	var hostName = "com.google.chrome.checkio.client";
	var extId = "mlglngjgefkbflbmelghfeijmojocnbi";
	var runtimeCallBacks = [];

	var lastTimeFail = 0;
	var lastError = undefined;

	connect();
	connect_runtime();

	function connect() {
		console.log("Connecting to native messaging host <b>" + hostName + "</b>")
		port = mc_browser.runtime.connectNative(hostName);
		port.onMessage.addListener(onNativeMessage);
		port.onDisconnect.addListener(onDisconnected);
	}

	function connect_runtime() {
		mc_browser.runtime.connect(extId);
		mc_browser.runtime.onMessage.addListener(onRuntimeMessage);
	}

	function sendNativeMessage(message) {
		console.log("Sent Native message: " + JSON.stringify(message));
		port.postMessage(message);
	}

	function onNativeMessage(message) {
		console.log("Received Native message: " + JSON.stringify(message));
		sendRuntimeMessage(message);
	}

	function onRuntimeMessage(message, sender, callback) {
		console.log("Received Runtime message: " + JSON.stringify(message));
		if (port) {
			sendNativeMessage(message);
			runtimeCallBacks.push(callback);
		} else {
			callback({
				'do': 'error',
				'type': 'PluginBackPort',
				'text': lastError
			})
		}
		
		return true;
	}

	function sendRuntimeMessage(message) {
		console.log("Sent Runtime message: " + JSON.stringify(message));
		runtimeCallBacks.shift()(message);
	}

	function onDisconnected() {
		console.log("Failed to connect: " + mc_browser.runtime.lastError.message);
		lastError = mc_browser.runtime.lastError.message;
		var currentTime = new Date().getTime();
		if (currentTime - lastTimeFail > 1000) {
			console.log('Reconnect ' + (currentTime - lastTimeFail));
			lastTimeFail = currentTime;
			connect();
		}
		port = undefined;
	}

})()