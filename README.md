<<<<<<< HEAD
DiskReportWeb
=======
DiskReportAPI
>>>>>>> 4ff04a27d55890746c025b7d67147d74fb03007f
============

Initial Comments
----------------
This API uses [DiskReporter]https://github.com/itnifl/DiskReporter to fetch data, cache it in MongoDB and present it as JSON to the requesting system.

###  The commandments:
	1. All shall be nodeunit tested.
	2. All shall be re-usable.
	
### The project takes in use:
	1. Nodejs as base system.
	2. Various packages for nodejs listed in package.json.
	3. Mongodb for caching

Prerequisites
-------------
My Movie API installation and operation requires that the following software is installed:

	1. Node.js 0.8.x or later
	2. Node-gyp and mocha
	3. npm
	4. Mono 3.4.0 x64 if you are using Linux or .Net 4.5 if you are using Windows
	5. Mongodb server if you want this system to cache results from api(recommended).

Installing Prerequisites
------------------------
Install node.js and npm using the following command:

Debian: `sudo apt-get install nodejs` RedHat: `sudo yum install npm`

Take a look at these guides for installing mongodb on the system where you run MyMovieAPI:
- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/
- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-red-hat-centos-or-fedora-linux/

For installing the following:
- Node.js v0.10.26 sources, build, and install Node.js x64
- Mono 3.4.0 sources, build, and install Mono x64
- Node-gyp and mocha
- Edge.js sources and build x64 release

This script can be used(Debian):
- https://raw.githubusercontent.com/tjanczuk/edge/master/tools/debian_wheezy_clean_install.sh

Also, please see:
- https://github.com/tjanczuk/edge#building-on-linux

In short:
```
#Prerequisites for below:
apt-get -y install curl g++ pkg-config libgdiplus

#Node-gyp and mocha:
npm install node-gyp -g
npm install mocha -g

#Install Mono:
sudo curl http://download.mono-project.com/sources/mono/mono-3.4.0.tar.bz2 > mono-3.4.0.tar.bz2
sudo tar -xvf mono-3.4.0.tar.bz2
sudo curl https://raw.githubusercontent.com/tjanczuk/edge/master/tools/Microsoft.Portable.Common.targets > ./mono-3.4.0/mcs/tools/xbuild/targets/Microsoft.Portable.Common.targets
cd mono-3.4.0
# see http://stackoverflow.com/questions/15627951/mono-dllnotfound-error
sudo bash -c 'sed -i "s/\@prefix\@\/lib\///g" ./data/config.in'
sudo bash -c './configure --prefix=/usr/local --with-glib=embedded --enable-nls=no'
sudo make
make install
ldconfig

```



When done, create the database movies as such from the Linux console.
`mongo DiskReporterCache`

Installing
----------
Create a new directory for the application and change to it.

`mkdir -p /opt/nodejs/DiskReportWeb && cd $_`

Download the latest stable version from Git with the following command:

`git clone https://github.com/itnifl/DiskReportWeb.git -b master .`

Make sure dependencies are met before you install the modules(Ubuntu):

`apt-get install gcc make build-essential`

Update all dependencies using the following command:

`npm install`

Set up necessary variables by editing config.js.

Start the application using the following command:

`node server.js`


Upgrading
---------
Stop the application.

Update the application from Git using the following command:

`git pull`

Update all dependencies using the following command:

`npm install`

Start the application using the following command:

`node server.js`

Removing
--------
Stop the application.

Delete the top level directory of the application.

Example usage
-------------
To insert into a div tag with ID divField:

```javascript
No info yet
```

### Thank you:
- All package providers

Maintainers
-----------
Current maintainers of the MyMovieApi project:

Atle Holm (atle@team-holm.net)