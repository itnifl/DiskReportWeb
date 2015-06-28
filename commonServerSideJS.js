/***
 * isFunction function.
 * @param {function} functionToCheck represents the variable we want to know if is a function
 */
exports.isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}