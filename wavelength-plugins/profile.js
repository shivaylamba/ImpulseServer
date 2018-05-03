/****************************************************************************
 * Profiles for Pokemon Showdown											*
 * Displays to users a profile of a given user.								*
 * For order's sake:														*
 * - vip, dev, custom title, friend code, and profile were placed in here.	*
 * Updated and restyled by Mystifi and Insist								*
 * Main Profile credit goes out to panpawn/jd/other contributors.			*
 ****************************************************************************/

'use strict';

let geoip = require('geoip-lite-country');

// fill your server's IP in your config.js for exports.serverIp
let serverIp = Config.serverIp;

function isDev(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let dev = Sb("devs").get(toId(user));
	if (dev === 1) return true;
	return false;
}

function isVIP(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let vip = Sb("vips").get(toId(user));
	if (vip === 1) return true;
	return false;
}

function showTitle(userid) {
	userid = toId(userid);
	if (Sb("titles").has(userid)) {
		return '<font color="' + Sb("titles").get(userid)[1] +
			'">(<strong>' + Sb("titles").get(userid)[0] + '</strong>)</font>';
	}
	return '';
}

function devCheck(user) {
	if (isDev(user)) return '<font color="#009320">(<strong>Developer</strong>)</font>';
	return '';
}

function vipCheck(user) {
	if (isVIP(user)) return '<font color="#6390F0">(<strong>VIP User</strong>)</font>';
	return '';
}

function showBadges(user) {
	if (Db.userBadges.has(toId(user))) {
		let badges = Db.userBadges.get(toId(user));
		let css = 'border:none;background:none;padding:0;';
		if (typeof badges !== 'undefined' && badges !== null) {
			let output = '<td><div style="float: right; background: rgba(69, 76, 80, 0.4); text-align: center; border-radius: 12px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2) inset; margin: 0px 3px;">';
			output += ' <table style="' + css + '"> <tr>';
			for (let i = 0; i < badges.length; i++) {
				if (i !== 0 && i % 4 === 0) output += '</tr> <tr>';
				output += '<td><button style="' + css + '" name="send" value="/badges info, ' + badges[i] + '">' +
				'<img src="' + Db.badgeData.get(badges[i])[1] + '" height="16" width="16" alt="' + badges[i] + '" title="' + badges[i] + '" >' + '</button></td>';
			}
			output += '</tr> </table></div></td>';
			return output;
		}
	}
	return '';
}

exports.commands = {
	dev: {
		give: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isDev(devUsername)) return this.errorReply(devUsername + " is already a DEV user.");
			Sb("devs").set(devUsername, 1);
			this.sendReply('|html|' + WL.nameColor(devUsername, true) + " has been given DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("|html|You have been given DEV status by " + WL.nameColor(user.name, true) + ".");
		},

		take: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isDev(devUsername)) return this.errorReply(devUsername + " isn't a DEV user.");
			Sb("devs").delete(devUsername);
			this.sendReply("|html|" + WL.nameColor(devUsername, true) + " has been demoted from DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("|html|You have been demoted from DEV status by " + WL.nameColor(user.name, true) + ".");
		},

		users: 'list',
		list: function () {
			if (!Sb("devs").keys().length) return this.errorReply('There seems to be no user with DEV status.');
			let display = [];
			Sb("devs").keys().forEach(devUser => {
				display.push(WL.nameColor(devUser, (Users(devUser) && Users(devUser).connected)));
			});
			this.popupReply('|html|<strong><u><font size="3"><center>DEV Users:</center></font></u></strong>' + display.join(','));
		},

		'': 'help',
		help: function () {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/dev</code> commands.<br />These commands are nestled under the namespace <code>dev</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> DEV status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s DEV status. Requires: & ~' +
				'<br />' +
				'<code>list</code>: Shows the list of users with DEV Status.' +
				'</div>'
			);
		},
	},

	vip: {
		give: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isVIP(vipUsername)) return this.errorReply(vipUsername + " is already a VIP user.");
			Sb("vips").set(vipUsername, 1);
			this.sendReply("|html|" + WL.nameColor(vipUsername, true) + " has been given VIP status.");
			if (Users.get(vipUsername)) Users(vipUsername).popup("|html|You have been given VIP status by " + WL.nameColor(user.name, true) + ".");
		},

		take: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isVIP(vipUsername)) return this.errorReply(vipUsername + " isn't a VIP user.");
			Sb("vips").delete(vipUsername);
			this.sendReply("|html|" + WL.nameColor(vipUsername, true) + " has been demoted from VIP status.");
			if (Users.get(vipUsername)) Users(vipUsername).popup("|html|You have been demoted from VIP status by " + WL.nameColor(user.name, true) + ".");
		},

		users: 'list',
		list: function (target, room, user) {
			if (!Sb("vips").keys().length) return this.errorReply('There seems to be no user with VIP status.');
			let display = [];
			Sb("vips").keys().forEach(vipUser => {
				display.push(WL.nameColor(vipUser, (Users(vipUser) && Users(vipUser).connected)));
			});
			this.popupReply('|html|<strong><u><font size="3"><center>VIP Users:</center></font></u></strong>' + display.join(','));
		},

		'': 'help',
		help: function (target, room, user) {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/vip</code> commands.<br />These commands are nestled under the namespace <code>vip</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> VIP status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s VIP status. Requires: & ~' +
				'<br />' +
				'<code>list</code>: Shows list of users with VIP Status' +
				'</div>'
			);
		},
	},

	title: 'customtitle',
	customtitle: {
		set: 'give',
		give: function (target, room, user) {
			if (!this.can('ban')) return false;
			target = target.split(',');
			if (!target || target.length < 3) return this.parse('/help', true);
			let userid = toId(target[0]);
			let targetUser = Users.getExact(userid);
			let title = target[1].trim();
			if (Sb("titles").has(userid) && Sb("titlecolors").has(userid)) {
				return this.errorReply(userid + " already has a custom title.");
			}
			let color = target[2].trim();
			if (color.charAt(0) !== '#') return this.errorReply("The color needs to be a hex starting with '#'.");
			Sb("titles").set(userid, [title, color]);
			if (Users.get(targetUser)) {
				Users(targetUser).popup(
					'|html|You have received a custom title from ' + WL.nameColor(user.name, true) + '.' +
					'<br />Title: ' + showTitle(toId(targetUser)) +
					'<br />Title Hex Color: ' + color
				);
			}
			Monitor.log(user.name + " set a custom title to " + userid + "'s profile.");
			return this.sendReply("Title '" + title + "' and color '" + color + "' for " + userid + "'s custom title have been set.");
		},

		delete: 'remove',
		take: 'remove',
		remove: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help', true);
			let userid = toId(target);
			if (!Sb("titles").has(userid) && !Sb("titlecolors").has(userid)) {
				return this.errorReply(userid + " does not have a custom title set.");
			}
			Sb("titlecolors").delete(userid);
			Sb("titles").delete(userid);
			if (Users.get(userid)) {
				Users(userid).popup(
					'|html|' + WL.nameColor(user.name, true) + " has removed your custom title."
				);
			}
			Monitor.log(user.name + " removed " + userid + "'s custom title.");
			return this.sendReply(userid + "'s custom title and title color were removed from the server memory.");
		},

		'': 'help',
		help: function (target, room, user) {
			if (!user.autoconfirmed) return this.errorReply("You need to be autoconfirmed to use this command.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(
				'<center><code>/customtitle</code> commands<br />' +
				'All commands are nestled under the namespace <code>customtitle</code>.</center>' +
				'<hr width="100%">' +
				'- <code>[set|give] [username], [title], [hex color]</code>: Sets a user\'s custom title. Requires: & ~' +
				'- <code>[take|remove|delete] [username]</code>: Removes a user\'s custom title and erases it from the server. Requires: & ~'
			);
		},
	},

	favoritetype: 'type',
	type: {
		add: "set",
		set: function (target, room, user) {
			if (!target) return this.parse("/help type");
			let type = Dex.getType(target);
			if (!type.exists) return this.errorReply('Not a type. Check your spelling?');
			Sb("type").set(user.userid, toId(type));
			return this.sendReply("You have successfully set your Favorite Type onto your profile.");
		},

		del: "delete",
		remove: "delete",
		delete: function (target, room, user) {
			if (!Sb("type").has(user.userid)) return this.errorReply("Your Favorite Type hasn't been set.");
			Sb("type").delete(user.userid);
			return this.sendReply("Your Favorite Type has been deleted from your profile.");
		},

		"": "help",
		help: function (target, room, user) {
			this.parse('/help type');
		},
	},
	typehelp: [
		"/type set [type] - Sets your Favorite Type.",
		"/type delete - Removes your Favorite Type.",
	],

	profilecolor: 'pcolor',
	pcolor: {
		set: 'add',
		add: function (target, room, user) {
			if (!target) return this.parse('/pcolor help');
			let color = target.trim();
			if (color.charAt(0) !== '#') return this.errorReply("The color needs to be a hex starting with '#'.");
			Sb('profilecolor').set(user, color);
			this.sendReply('You have set your profile color to:');
			this.parse('/profile ' + user + '');
		},

		// For staff
		forceset: 'forceadd',
		forceadd: function (target, room, user) {
			if (!this.can('ban')) return this.errorReply('You need to be @ or higher go use this command.');
			if (!target || target.length < 3) return this.parse('/pcolor help');
			target = target.split(',');
			let targetUser = target[0].trim();
			let color = target[1].trim();
			if (color.charAt(0) !== '#') return this.errorReply("The color needs to be a hex starting with '#'.");
			Sb('profilecolor').set(targetUser, color);
			if (Users.get(targetUser)) {
				Users(targetUser).popup('|html|You have received profile color from ' + WL.nameColor(user.name, true) + '.' +
										'<br />Profile Hex Color: ' + color);
			}
			this.sendReply('You have set profile color of ' + targetUser);
		},

		delete: 'remove',
		remove: function (target, room, user) {
			if (!this.can('ban')) return this.errorReply('You need to be @ or higher to use this command.');
			let userid = (toId(target));
			if (!target) return this.parse('/pcolor help');
			if (!Sb('profilecolor').has(userid)) {
				return this.errorReply(userid + " does not have a profile color set.");
			}
			Sb('profilecolor').delete(userid);
			if (Users.get(userid)) {
				Users(userid).popup(
					'|html|' + WL.nameColor(user.name, true) + " has removed your profile color.");
			}
			this.sendReply('You have removed ' + userid + '\'s profile color');
		},

		'': 'help',
		help: function (target, room, user) {
			if (!user.autoconfirmed) return this.errorReply("You need to be autoconfirmed to use this command.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(
				'<center><code>/customtitle</code> commands<br />' +
				'All commands are nestled under the namespace <code>pcolor</code>.</center>' +
				'<hr width="100%">' +
				'- <code>[set|add] [hex color]</code>: set your profile color.<br>' +
				'- <code>[forceset|forceadd] [username], [hex color]</code>: Sets a user\'s profile color. Requires: @ or higher.<br>' +
				'- <code>[remove|delete] [username]</code>: Removes a user\'s profile color and erases it from the server. Requires: @ or higher.<br>' +
				'<center><b>Coded By:</b> <a href="https://github.com/AllianceSky-PS"><u>Prince Sky</u></a></center>'
			);
		},
	},

	pteam: 'profileteam',
	profileteam: {
		add: 'set',
		set: function (target, room, user) {
			if (!Sb("hasteam").has(user.userid)) return this.errorReply('You don\'t have access to edit your team.');
			if (!target) return this.parse('/profileteam help');
			let parts = target.split(',');
			let mon = parts[1].trim();
			let slot = parts[0];
			if (!parts[1]) return this.parse('/profileteam help');
			let acceptable = ['one', 'two', 'three', 'four', 'five', 'six'];
			if (!acceptable.includes(slot)) return this.parse('/profileteam help');
			if (slot === 'one' || slot === 'two' || slot === 'three' || slot === 'four' || slot === 'five' || slot === 'six') {
				Sb("teams").set([user.userid, slot], mon);
				this.sendReply('You have added this pokemon to your team.');
			}
		},

		give: function (target, room, user) {
			if (!this.can('broadcast')) return false;
			if (!target) return this.parse('/profileteam help');
			let targetId = toId(target);
			Sb("hasteam").set(targetId, 1);
			this.sendReply(`${target} has been given the ability to set their team.`);
			Users(targetId).popup('You have been given the ability to set your profile team.');
		},

		take: function (target, room, user) {
			if (!this.can('broadcast')) return false;
			if (!target) return this.parse('/profileteam help');
			if (!Sb("hasteam").has(user)) return this.errorReply(`${target} does not have the ability to set their team.`);
			Sb("hasteam").delete(user);
			return this.sendReply(`${target} has had their ability to change their team away.`);
		},

		'': 'help',
		help: function (target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				'<center><strong>Profile Team Commands</strong><br />' +
				'All commands are nestled under namespace <code>pteam</code></center><br />' +
				'<hr width="100%">' +
				'<code>add (slot), (dex number)</code>: The dex number must be the actual dex number of the pokemon you want.<br />' +
				'Slot - we mean what slot you want the pokemon to be. valid entries for this are: one, two, three, four, five, six.<br />' +
				'Chosing the right slot is crucial because if you chose a slot that already has a pokemon, it will overwrite that data and replace it. This can be used to replace / reorder what pokemon go where.<br />' +
				'If the Pokemon is in the first 99 Pokemon, do 0(number), and for Megas do (dex number)-m, -mx for mega , -my for mega Y.<br>' +
				'For example: Mega Venusaur would be 003-m<br />' +
				'<code>give</code>: Global staff can give user\'s ability to set their own team.<br />' +
				'<code>take</code>: Global staff can take user\'s ability to set their own team.<br />' +
				'<code>help</code>: Displays this command.'
			);
		},
	},

	pbg: 'profilebackground',
	profilebackground: {
		set: 'setbg',
		setbackground: 'setbg',
		setbg: function (target, room, user) {
			if (!this.can('ban')) return false;
			let parts = target.split(',');
			if (!parts[1]) return this.parse('/backgroundhelp');
			let targ = parts[0].toLowerCase().trim();
			let link = parts[1].trim();
			Sb("backgrounds").set(targ, link);
			this.sendReply('This user\'s background has been set to : ');
			this.parse(`/profile ${targ}`);
		},

		removebg: 'deletebg',
		remove: 'deletebg',
		deletebackground: 'deletebg',
		takebg: 'deletebg',
		take: 'deletebg',
		delete: 'deletebg',
		deletebg: function (target, room, user) {
			if (!this.can('ban')) return false;
			let targ = target.toLowerCase();
			if (!target) return this.parse('/backgroundhelp');
			if (!Sb("backgrounds").has(targ)) return this.errorReply('This user does not have a custom background.');
			Sb("backgrounds").delete(targ);
			return this.sendReply('This user\'s background has been deleted.');
		},

		'': 'help',
		help: function (target, room, user) {
			this.parse("/backgroundhelp");
		},
	},
	backgroundhelp: [
		"/pbg set [user], [link] - Sets the user's profile background.",
		"/pbg delete [user] - Removes the user's profile background.",
	],

	music: 'pmusic',
	pmusic: {
		add: "set",
		give: "set",
		set: function (target, room, user) {
			if (!this.can('lock')) return false;
			let parts = target.split(',');
			let targ = parts[0].toLowerCase().trim();
			if (!parts[2]) return this.errorReply('/musichelp');
			let link = parts[1].trim();
			let title = parts[2].trim();
			Db.music.set(targ, {'link': link, 'title': title});
			this.sendReply(`${targ}'s song has been set to: `);
			this.parse(`/profile ${targ}`);
		},

		take: "delete",
		remove: "delete",
		delete: function (target, room, user) {
			if (!this.can('lock')) return false;
			let targ = target.toLowerCase();
			if (!target) return this.parse('/musichelp');
			if (!Db.music.has(targ)) return this.errorReply('This user does not have any music on their profile.');
			Db.music.remove(targ);
			return this.sendReply('This user\'s profile music has been deleted.');
		},

		'': 'help',
		help: function (target, room, user) {
			this.parse('/musichelp');
		},
	},
	musichelp: [
		"/music set [user], [link], [title of song] - Sets a user's profile music.",
		"/music take [user] - Removes a user's profile music.",
	],

	pokemon: {
		add: "set",
		set: function (target, room, user) {
			if (!target) return this.parse("/pokemonhelp");
			let pkmn = Dex.getTemplate(target);
			if (!pkmn.exists) return this.errorReply('Not a Pokemon. Check your spelling?');
			Sb("pokemon").set(user.userid, pkmn.species);
			return this.sendReply("You have successfully set your Pokemon onto your profile.");
		},

		del: "delete",
		remove: "delete",
		delete: function (target, room, user) {
			if (!Sb("pokemon").has(user.userid)) return this.errorReply("Your favorite Pokemon hasn't been set.");
			Sb("pokemon").delete(user.userid);
			return this.sendReply("Your favorite Pokemon has been deleted from your profile.");
		},

		"": "help",
		help: function (target, room, user) {
			this.parse('/pokemonhelp');
		},
	},
	pokemonhelp: [
		"/pokemon set [Pokemon] - Sets your Favorite Pokemon.",
		"/pokemon delete - Removes your Favorite Pokemon.",
	],

	'!profile': true,
	profile: function (target, room, user) {
		target = toId(target);
		if (!target) target = user.name;
		if (target.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
		if (!this.runBroadcast()) return;
		let self = this;
		let targetUser = Users.get(target);
		//let online = (targetUser ? targetUser.connected : false);
		let username = (targetUser ? targetUser.name : target);
		let userid = (targetUser ? targetUser.userid : toId(target));
		let avatar = (targetUser ? (isNaN(targetUser.avatar) ? "http://" + serverIp + ":" + Config.port + "/avatars/" + targetUser.avatar : "http://play.pokemonshowdown.com/sprites/trainers/" + targetUser.avatar + ".png") : (Config.customavatars[userid] ? "http://" + serverIp + ":" + Config.port + "/avatars/" + Config.customavatars[userid] : "http://play.pokemonshowdown.com/sprites/trainers/1.png"));
		if (targetUser && targetUser.avatar[0] === '#') avatar = 'http://play.pokemonshowdown.com/sprites/trainers/' + targetUser.avatar.substr(1) + '.png';
		let userSymbol = (Users.usergroups[userid] ? Users.usergroups[userid].substr(0, 1) : "Regular User");
		let userGroup = (Config.groups[userSymbol] ? 'Global ' + Config.groups[userSymbol].name : "Regular User");
		showProfile();
		/*let regdate = '(Unregistered)';
		Server.regdate(userid, date => {
			if (date) {
				let d = new Date(date);
				let MonthNames = ["January", "February", "March", "April", "May", "June",
					"July", "August", "September", "October", "November", "December",
				];
				regdate = MonthNames[d.getUTCMonth()] + ' ' + d.getUTCDate() + ", " + d.getUTCFullYear();
			}
			showProfile();
		});*/

		function getLastSeen(userid) {
			if (Users(userid) && Users(userid).connected) return '<font color = "limegreen"><strong>Currently Online</strong></font>';
			let seen = Db.seen.get(userid);
			if (!seen) return '<font color = "red"><strong>Never</strong></font>';
			return Chat.toDurationString(Date.now() - seen, {precision: true}) + " ago.";
		}

		function getFlag(userid) {
			let ip = (Users(userid) ? geoip.lookup(Users(userid).latestIp) : false);
			if (!ip || ip === null) return '';
			return '<img src="http://flags.fmcdn.net/data/flags/normal/' + ip.country.toLowerCase() + '.png" alt="' + ip.country + '" title="' + ip.country + '" width="20" height="10">';
		}

		function showTeam(user) {
			let teamcss = 'float:center;border:none;background:none;';

			let noSprite = '<img src=http://play.pokemonshowdown.com/sprites/bwicons/0.png>';
			let one = Sb("teams").get([user, 'one']);
			let two = Sb("teams").get([user, 'two']);
			let three = Sb("teams").get([user, 'three']);
			let four = Sb("teams").get([user, 'four']);
			let five = Sb("teams").get([user, 'five']);
			let six = Sb("teams").get([user, 'six']);
			if (!Sb("teams").has(user)) return '';

			function iconize(link) {
				return '<button id="kek" style="background:transparent;border:none;"><img src="https://serebii.net/pokedex-sm/icon/' + link + '.png"></button>';
			}

			let teamDisplay = '<center><div style="' + teamcss + '">';
			if (Sb("teams").has([user, 'one'])) {
				teamDisplay += iconize(one);
			} else {
				teamDisplay += noSprite;
			}
			if (Sb("teams").has([user, 'two'])) {
				teamDisplay += iconize(two);
			} else {
				teamDisplay += noSprite;
			}
			if (Sb("teams").has([user, 'three'])) {
				teamDisplay += iconize(three);
			} else {
				teamDisplay += noSprite;
			}
			if (Sb("teams").has([user, 'four'])) {
				teamDisplay += iconize(four);
			} else {
				teamDisplay += noSprite;
			}
			if (Sb("teams").has([user, 'five'])) {
				teamDisplay += iconize(five);
			} else {
				teamDisplay += noSprite;
			}
			if (Sb("teams").has([user, 'six'])) {
				teamDisplay += iconize(six);
			} else {
				teamDisplay += noSprite;
			}

			teamDisplay += '</div></center>';
			return teamDisplay;
		}

		function background(buddy) {
			let bg = Sb("backgrounds").get(buddy);
			if (!Sb("backgrounds").has(buddy)) return '<div>';
			return '<div style="background:url(' + bg + '); background-size: 100% 100%;">';
		}

		function pColor(user) {
			let color = Sb("profilecolor").get(user);
			// default to black
			if (!Sb("profilecolor").has(user)) return '<font color="#000">';
			return '<font color="' + color + '">';
		}

		function pType(user) {
		    let type = Sb("type").get(user);
		    if (!Sb("type").has(user)) return '';
		    return '<img src="https://serebii.net/pokedex-bw/type/' + type + '.gif">';
		}

		function pPokemon(user) {
		    let poke = Sb("pokemon").get(user);
		    if (!Sb("pokemon").has(user)) return '';
		    return '' + poke + '';
		}

		function song(user) {
			if (!Db.music.has(user)) return '';
			let song = Db.music.get(user)['link'];
			let title = Db.music.get(user)['title'];
			return `<acronym title="${title}"><br /><audio src="${song}" controls="" style="width:100%;"></audio></acronym>`;
		}

		function showProfile() {
			Economy.readMoney(toId(username), currency => {
				let profile = ``;
				profile += `${background(toId(username))} ${showBadges(toId(username))}`;
				profile += `<div style="display: inline-block; width: 6.5em; height: 100%; vertical-align: top"><img src="${avatar}" height="80" width="80" align="left"></div>`;
				profile += `<div style="display: inline-block">&nbsp;${pColor(toId(username))}<b>Name:</b></font> ${WL.nameColor(username, true)}&nbsp; ${getFlag(toId(username))} ${showTitle(username)}<br />`;
		    	profile += `&nbsp;${pColor(toId(username))}<b>Group:</b> ${userGroup}</font> ${devCheck(username)} ${vipCheck(username)}<br />`;
				//profile += `&nbsp;${pColor(toId(username))}<b>Registered:</b> ${regdate}</font><br />`;
				profile += `&nbsp;${pColor(toId(username))}<b>${currencyPlural}:</b> ${currency}</font><br />`;
				if (Db.pokemon.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Favorite Pokemon:</b> ${Db.pokemon.get(toId(username))}</font><br />`;
				}
				if (Db.type.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Favorite Type:</b></font> <img src="https://www.serebii.net/pokedex-bw/type/${Db.type.get(toId(username))}.gif"><br />`;
				}
				if (Db.nature.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Nature:</b> ${Db.nature.get(toId(username))}</font><br />`;
				}
				profile += `&nbsp;${pColor(toId(username))}<b>EXP Level:</b> ${WL.level(toId(username))}</font><br />`;
		    	/*if (Server.getFaction(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Faction:</b> ${Server.getFaction(toId(username))}</font><br />`;
				}*/
		    	/*if (online && lastActive(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Last Activity:</b> ${lastActive(toId(username))}</font><br />`;
				}*/
				profile += `&nbsp;${pColor(toId(username))}<b>Last Seen:</b> ${getLastSeen(toId(username))}</font><br />`;
				if (Db.friendcodes.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Friend Code:</b> ${Db.friendcodes.get(toId(username))}</font><br />`;
				}
				profile += `&nbsp;${showTeam(toId(username))}<br />`;
				profile += `&nbsp;${song(toId(username))}<br />`;
				profile += `&nbsp;</div>`;
				profile += `<br clear="all">`;
				self.sendReplyBox(profile);
			});
		}
	},


	profilehelp: [
		"/profile [user] - Shows a user's profile. Defaults to yourself.",
		"/pcolor help - Shows profile color commands.",
		"/pteam help - Shows profile team commands.",
		"/pokemon set [Pokemon] - Set your Favorite Pokemon onto your profile.",
		"/pokemon delete - Delete your Favorite Pokemon from your profile.",
		"/type set [type] - Set your favorite type.",
		"/type delete - Delete your favorite type.",
		"/pmusic [user], [song], [title] - Sets a user's profile song. Requires + or higher.",
		"/pmusic take [user] - Removes a user's profile song. Requires + or higher.",
		"/pbg set [user], [link] - Sets the user's profile background. Requires + or higher.",
		"/pbg delete [user] - Removes the user's profile background. Requires + or higher.",
		"/dev give [user] - Gives a user Dev Status. Requires @ or higher.",
		"/dev take [user] - Removes a user's Dev Status. Requires @ or higher.",
		"/vip give [user] - Gives a user VIP Status. Requires @ or higher.",
		"/vip take [user] - Removes a user's VIP Status. Requires @ or higher.",
	],
};