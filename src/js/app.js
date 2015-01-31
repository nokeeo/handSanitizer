define([
    'text!src/markup/app.htm',
    'sampleHands',
    'cssLoader',
    'handlebars'
], function (appMarkup, sampleHands, cssLoader, handlebars) {
    'use strict';

    var templates = {
        content : handlebars.compile(appMarkup)
    };

    cssLoader('src/css/app.css');
    
    return {
        render : function () {
            var content = templates.content();
            document.querySelector('body').innerHTML = content;

            require(['src/js/util/handParsers/carbon'], function (carbon) {
                var hand = carbon(sampleHands.carbon);

                console.log(hand);
                console.log(hand.metadata.date.format());
            });
        }
    };
});
