'use strict';

const fs = require('fs');

// This should be the default amount of money users have..
// Ideally, this should be zero.
const DEFAULT_AMOUNT = 0;

// define database >eslint
const Sb = require('origindb')('config/sb');

// define moneyName + moneyPlural fot eslint
const moneyName = 'Credits';
const moneyPlural = 'Credits';
global.moneyName = 'Credits';
global.moneyPlural = 'Credits';

/**
 * Gets an amount and returns the amount with the name of the money.
 *
 * @examples
 * currencyName(0); // 0 bucks
 * currencyName(1); // 1 buck
 * currencyName(5); // 5 bucks
 *
 * @param {Number} amount
 * @returns {String}
 */
function currencyName(amount) {
	let name = "Credits";
	return amount === 1 ? name : name + "s";
}

/**
 * Checks if the money input is actually money.
 *
 * @param {String} money
 * @return {String|Number}
 */
function isMoney(money) {
	let numMoney = Number(money);
	if (isNaN(money)) return "Must be a number.";
	if (String(money).includes('.')) return "Cannot contain a decimal.";
	if (numMoney < 1) return "Cannot be less than one Soul Dew.";
	return numMoney;
}

let shop = [
	['Fix', 'Buys the ability to alter your current custom avatar or trainer card.', 5],
	['Kick', 'Kick a user from the chatroom.', 5],
	['Bucks Ticket', 'Exchange for 10 bucks.', 20],
	['Big Bucks Ticket', 'Exchange for 50 bucks.', 80],
	['Pack Ticket', 'Exchange for 1 psgo pack.', 15],
	['Large Pack Ticket', 'Exchange for 5 psgo packs', 70],
	['Room Voice', 'Exchange for market place room voice rank.', 500],
	['Custom PM Box', 'Exchange for custom pm box ( must supply your own code ).', 5000],
];

let shopDisplay = getShopDisplay(shop);

/**
 * Displays the shop
 *
 * @param {Array} shop
 * @return {String} display
 */
function getShopDisplay(shop) {
	let display = "<center><img src='https://images.cooltext.com/5068029.png'></center><br><div' + (!this.isOfficial ? ' class=infobox-limited' : '') + '><table style='background: #e60073; border-color: #000; border-radius: 6px' border='1' cellspacing='0' cellpadding='5' width='100%'>" +
		"<tbody><tr><th><font color=#FFF face=courier>Item</font></th><th><font color=#FFF face=courier>Description</font></th><th><font color=#FFF face=courier>Price</font></th></tr>";
	let start = 0;
	while (start < shop.length) {
		display += "<tr>" +
			"<td align='center'><button name='send' style='background: #b30047; border-radius: 5px; border: solid, 1px, #000; font-size: 11px; padding: 5px 10px' value='/market buy " + shop[start][0] + "'><font color=#fff face=courier><b>" + shop[start][0] + "</b></font></button>" + "</td>" +
			"<td align='center'><font color=#fff face=courier>" + shop[start][1] + "</font></td>" +
			"<td align='center'><font color=#fff face=courier>" + shop[start][2] + "</font></td>" +
			"</tr>";
		start++;
	}
	display += "</tbody></table></div><br><center><font color=#000 face=courier>To buy an item from the shop, use /market buy <em>Item</em>.</font></center>";
	return display;
}

let Credits = global.Credits = {
	/**
 	* Reads the specified user's money.
 	* If they have no money, DEFAULT_AMOUNT is returned.
 	*
 	* @param {String} userid
 	* @param {Function} callback
 	* @return {Function} callback
 	*/
	readCredit: function (userid, callback) {
		if (typeof callback !== 'function') {
			throw new Error("Credits.readCredit: Expected callback parameter to be a function, instead received " + typeof callback);
		}

		// In case someone forgot to turn `userid` into an actual ID...
		userid = toId(userid);

		let amount = Sb('money').get(userid, DEFAULT_AMOUNT);
		return callback(amount);
	},
	/**
 	* Writes the specified amount of money to the user's "bank."
 	* If a callback is specified, the amount is returned through the callback.
 	*
 	* @param {String} userid
 	* @param {Number} amount
 	* @param {Function} callback (optional)
 	* @return {Function} callback (optional)
 	*/
	writeCredit: function (userid, amount, callback) {
		// In case someone forgot to turn `userid` into an actual ID...
		userid = toId(userid);

		// In case someone forgot to make sure `amount` was a Number...
		amount = Number(amount);
		if (isNaN(amount)) {
			throw new Error("Credits.writeCredit: Expected amount parameter to be a Number, instead received " + typeof amount);
		}

		let curTotal = Sb('money').get(userid, DEFAULT_AMOUNT);
		Sb('money').set(userid, curTotal + amount);
		let newTotal = Sb('money').get(userid);

		if (callback && typeof callback === 'function') {
			// If a callback is specified, return `newTotal` through the callback.
			return callback(newTotal);
		}
	},
	writeCreditArr: function (users, amount) {
		this.writeCredit(users[0], amount, () => {
			users.splice(0, 1);
			if (users.length > 0) this.writeCreditArr(users, amount);
		});
	},
	logCredit: function (message) {
		if (!message) return false;
		fs.appendFile('logs/credits-log.log', '[' + new Date().toUTCString() + '] ' + message + '\n');
	},
};

function findItem(item, money) {
	let len = shop.length;
	let price = 0;
	let amount = 0;
	while (len--) {
		if (item.toLowerCase() !== shop[len][0].toLowerCase()) continue;
		price = shop[len][2];
		if (price > money) {
			amount = price - money;
			this.errorReply("You don't have you enough credits for this. You need " + amount + currencyName(amount) + " more to buy " + item + ".");
			return false;
		}
		return price;
	}
	this.errorReply(item + " not found in shop.");
}

function handleBoughtItem(item, user, cost) {
	if (item === 'symbol') {
		user.canCustomSymbol = true;
		this.sendReply("You have purchased a custom symbol. You can use /customsymbol to get your custom symbol.");
		this.sendReply("You will have this until you log off for more than an hour.");
		this.sendReply("If you do not want your custom symbol anymore, you may use /resetsymbol to go back to your old symbol.");
	} else if (item === 'icon') {
		this.sendReply('You purchased an icon, contact an administrator to obtain the article.');
	} else {
		let msg = `**${user.name} has bought ${item}.**`;
		Monitor.log(`${msg}`);
		Users.users.forEach(function (user) {
			if (user.group === '~' || user.group === '&' || user.group === '@') {
				user.send(`|pm|~Credits Master|${user.getIdentity()}|${msg}`);
			}
		});
	}
}

exports.commands = {
	market: 'mp',
	mp: {
		atm: function (target, room, user) {
			if (!target) target = user.name;
			if (!this.runBroadcast()) return;
			let userid = toId(target);
			if (userid.length < 1) return this.sendReply("/market atm - Please specify a user.");
			if (userid.length > 19) return this.sendReply("/market atm - [user] can't be longer than 19 characters.");
			Credits.readCredit(userid, money => {
				this.sendReplyBox(WL.nameColor(target, true) + " has " + money + ((money === 1) ? " " + moneyName + "." : " " + moneyPlural + "."));
			});
		},
		givecredit: 'givecredits',
		givecredits: function (target, room, user) {
			if (room.id !== 'marketplace') return this.errorReply('this command can only be used in market place room.');
			if (!this.can('forcewin')) return false;
			if (!target || target.indexOf(',') < 0) return this.parse('/help givecredits');
			let parts = target.split(',');
			let username = parts[0];
			let amount = isMoney(parts[1]);
			if (typeof amount === 'string') return this.errorReply(amount);
			let total = Sb('money').set(toId(username), Sb('money').get(toId(username), 0) + amount).get(toId(username));
			amount = amount + currencyName(amount);
			total = total + currencyName(total);
			this.sendReply(username + " was given " + amount + ". " + username + " now has " + total + ".");
			if (Users.get(username)) Users(username).popup(user.name + " has given you " + amount + ". You now have " + total + ".");
			Credits.logCredit(username + " was given " + amount + " by " + user.name + ". " + username + " now has " + total);
		},

		takecredit: 'takecredits',
		takecredits: function (target, room, user) {
			if (room.id !== 'marketplace') return this.errorReply('this command can only be used in market place room.');
			if (!this.can('forcewin')) return false;
			if (!target || target.indexOf(',') < 0) return this.parse('/help takecredits');
			let parts = target.split(',');
			let username = parts[0];
			let amount = isMoney(parts[1]);
			if (typeof amount === 'string') return this.errorReply(amount);
			let total = Sb('money').set(toId(username), Sb('money').get(toId(username), 0) - amount).get(toId(username));
			amount = amount + currencyName(amount);
			total = total + currencyName(total);
			this.sendReply(username + " lost " + amount + ". " + username + " now has " + total + ".");
			if (Users.get(username)) Users(username).popup(user.name + " has taken " + amount + " from you. You now have " + total + ".");
			Credits.logCredit(username + " had " + amount + " taken away by " + user.name + ". " + username + " now has " + total);
		},
		transfercredit: 'transfercredits',
		transfercredits: function (target, room, user) {
			if (room.id !== 'marketplace') return this.errorReply('this command can only be used in market place room');
			if (!target || target.indexOf(',') < 0) return this.parse('/help transfercredits');
			let parts = target.split(',');
			let username = parts[0];
			let uid = toId(username);
			let amount = isMoney(parts[1]);
			if (toId(username) === user.userid) return this.errorReply("You cannot transfer to yourself.");
			if (username.length > 19) return this.errorReply("Username cannot be longer than 19 characters.");
			if (typeof amount === 'string') return this.errorReply(amount);
			if (amount > Sb('money').get(user.userid, 0)) return this.errorReply("You cannot transfer more coins than what you have.");
			Sb('money')
				.set(user.userid, Sb('money').get(user.userid) - amount)
				.set(uid, Sb('money').get(uid, 0) + amount);
			let userTotal = Sb('money').get(user.userid) + currencyName(Sb('money').get(user.userid));
			let targetTotal = Sb('money').get(uid) + currencyName(Sb('money').get(uid));
			amount = amount + currencyName(amount);
			this.sendReply("You have successfully transferred " + amount + ". You now have " + userTotal + ".");
			if (Users.get(username)) Users(username).popup(user.name + " has transferred " + amount + ". You now have " + targetTotal + ".");
			Credits.logCredit(user.name + " transferred " + amount + " to " + username + ". " + user.name + " now has " + userTotal + " and " + username + " now has " + targetTotal + ".");
		},

		log: 'logs',
		logs: function (target, room, user) {
			if (room.id !== 'marketplace') return this.errorReply('this command can only be used in market place room.');
			if (!this.can('forcewin')) return false;
			if (!target) return this.sendReply("Usage: /market logs [number] to view the last x lines OR /creditslog [text] to search for text.");
			let word = false;
			if (isNaN(Number(target))) word = true;
			let lines = fs.readFileSync('logs/credits-log.log', 'utf8').split('\n').reverse();
			let output = '';
			let count = 0;
			let regex = new RegExp(target.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");
			if (word) {
				output += 'Displaying last 50 lines containing "' + target + '":\n';
				for (let line in lines) {
					if (count >= 50) break;
					if (!~lines[line].search(regex)) continue;
					output += lines[line] + '\n';
					count++;
				}
			} else {
				if (target > 100) target = 100;
				output = lines.slice(0, (lines.length > target ? target : lines.length));
				output.unshift("Displaying the last " + (lines.length > target ? target : lines.length) + " lines:");
				output = output.join('\n');
			}
			user.popup("|wide|" + output);
		},

		shop: function (target, room, user) {
			if (room.id !== 'marketplace') return this.errorReply('this command can only be used in market place room.');
			if (!this.runBroadcast()) return;
			return this.sendReply("|raw|" + shopDisplay);
		},

		buy: 'purchase',
		purchase: function (target, room, user) {
			if (room.id !== 'marketplace') return this.errorReply('this command can only be used in market place room.');
			if (!target) return this.parse('/help ms');
			let amount = Sb('money').get(user.userid, 0);
			let cost = findItem.call(this, target, amount);
			if (!cost) return;
			let total = Sb('money').set(user.userid, amount - cost).get(user.userid);
			this.sendReply("You have bought " + target + " for " + cost + currencyName(cost) + ". You now have " + total + currencyName(total) + " left.");
			room.addRaw(user.name + " has bought <strong>" + target + "</strong> from the shop.");
			Credits.logCredit(user.name + " has bought " + target + " from the shop. This user now has " + total + currencyName(total) + ".");
			handleBoughtItem.call(this, target.toLowerCase(), user, cost);
		},

		ladder: function (target, room, user) {
			if (!target) target = 100;
			target = Number(target);
			if (isNaN(target)) target = 100;
			if (!this.runBroadcast()) return;
			let keys = Object.keys(Sb("money").object()).map(function (name) {
				return {name: name, money: Sb("money").get(name)};
			});
			if (!keys.length) return this.sendReplyBox("Coins ladder is empty.");
			keys.sort(function (a, b) { return b.money - a.money; });
			this.sendReplyBox(rankLadder('Richest Users', moneyPlural, keys.slice(0, target), 'money') + '</div>');
		},

		resetcredit: 'resetcredits',
		resetcredits: function (target, room, user) {
			if (!this.can('forcewin')) return false;
			Sb('money').set(toId(target), 0);
			this.sendReply(target + " now has 0 credits.");
			Credits.logCredit(user.name + " reset the credits of " + target + ".");
		},

		economy: function (target, room, user) {
			if (!this.runBroadcast()) return;
			const users = Object.keys(Sb('money').object());
			const total = users.reduce(function (acc, cur) {
				return acc + Sb('money').get(cur);
			}, 0);
			let average = Math.floor(total / users.length) || '0';
			let output = "There " + (total > 1 ? "are " : "is ") + total + currencyName(total) + " circulating in the Credits. ";
			output += "The average user has " + average + currencyName(average) + ".";
			this.sendReplyBox(output);
		},
	},

	givecreditshelp: ['/market givecredits [user], [amount] - Give user a certain amount of coins.'],

	takecreditshelp: ['/market takecredits [user], [amount] - Take a certain amount of coins from a user.'],

	transfercreditshelp: ['/market transfercredits [user], [amount] - Transfer a certain amount of coins to a user.'],

	mshelp: ['/market buy [item] - Buys item from shop.'],
};
