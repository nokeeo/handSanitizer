define([
    'underscore',
    'moment'
], function (_, moment) {
    'use strict';

    return function (carbonHandXML) {
        var xml;

        if (window.DOMParser) {
            var parser = new window.DOMParser();
            xml = parser.parseFromString(carbonHandXML, 'text/xml');
        } else {
            // IE
            xml = new ActiveXObject('Microsoft.XMLDOM');
            xml.async = false;
            xml.loadXML(carbonHandXML);
        }

        var gameXmlElement = xml.getElementsByTagName('game')[0];

        var hand = {},
            handData = gameXmlElement.getAttribute('data');

        var dataStringTableNameRegex = /([A-Z][a-z]+)/;

        hand.metadata = {
            id : gameXmlElement.getAttribute('id'),
            numHoleCards : gameXmlElement.getAttribute('numholecards'),
            stakes : gameXmlElement.getAttribute('stakes'),
            seats : gameXmlElement.getAttribute('seats'),
            realMoney : gameXmlElement.getAttribute('realmoney'),
            date : moment(gameXmlElement.getAttribute('starttime'),
                'YYYYMMDDHHmmss'),
            tableName : handData.match(dataStringTableNameRegex)[0],
            version : gameXmlElement.getAttribute('version')
        };

        var playersXml =
            gameXmlElement.getElementsByTagName('players')[0];

        hand.metadata.players = {
            dealer : parseInt(playersXml.getAttribute('dealer')),
            seats : _.map(playersXml.getElementsByTagName('player'),
                function (playerXml) {
                    return {
                        name : playerXml.getAttribute('nickname'),
                        balance : playerXml.getAttribute('balance'),
                        dealtIn : playerXml.getAttribute('dealtin') === 'true'
                    };
                })
        }

        return hand;
    };
});
