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
        },
        vpip : function (stats) {
            return (stats.VPIP) / (stats.HANDS);
        },
        net : function (stats) {
            return getFloatAmount('' + _.reduce(stats.NET, function (memo, val) {
                return memo + val;
            }, 0));
        }
    };

    var getCalculatedStats = function (stats) {
        var calculated = {};
        _.each(stats, function (statistics, player) {
            calculated[player] = {
                aggressionFactor : calc.aggroFactor(statistics),
                aggressionFrequency : calc.aggroFrequency(statistics),
                vpip : calc.vpip(statistics),
                net : calc.net(statistics)
            };
        });

        return calculated;
    };

    var getBlankPlayerStats = function () {
        return {
            BET : 0,
            RAISE : 0,
            ALL_IN : 0,
            CALL : 0,
            FOLD : 0,
            HANDS : 0,
            VPIP : 0,
            NET : []
        };
    };

    var getPlayerNameFromEvent = function (hand, event) {
        return hand.metadata.players.seats[event.player].name;
    };

    var getFloatAmount = function (amount) {
        return parseFloat(parseFloat(amount).toFixed(3));
    };

    var getStatsFromHands = function (hands) {
        var stats = {};

        _.each(hands, function (hand) {
            _.each(hand.metadata.players.seats, function (seat) {
                if (!stats[seat.name])
                    stats[seat.name] = getBlankPlayerStats();

                if (seat.dealtIn) stats[seat.name].HANDS++;
            });

            var winner;
            var amounts = {};
            var vpip = {};
            _.each(hand.metadata.players.seats, function (seat) {
                vpip[seat.name] = false;
                amounts[seat.name] = 0;
            });

            _.each(hand.rounds, function (roundData, round) {
                if (round === 'BLINDS') {
                    _.each(roundData.events, function (event) {
                        var player = getPlayerNameFromEvent(hand, event);
                        amounts[player] -= getFloatAmount(event.amount);
                    });
                } else if (round === 'END_OF_GAME' || round === 'END_OF_FOLDED_GAME') {
                    _.each(roundData.winners, function (winner) {
                        var player = getPlayerNameFromEvent(hand, winner);
                        amounts[player] += getFloatAmount(winner.amount);
                    });
                } else {
                    _.each(roundData.events, function (event) {
                        var player = getPlayerNameFromEvent(hand, event);

                        if (_.contains(['BET', 'RAISE', 'CALL', 'ALL_IN'],
                                event.type)) {
                            vpip[player] = true;
                            amounts[player] -= getFloatAmount(event.amount);
                        }

                        stats[player][event.type]++;
                    });
                }
            });

            _.each(hand.metadata.players.seats, function (seat) {
                if (vpip[seat.name]) stats[seat.name].VPIP++;
                stats[seat.name].NET.push(amounts[seat.name]);
            });
        });

        return getCalculatedStats(stats);
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
