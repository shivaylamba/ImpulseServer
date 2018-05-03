'use strict';
//Useless Commands
exports.commands = {
	s: 'spank',
	spank: function (target, room, user) {
		if (!target) return this.sendReply('/spank needs a target.');
		this.parse('/me spanks ' + target + '!');
	},
	punt: function (target, room, user) {
		if (!target) return this.sendReply('/punt needs a target.');
		this.parse('/me punts ' + target + ' to the moon!');
	},
	crai: 'cry',
	cry: function (target, room, user) {
		this.parse('/me starts tearbending dramatically like Katara~!');
	},
	dk: 'dropkick',
	dropkick: function (target, room, user) {
		if (!target) return this.sendReply('/dropkick needs a target.');
		this.parse('/me dropkicks ' + target + ' across the Pok\u00E9mon Stadium!');
	},
	fart: function (target, room, user) {
		if (!target) return this.sendReply('/fart needs a target.');
		this.parse('/me farts on ' + target + '\'s face!');
	},
	poke: function (target, room, user) {
		if (!target) return this.sendReply('/poke needs a target.');
		this.parse('/me pokes ' + target + '.');
	},
	mt: 'mktour',
	mktour: function (target, room, user) {
		if (!target) return this.errorReply("Usage: /mktour [tier] - creates a tournament in single elimination.");
		target = toId(target);
		let t = target;
		if (t === 'rb') t = 'randombattle';
		if (t === 'cc1v1' || t === 'cc1vs1') t = 'challengecup1v1';
		if (t === 'randmono' || t === 'randommonotype') t = 'monotyperandombattle';
		if (t === 'mono') t = 'monotype';
		if (t === 'ag') t = 'anythinggoes';
		if (t === 'ts') t = 'tiershift';
		this.parse('/tour create ' + t + ', elimination');
	},
	pic: 'image',
	image: function (target, room, user) {
		if (!target) return this.sendReply('/image [url] - Shows an image using /a. Requires ~.');
		this.parse('/a |raw|<center><img src="' + target + '">');
	},
	halloween: function (target, room, user) {
		if (!target) return this.sendReply('/halloween needs a target.');
		this.parse('/me takes ' + target + '\'s pumpkin and smashes it all over the Pok\u00E9mon Stadium!');
	},
	barn: function (target, room, user) {
		if (!target) return this.sendReply('/barn needs a target.');
		this.parse('/me has barned ' + target + ' from the entire server!');
	},
	lick: function (target, room, user) {
		if (!target) return this.sendReply('/lick needs a target.');
		this.parse('/me licks ' + target + ' excessively!');
	},
	rsi: 'roomshowimage',
	roomshowimage: function (target, room, user) {
		if (!this.can('ban', null, room)) return false;
		if (!target) return this.parse('/help roomshowimage');
		let parts = target.split(',');
		if (!this.runBroadcast()) return;
		this.sendReplyBox("<img src=" + parts[0] + " width=" + parts[1] + " height=" + parts[1]);
	},
	staffdeclare: 'moddeclare',
	modmsg: 'moddeclare',
	declaremod: 'moddeclare',
	moddeclare: function (target, room, user) {
		if (!target) return this.parse('/help moddeclare');
		if (!this.can('declare', null, room)) return this.errorReply("/moddeclare - Access Denied.");
		if (!this.canTalk()) return;
		let declareHTML = Chat.html`<div class="broadcast-red"><i>Private Staff Message (Driver+) from ${user.name}:</i><br /><strong>${target}</strong></div>`;
		this.privateModCommand(`|raw|${declareHTML}`);
		this.logModCommand(`${user.name} mod declared ${target}`);
	},
	moddeclarehelp: ["/declaremod [message] - Displays a red [message] to all authority in the respected room.  Requires * # & ~"],
	ks: 'kickserver',
	kickserver: function (target, room, user) {
		if (!this.can('ban')) return this.errorReply("/kickserver [username] - Access Denied.");
		if (!target) return this.parse('/help kickserver');
		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (target.length > 19) return this.errorReply("' User" + this.targetUsername + "' not found.");
		if (!targetUser) return this.errorReply("User '" + this.targetUsername + "'not found.");
		this.addModAction(targetUser.name + " was kicked from the server by " + user.name + ".");
		targetUser.disconnectAll();
	},
	kickserverhelp: ["/kickserver OR /ks [username] - kick an user from the server. Requires: @ & ~"],
};
