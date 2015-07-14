DiskReportWeb
============

Initial Comments
----------------
This system is not complete yet, code is here only for demo purposes!
The system has been installed, developed and tested on Debian 7, and Windows 7.

This web solution uses [DiskReporter](https://github.com/itnifl/DiskReporter) to fetch data, cache it in MongoDB and present it as HTML to the requesting system.

###  The commandments:
	1. All shall be nodeunit tested.
	2. All shall be re-usable.
	
### The project takes in use:
	1. Nodejs as base system.
	2. Various packages for nodejs listed in package.json.
	3. Mongodb for caching

Prerequisites
-------------
DiskReportWeb installation and operation requires that the following software is installed:

	1. npm
	2. Node-gyp and mocha
	3. Node.js 0.8.x or later
	4. Mono 3.4.0 x64 if you are using Linux or .Net 4.5 if you are using Windows
	5. Mongodb server if you want this system to cache results from api(recommended).
	6. [DiskReporter](https://github.com/itnifl/DiskReporter)

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

Compile the newest version of [DiskReporter](https://github.com/itnifl/DiskReporter) as dll files and place under this solutions dll-sources folder. Note that if you do not do this, you will be using the default dll files that come with this solution. These dll files provide only demo data and do not actually connect to any system to fetch data.

After this is done, set up the XML configuration files that are in the same folder as the dll files(dll-sources)
. The setup of these files are self explanatory, and the rules for the XML files are contained in the corresponding xsd files.

For instance:
```
<xsd:element name="SERVER" type="serverConfig" maxOccurs="*" />

```
The serverConfig type refers to:
```
<xsd:complexType name="serverConfig">
	<xsd:sequence>
		<xsd:element name="ADDRESS" type="xsd:string" minOccurs="1" maxOccurs="1"/>
		<xsd:element name="NAME" type="xsd:string" minOccurs="0" maxOccurs="1"/>
		<xsd:element name="USER" type="xsd:string" minOccurs="1" maxOccurs="1"/>
		<xsd:element name="PASSWORD" type="xsd:string" minOccurs="1" maxOccurs="1"/>
	</xsd:sequence>
</xsd:complexType>
```

Thus in the XML file you may write a server tag cluster two or any number of multiple times for every TSM server you want to run the system against:
```
<SERVER>
	<ADDRESS>8.8.8.8</ADDRESS>
	<NAME>TSM01</NAME>
	<USER>tsmChatter</USER>
	<PASSWORD>Pass123</PASSWORD>
</SERVER>
<SERVER>
	<ADDRESS>8.8.8.9</ADDRESS>
	<NAME>TSM02</NAME>
	<USER>tsmChatter</USER>
	<PASSWORD>Pass123</PASSWORD>
</SERVER>
```

When done, create the database DiskReporter as such from the Linux console after connecting to mongodb:

```
mongo DiskReporter
```

Next we want to pre-create the collections we are going to use:
```
use DiskReporter;
db.createCollection("DiskReporterCache")
db.createCollection("DiskReporterGroups")
```


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