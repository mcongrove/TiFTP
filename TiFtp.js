var TiFtp = {
	config: {
		host: null,
		port: 21,
		path: null,
		user: null,
		password: null
	},
	init: function(_host, _path, _user, _password) {
		if(!_host || !_path || !_user || !_password) {
			Ti.API.warn("TiFtp: Missing required instantiation property");
			return;
		}
		
		TiFtp.config.host		= _host;
		TiFtp.config.path		= _path;
		TiFtp.config.user		= _user;
		TiFtp.config.password	= _password;
	},
	connect: function() {
		if(Ti.Network.networkType == Ti.Network.NETWORK_NONE) {
			Ti.API.warn("TiFtp: No network connection available");
			return;
		}
		
		TiFtp.socket = Ti.Network.createTCPSocket({
			hostName: TiFtp.config.host,
			port: TiFtp.config.port,
			stripTerminator: true,
			mode: Ti.Network.READ_WRITE_MODE
		});
		
		TiFtp.socket.addEventListener("read", TiFtp.handle);
		TiFtp.socket.addEventListener("readError", TiFtp.errorRead);
		TiFtp.socket.addEventListener("writeError", TiFtp.errorWrite);
		
		try {
			Ti.API.info("TiFtp: Connecting to " + TiFtp.socket.hostName);
			TiFtp.socket.connect();
		} catch(_error) {
			Ti.API.warn("TiFtp: Could not connect to the socket");	
		}
	},
	disconnect: function() {
		if(TiFtp.socket.isValid) {
			TiFtp.socket.write("QUIT\r\n");
		}
	},
	errorRead: function(_event) {
		Ti.API.warn("TiFtp: Socket read error");
	},
	errorWrite: function(_event) {
		Ti.API.warn("TiFtp: Socket write error");
	},
	write: function(_path) {
		Ti.API.debug("TiFtp: Writing " + _path);
		TiFtp.socket.write("STOR " + _path + "\n");
		TiFtp.socket.write("PWD\n");
	},
	handle: function(_event) {
		var responseCode = _event.data.toString().substr(0,3);
		
		switch(responseCode) {
			case "220":
				Ti.API.info("TiFtp: Logging in");
				TiFtp.socket.write("USER " + TiFtp.config.user + "\n", _event.from);
				break;
			case "221":
				Ti.API.info("TiFtp: Disconnected");
				TiFtp.socket.close();
				break;
			case "227":
				Ti.API.info("TiFtp: Passive mode entered");
				break;
			case "230":
				Ti.API.info("TiFtp: Log in successful");
				TiFtp.socket.write("CWD " + TiFtp.config.path + "\n", _event.from);
				break;
			case "250":
				Ti.API.info("TiFtp: Changed active directory to " + TiFtp.config.path);
				TiFtp.socket.write("PASV\n");
				break;
			case "331":
				Ti.API.info("TiFtp: Sending credentials");
				TiFtp.socket.write("PASS " + TiFtp.config.password + "\n", _event.from);
				break;
			case "530":
				Ti.API.warn("TiFtp: Login failed, disconnecting");
				TiFtp.socket.close();
				break;
			default:
				Ti.API.debug("TiFtp: [SERVER] " + _event.data.toString());
				break;
		}
	}
};