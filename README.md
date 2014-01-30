Blister
=============

A Node JS Framework for creating end to end application platform APIs for ArcGIS Server.

Blister is bassed heavily on Drywall, a website and user system for Node.js. Drywall's mantra: What you create with Drywall is more important than Drywall. [Check out the project](https://github.com/jedireza/drywall). They have lots of useful info in their [docs](https://github.com/jedireza/drywall/wiki).

[![Dependency Status](https://david-dm.org/DavidSpriggs/Blister.png)](https://david-dm.org/DavidSpriggs/Blister)
[![devDependency Status](https://david-dm.org/DavidSpriggs/Blister/dev-status.png)](https://david-dm.org/DavidSpriggs/Blister#info=devDependencies)


Technology
------------

| On The Server | On The Client  | Development |
| ------------- | -------------- | ----------- |
| Express       | Bootstrap      | Grunt       |
| Jade          | Backbone.js    | Bower       |
| Mongoose      | jQuery         |             |
| Passport      | Underscore.js  |             |
| Async         | Font-Awesome   |             |
| EmailJS       | Moment.js      |             |

Live Demos
------------

| Platform                       | Username | Password |
| ------------------------------ | -------- | -------- |
|  |      |    |
|  |      |   |
|  |      |   |

__Note:__ The live demos have been modified so you cannot change the root user, the root user's linked Administrator role or the root Admin Group. This was done in order to keep the app ready to test at all times.

Requirements
------------

You need [Node.js](http://nodejs.org/download/) and [MongoDB](http://www.mongodb.org/downloads) installed and running.

We use [Grunt](http://gruntjs.com/) as our task runner. Get the CLI (command line interface).

```bash
$ npm install grunt-cli -g
```

We use [Bower](http://bower.io/) as our front-end package manager. Get the CLI (command line interface).

```bash
$ npm install bower -g
```


Installation
------------

```bash
$ git clone git@github.com:jedireza/drywall.git && cd ./drywall
$ npm install && bower install
$ mv ./config.example.js ./config.js #set mongodb and email credentials
$ grunt
```

Setup
------------

You need a few records in the database to start using the user system.

Run these commands on mongo. __Obviously you should use your email address.__

```js
use blister;
db.admingroups.insert({ _id: 'root', name: 'Root' });
db.admins.insert({ name: {first: 'Root', last: 'Admin', full: 'Root Admin'}, groups: ['root'] });
var rootAdmin = db.admins.findOne();
db.users.save({ username: 'root', isActive: 'yes', email: 'your@email.addy', roles: {admin: rootAdmin._id} });
var rootUser = db.users.findOne();
rootAdmin.user = { id: rootUser._id, name: rootUser.username };
db.admins.save(rootAdmin);
```

Now just use the reset password feature to set a password.

 - `http://localhost:3000/login/forgot/`
 - Submit your email address and wait a second.
 - Go check your email and get the reset link.
 - `http://localhost:3000/login/reset/:email/:token/`
 - Set a new password.

Login. Customize. Enjoy.

Philosophy
------------

 - Create a website and user system.
 - Write code in a simple and consistent way.
 - Only create minor utilities or plugins to avoid repetitiveness.
 - Find and use good tools.
 - Use tools in their native/default behavior.

Features
------------

 - Basic front end web pages.
 - Contact page has form to email.
 - Login system with forgot password and reset password.
 - Signup and Login with ArcGIS, Facebook, Twitter and GitHub.
 - Optional email verification during signup flow.
 - User system with separate account and admin roles.
 - Admin groups with shared permission settings.
 - Administrator level permissions that override group permissions.
 - Global admin quick search component.

License
------------

MIT
