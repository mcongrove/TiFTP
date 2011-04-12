Example
=======

	Ti.include("TiFtp.js");
	TiFtp.init("123.4.5.6", "/home/me", "username", "password");
	
	var win = Ti.UI.createWindow({ backgroundColor: "#FFF" });
	var buttonWrite1 = Ti.UI.createButton({ title: "Write File 1", width: 280, height: 40, top: 20, left: 20 });
	var buttonWrite2 = Ti.UI.createButton({ title: "Write File 2", width: 280, height: 40, top: 80, left: 20 });
	var buttonDisconnect = Ti.UI.createButton({ title: "Disconnect", width: 280, height: 40, top: 140, left: 20 });
	
	buttonWrite1.addEventListener("click", function(_event) {
		TiFtp.write("/Users/me/Desktop/test1.txt");
	});
	
	buttonWrite2.addEventListener("click", function(_event) {
		TiFtp.write("/Users/me/Desktop/test2.txt");
	});
	
	buttonDisconnect.addEventListener("click", function(_event) {
		TiFtp.disconnect();
	});
	
	win.add(buttonWrite1);
	win.add(buttonWrite2);
	win.add(buttonDisconnect);
	win.open();