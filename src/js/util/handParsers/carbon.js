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

        var gameXml = xml.getElementsByTagName('game')[0];

        var hand = {},
            handData = gameXml.getAttribute('data');

        var dataStringTableNameRegex = /([A-Z][a-z]+)/;

        hand.metadata = {
            id : gameXml.getAttribute('id'),
            numHoleCards : gameXml.getAttribute('numholecards'),
            stakes : gameXml.getAttribute('stakes'),
            seats : gameXml.getAttribute('seats'),
            realMoney : gameXml.getAttribute('realmoney'),
            date : moment(gameXml.getAttribute('starttime'),
                'YYYYMMDDHHmmss'),
            tableName : handData.match(dataStringTableNameRegex)[0],
            version : gameXml.getAttribute('version')
        };

        var playersXml =
            gameXml.getElementsByTagName('players')[0];

        hand.metadata.players = {
            dealer : parseInt(playersXml.getAttribute('dealer')),
            seats : _.map(playersXml.getElementsByTagName('player'),
                function (playerXml) {
                    return {
                        name : playerXml.getAttribute('nickname'),
                        balance : parseFloat(playerXml.getAttribute('balance')),
                        dealtIn : playerXml.getAttribute('dealtin') === 'true'
                    };
                })
        }

        hand.rounds = {};
        _.each(gameXml.getElementsByTagName('round'), function (round) {
            var roundId = round.getAttribute('id');
            hand.rounds[roundId] = {
                events : [],
                cards : [],
                winners : []
            };

            _.each(round.getElementsByTagName('event'), function (event) {
                hand.rounds[roundId].events.push({
                    type : event.getAttribute('type'),
                    timestamp : moment(event.getAttribute('timestamp'), 'x'),
                    player : parseInt(event.getAttribute('player')),
                    amount : event.getAttribute('amount')
                });
            });

            _.each(round.getElementsByTagName('cards'), function (cards) {
                hand.rounds[roundId].cards.push({
                    type : cards.getAttribute('type'),
                    cards : cards.getAttribute('cards').split(','),
                    player : parseInt(cards.getAttribute('player'))
                });
            });

            if (roundId === 'END_OF_GAME' || roundId === 'END_OF_FOLDED_GAME') {
                _.each(round.getElementsByTagName('winner'), function (winner) {
                    hand.rounds[roundId].winners.push({
                        amount : parseFloat(winner.getAttribute('amount')),
                        uncalled : winner.getAttribute('uncalled') === 'true',
                        potnumber : parseInt(winner.getAttribute('potnumber')),
                        player : parseInt(winner.getAttribute('player')),
                        pottype : winner.getAttribute('pottype'),
                        hand : winner.getAttribute('hand')
                    });
                });
            }
        });

        

        return hand;
    };
});
