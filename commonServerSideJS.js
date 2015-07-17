/***
 * isFunction function.
 * @param {function} functionToCheck represents the variable we want to know if is a function
 */
exports.isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
/***
 * fixMyID function.
 * Cleans up a string to be used as an ID
 */
exports.fixMyID = function(id) {
    return id.replace(/\W/g,'_');
}