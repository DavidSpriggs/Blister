// create the root user for Blister
// before running this file update the email address and install mogojs:
// npm install mongojs

// config:
var email = 'spriggs.d@gmail.com';

var mongojs = require('mongojs');
var db = mongojs('blister', ['admingroups', 'admins', 'users']);
var rootAdmin, rootUser;

db.admingroups.insert({
	_id: 'root',
	name: 'Root'
}, function(err, doc) {
	db.admins.insert({
		name: {
			first: 'Root',
			last: 'Admin',
			full: 'Root Admin'
		},
		groups: ['root']
	}, function(err, doc) {
		db.admins.findOne(function(err, doc) {
			rootAdmin = doc;
			db.users.save({
				username: 'root',
				isActive: 'yes',
				email: email,
				roles: {
					admin: rootAdmin._id
				}
			}, function(err, doc) {
				rootUser = doc;
				db.users.findOne(function(err, doc) {
					rootAdmin.user = {
						id: rootUser._id,
						name: rootUser.username
					};
					db.admins.save(rootAdmin, function(err, doc) {
						process.exit();
					});
				});
			});
		});
	});
});