define([
    'text!src/markup/app.htm',
    'cssLoader',
    'handlebars'
], function (appMarkup, cssLoader, handlebars) {
    'use strict';

    var templates = {
        content : handlebars.compile(appMarkup)
    };

    cssLoader('src/css/app.css');
    
    return {
        render : function () {
            var content = templates.content();
            document.querySelector('body').innerHTML = content;
        }
    };
});
