(function sendlog () {
	var timerId = null;
	var oneDay = 24 * 60 * 60 * 1000;
	var partDay = 3 * 60 * 60 * 1000;
	function sendRequest (currentTime) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://checkio.org/log/web-plugin/info/?version=1.1.9.1&browser=chrome", true);
		xhr.onload = function (e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					localStorage.setItem('logtime', currentTime);
				}
			}
		};
		xhr.onerror = function (e) {
		};
		xhr.send(null);	
	}

	(function check () {
		clearTimeout(timerId);
		var currentTime = Date.now();
		var cacheTime = parseInt(localStorage.getItem('logtime'));
		if (!cacheTime || (currentTime - cacheTime - oneDay >= 0)) {
			sendRequest(currentTime);
		}
		timerId = setTimeout(check, partDay);
	})();
	
})();