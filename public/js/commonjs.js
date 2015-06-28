/***
 * ServerCollectionClass class.
 * @param {Obj} serverObject the represents our server
 */
function ServerCollectionClass(server) {
    var serverList = [];
    var totalStorage = 0; //Total storage in MB that is fetched by looping through all disks client side
    var totalWindowsSystemStorage = 0; //Total storage in MB that is fetched by looping through all disks client side

    if (server) serverList.push(server);
    return {
        addServer: function (newServer) {
            if (newServer) {
                serverList.push(newServer);
                totalStorage += Math.ceil(newServer.TotalStorage / 1024 / 1024);
                totalWindowsSystemStorage += Math.ceil(newServer.TotalSystemStorage / 1024 / 1024);
            }
        },
        getServers: function () {
            return serverList;
        },
        getServer: function (serverName) {
            function filterByName(serverFromList, name) {
                return serverFromList.Name == name;
            }
            return serverList.filter(filterByName, serverName);
        },
        getTotalStorage: function () {
            return totalStorage;
        },
        getTotalWindowsSystemStorage: function () {
            return totalWindowsSystemStorage;
        }
    };
};
/***
 * isFunction function.
 * @param {function} functionToCheck represents the variable we want to know if is a function
 */
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}