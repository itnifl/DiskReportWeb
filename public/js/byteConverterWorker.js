function timedCount(amount, bytesBool) {
    postMessage([amount, bytesBool]);
    amount = bytesBool ? amount / 1024 / 1024 : amount * 1024 * 1024;
    bytesBool = bytesBool ? false : true;
    setTimeout('timedCount('+amount+','+bytesBool+')', !bytesBool ? 3300 : 22000);
}

onmessage = function(message) {
  var dataAmount = message.data / 1024 / 1024;
  timedCount(dataAmount, false);
}