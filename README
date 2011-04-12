Example
=======

	Ti.include("TiFtp.js");
	TiFtp.init("127.0.0.1", "/home/me", "username", "password");
	
	var win = Ti.UI.createWindow({ backgroundColor: "#FFF" });
	var buttonConnect = Ti.UI.createButton({ title: "Connect", width: 280, height: 40, top: 20, left: 20 });
	var buttonWrite = Ti.UI.createButton({ title: "Write File", width: 280, height: 40, top: 80, left: 20 });
	var buttonDisconnect = Ti.UI.createButton({ title: "Disconnect", width: 280, height: 40, top: 140, left: 20 });
	
	buttonConnect.addEventListener("click", function(_event) {
		TiFtp.connect();
	});
	
	buttonWrite.addEventListener("click", function(_event) {
		TiFtp.write("/Users/me/Desktop/test.txt");
	});
	
	buttonDisconnect.addEventListener("click", function(_event) {
		TiFtp.disconnect();
	});
	
	win.add(buttonConnect);
	win.add(buttonWrite);
	win.add(buttonDisconnect);
	win.open();