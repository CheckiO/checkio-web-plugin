(function () {

	var port = null;
	var hostName = "com.google.chrome.checkio.client";
	var extId = "mlglngjgefkbflbmelghfeijmojocnbi";
	var runtimeCallBacks = [];

	connect();
	window.sendNativeMessage = sendNativeMessage;
	function connect() {
		console.log("Connecting to native messaging host <b>" + hostName + "</b>")
		port = chrome.runtime.connectNative(hostName);
		port.onMessage.addListener(onNativeMessage);
		port.onDisconnect.addListener(onDisconnected);

		chrome.runtime.connect(extId);
		chrome.runtime.onMessage.addListener(onRuntimeMessage);
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
		sendNativeMessage(message);
		runtimeCallBacks.push(callback);
		return true;
	}

	function sendRuntimeMessage(message) {
		console.log("Sent Runtime message: " + JSON.stringify(message));
		runtimeCallBacks.shift()(message);
		//chrome.runtime.sendMessage(message);
	}

	function onDisconnected() {
		console.log("Failed to connect: " + chrome.runtime.lastError.message);
		port = null;
	}

})()