$(document).ready(function () {
    $('#goDataUsageList').click(function (e) {
        e.preventDefault();
        var url = encodeURI(window.location.protocol + "//" + window.location.host + "/");
        window.location = url;
    });
    $('#goGroupAdmin').click(function (e) {
        e.preventDefault();
        var url = encodeURI(window.location.protocol + "//" + window.location.host + "/GroupAdmin");
        window.location = url;
    });
    $('#goAdvancedFilter').click(function (e) {
        e.preventDefault();
        var url = encodeURI(window.location.protocol + "//" + window.location.host + "/AdvancedFilter");
        window.location = url;
    });

    var currentUrl = document.URL;
    var nextMenu, previousMenu;
    if (currentUrl.split('/')[(currentUrl.split('/')).length - 1] == "" || currentUrl.split('/')[(currentUrl.split('/')).length - 1] == window.location.host) {
        unboldAllMenuItems();
        $('#goDataUsageList').css('font-weight', 'bold');
        nextMenu = "GroupAdmin";
        previousMenu = "AdvancedFilter";
        calculateNextMenuButton(nextMenu, previousMenu);
    }
    if (currentUrl.split('/')[(currentUrl.split('/')).length - 1] == "GroupAdmin") {
        unboldAllMenuItems();
        $('#goGroupAdmin').css('font-weight', 'bold');
        nextMenu = "AdvancedFilter";
        previousMenu = "";
        calculateNextMenuButton(nextMenu, previousMenu);
    }
    if (currentUrl.split('/')[(currentUrl.split('/')).length - 1] == "AdvancedFilter") {
        unboldAllMenuItems();
        $('#goAdvancedFilter').css('font-weight', 'bold');
        nextMenu = "";
        previousMenu = "GroupAdmin";
        calculateNextMenuButton(nextMenu, previousMenu);
    }
});
function calculateNextMenuButton(next, previous) {
    $('#nextMenuButton').click(function (e) {
        e.preventDefault();
        if (!$('#nextMenuButton').parent().hasClass('disabled')) {
            var url = encodeURI(window.location.protocol + "//" + window.location.host + "/" + next);
            window.location = url;
        }
        return false;
    });
    $('#prevMenuButton').click(function (e) {
        e.preventDefault();
        if (!$('#prevMenuButton').parent().hasClass('disabled')) {
            var url = encodeURI(window.location.protocol + "//" + window.location.host + "/" + previous);
            window.location = url;
        }
        return false;
    });
}
/***
 * unboldAllMenuItems function.
 */
function unboldAllMenuItems() {
    $('.dropdown-menu > li > a').css('font-weight', 'normal');
}
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
 * @param {obj} appModule represents the angular module we want to use a different set of brackets
 */
function setAngularBracket(appModule) {
    appModule.config(function($interpolateProvider) {
      $interpolateProvider.startSymbol('{[{');
      $interpolateProvider.endSymbol('}]}');
    });
}
/***
 * togglePanelSelection function.
 * @param {element} represents the div tag where we are going to change the css display
 */
function togglePanelSelection(element) {
    if($(element).hasClass("alert-info")) $(element).removeClass("alert alert-info");
    else $(element).addClass("alert alert-info").css('padding', '0px').css('margin-bottom', '0px');
}