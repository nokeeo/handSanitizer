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

        var gameXml = xml.getElementsByTagName('game');
        var hands = [];

        _.each(gameXml, function (handXml) {
            var hand = {},
                handData = handXml.getAttribute('data');

            var dataStringTableNameRegex = /([A-Z][a-z]+)/;

            hand.metadata = {
                id : handXml.getAttribute('id'),
                numHoleCards : handXml.getAttribute('numholecards'),
                stakes : handXml.getAttribute('stakes'),
                seats : handXml.getAttribute('seats'),
                realMoney : handXml.getAttribute('realmoney'),
                date : moment(handXml.getAttribute('starttime'),
                    'YYYYMMDDHHmmss'),
                tableName : handData.match(dataStringTableNameRegex)[0],
                version : handXml.getAttribute('version')
            };

            var playersXml =
                handXml.getElementsByTagName('players')[0];

            hand.metadata.players = {
                dealer : playersXml.getAttribute('dealer'),
                seats : {}
            };
            _.each(playersXml.getElementsByTagName('player'), function (plyr) {
                var seat = plyr.getAttribute('seat');
                hand.metadata.players.seats[seat] = {
                    name : plyr.getAttribute('nickname'),
                    balance : parseFloat(plyr.getAttribute('balance')),
                    dealtIn : plyr.getAttribute('dealtin') === 'true'
                };
            });

            hand.rounds = {};
            _.each(handXml.getElementsByTagName('round'), function (round) {
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
                        player : event.getAttribute('player'),
                        amount : event.getAttribute('amount')
                    });
                });

                _.each(round.getElementsByTagName('cards'), function (cards) {
                    hand.rounds[roundId].cards.push({
                        type : cards.getAttribute('type'),
                        cards : cards.getAttribute('cards').split(','),
                        player : cards.getAttribute('player')
                    });
                });

                if (roundId === 'END_OF_GAME' || roundId === 'END_OF_FOLDED_GAME') {
                    _.each(round.getElementsByTagName('winner'), function (winner) {
                        hand.rounds[roundId].winners.push({
                            amount : parseFloat(winner.getAttribute('amount')),
                            uncalled : winner.getAttribute('uncalled') === 'true',
                            potnumber : parseInt(winner.getAttribute('potnumber')),
                            player : winner.getAttribute('player'),
                            pottype : winner.getAttribute('pottype'),
                            hand : winner.getAttribute('hand')
                        });
                    });
                }
            });

            hands.push(hand);
        });

        return hands;
    };
});
