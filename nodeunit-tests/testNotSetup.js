var config = require('../config');
var colors = require('colors');
var imageResponse = '';

module.exports = {  
    setUp: function(callback) {
        try {
            console.log('**Running Test Setup'.yellow);
            require('../modelLoader');
            var GetImage = Model.get('GetImage').find(1);
            GetImage.getImage('MV5BMTM4OTI1OTM5NF5BMl5BanBnXkFtZTcwMzk5MTU1Mg@@._V1_SX300.jpg', function(feedback) {                                            
                imageResponse = feedback;
                callback();                   
            }); 
        } catch (err) {
            console.log('**Setting up test failed:'.red, err.message);
        }

    },
    tearDown: function(callback) {
        console.log('**Running Test Teardown'.yellow);
        callback();
    },
    getImage: function(test) {   
            test.expect(1);           
            console.log('**Running tests: '.yellow + '(1)');
            if(config.Debug && imageResponse != '') console.log("**Got response with length: ".yellow + imageResponse.length);

            test.ok(imageResponse.length > 0, "Failed testing that we did not receive an empty result..");   
            test.done();                            
    }
}; 