var TiFtp = {
	config: {
		host: null,
		port: 21,
		path: null,
		user: null,
		password: null
	},
	data: null,
	socket: null,
	dataSocket: null,
	init: function(_host, _path, _user, _password) {
		if(!_host || !_path || !_user || !_password) {
			Ti.API.warn("TiFtp: Missing required instantiation property");
			return;
		}
		
		TiFtp.config.host		= _host;
		TiFtp.config.path		= _path;
		TiFtp.config.user		= _user;
		TiFtp.config.password	= _password;
		
		TiFtp.connect();
	},
	getPort: function(_string) {
		var ports = _string.match(/[0-9]+,[0-9]+,[0-9]+,[0-9]+,([0-9]+,[0-9]+)/)[1].split(",");
		var port = parseInt(ports[0] * 256, 10) + parseInt(ports[1], 10);
		
		return port;
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
	connectData: function(_port) {
		if(TiFtp.dataSocket) {
			try {
				TiFtp.dataSocket.close();
			} catch(e) {
				// gulp	
			}
			
			TiFtp.dataSocket = null;	
		}
		
		TiFtp.dataSocket = Ti.Network.createTCPSocket({
			hostName: TiFtp.config.host,
			port: _port,
			mode: Ti.Network.READ_WRITE_MODE
		});
		
		TiFtp.dataSocket.addEventListener("readError", TiFtp.errorRead);
		TiFtp.dataSocket.addEventListener("writeError", TiFtp.errorWrite);
		
		try {
			Ti.API.info("TiFtp: Connecting to data socket (Port " + _port + ")");
			TiFtp.dataSocket.connect();
		} catch(_error) {
			Ti.API.warn("TiFtp: Could not connect to the data socket");	
		}
	},
	disconnect: function() {
		TiFtp.socket.write("QUIT\n");
	},
	write: function(_path) {
		if(TiFtp.socket.isValid && TiFtp.dataSocket.isValid) {
			Ti.API.info("TiFtp: Grabbing contents of " + _path);
			
			var file = Ti.Filesystem.getFile(_path);
			TiFtp.data = file.read();
			
			TiFtp.socket.write("STOR " + file.name + "\n");
		} else {
			Ti.API.warn("TiFtp: You are not connected to the FTP server");
		}
	},
	handle: function(_event) {
		var responseCode = _event.data.toString().substr(0,3);
		
		switch(responseCode) {
			case "150":
				Ti.API.info("TiFtp: Writing file");
				TiFtp.dataSocket.write(TiFtp.data);
				TiFtp.dataSocket.close();
				break;
			case "220":
				Ti.API.info("TiFtp: Logging in");
				TiFtp.socket.write("USER " + TiFtp.config.user + "\n", _event.from);
				break;
			case "221":
				Ti.API.info("TiFtp: Disconnected");
				TiFtp.socket.close();
				TiFtp.dataSocket.close();
				break;
			case "226":
				Ti.API.info("TiFtp: File upload complete");
				TiFtp.data = null;
				TiFtp.socket.write("PASV\n");
				break;
			case "227":
				Ti.API.info("TiFtp: Passive mode entered");
				var port = TiFtp.getPort(_event.data.toString());
				TiFtp.connectData(port);
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
	},
	errorRead: function(_event) {
		Ti.API.warn("TiFtp: Socket read error");
	},
	errorWrite: function(_event) {
		Ti.API.warn("TiFtp: Socket write error");
	}
};