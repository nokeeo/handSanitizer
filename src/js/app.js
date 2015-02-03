define([
    'text!src/markup/app.htm',
    'sampleHands',
    'statsEngine',
    'cssLoader',
    'handlebars'
], function (appMarkup, sampleHands, statsEngine, cssLoader, handlebars) {
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
                var hands = carbon(sampleHands.carbon.multiple);

                console.log(statsEngine({
                    '1.00/2.00' : hands
                }));
            });
        }
    };
});
