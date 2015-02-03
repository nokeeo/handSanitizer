define([
    'underscore'
], function (_) {
    'use strict';

    var calc = {
        aggroFactor : function (stats) {
            return (stats.BET + stats.RAISE) / stats.CALL;
        },
        aggroFrequency : function (stats) {
            return (stats.BET + stats.RAISE) / (stats.BET + stats.RAISE + stats.CALL + stats.FOLD);
        }
    };

    var getStatsFromHands = function (hands) {
        var stats = {};

        _.each(hands, function (hand) {
            _.each(hand.rounds, function (roundData, round) {
                if (round !== 'BLINDS' && round !== 'PREFLOP') {
                    _.each(roundData.events, function (event) {
                        var player = hand.metadata.players.seats[event.player].name;
                        if (!stats[player]) stats[player] = {
                            BET : 0,
                            RAISE : 0,
                            CALL : 0,
                            FOLD : 0
                        };

                        // TODO currently ignoring ALL_IN
                        stats[player][event.type]++;
                    });
                }
            });
        });

        var calculated = {};
        _.each(stats, function (statistics, player) {
            calculated[player] = {
                aggressionFactor : calc.aggroFactor(statistics),
                aggressionFrequency : calc.aggroFrequency(statistics)
            };
        });

        return calculated;
    };

    return function (handHistory) {
        // handHistory format
        // {
        //     '0.02/0.04' : [
        //         { hand },
        //         { hand },
        //         ...
        //     ],
        //     '0.25/0.50' : [
        //         ...
        //     ]
        //     ...
        // }

        var stats = {};

        _.each(handHistory, function (hands, stakes) {
            stats[stakes] = getStatsFromHands(hands);
        });

        return stats;
    };
});
