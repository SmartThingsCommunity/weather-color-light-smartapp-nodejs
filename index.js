const smartApp = require('./smartapp');

module.exports.handle = (event, context, callback) => {
    smartApp.handleLambdaCallback(event, context, callback);
};
