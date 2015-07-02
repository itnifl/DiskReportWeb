/***
 * ServerCollectionClass class.
 * @param {Obj} initialServer the represents our first server in the list
 */
function ServerCollectionClass(initialServer) {
    var serverList = [];
    var totalStorage = 0; //Total storage in MB that is fetched by looping through all disks client side
    var totalSystemStorage = 0; //Total storage in MB that is fetched by looping through all disks client side

    if (initialServer) serverList.push(initialServer);
    return {
        addServer: function (newServer) {
            if (newServer) {
                serverList.push(newServer);
                totalStorage += Math.ceil(newServer.TotalStorage / 1024 / 1024);
                totalSystemStorage += Math.ceil(newServer.TotalSystemStorage / 1024 / 1024);
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
        getTotalSystemStorage: function () {
            return totalSystemStorage;
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
/***
 * setAngularBracket function.
 * @param {function} appModule represents the angular module we want to use a different set of brackets
 */
function setAngularBracket(appModule) {
    appModule.config(function($interpolateProvider) {
      $interpolateProvider.startSymbol('{[{');
      $interpolateProvider.endSymbol('}]}');
    });
}