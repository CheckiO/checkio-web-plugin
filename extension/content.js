(function (_window) {
	var isChrome = (/google/i).test(navigator.vendor),
		mc_browser = isChrome ? chrome : browser;

	mc_browser.runtime.connect('mlglngjgefkbflbmelghfeijmojocnbi')

	function sendRuntimeMessage(message){
		console.log("Send Runtime Message: " + JSON.stringify(message));
		mc_browser.runtime.sendMessage(message, function(response){
			sendEventMessage(response);
		});
	}

	_window.addEventListener("web:sendMessage", function (evt) {
		var message = evt.detail;
		console.log("Receive Event Message: " + JSON.stringify(message));
		sendRuntimeMessage(message);
	});

	function sendEventMessage(message) {
		console.log('Send Event Message:', message);
		var event = document.createEvent('CustomEvent');
		event.initCustomEvent('plugin:sendMessage', true, true, JSON.stringify({
			'data': message
		}));
		_window.dispatchEvent(event);
	}

})(window);