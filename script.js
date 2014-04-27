//noinspection ThisExpressionReferencesGlobalObjectJS
(function (window, undefined){
    'use strict';

    window.onload = function(){
        var doc  = window.document,
            Math = window.Math,

            displayElement  = doc.getElementById('display'),
            rollFirst       = displayElement.firstElementChild.firstElementChild,
            rollCenter      = Math.ceil(rollFirst.childElementCount / 2) - 1,
            rolls           = displayElement.getElementsByClassName('roll'),
            rollStartTop    = parseInt(window.getComputedStyle(rollFirst, null).top),
            rollCellHigh    = parseInt(window.getComputedStyle(rollFirst.firstElementChild, null).height),
            currentRate     = parseInt(doc.getElementById('rate-value').innerHTML),
            startRolling    = false,

            //cycle vars
            combIndex = 0,
            curCombParams,
            rollIndex = 0,
            roll,

            //global settings
            iterationTime = 50, //mSec
            minRate = 1,
            maxRate = 3,
            randParams = [
                {
                    minTime:  10,
                    maxTime:  20,
                    minShift: 100,
                    maxShift: 160
                },
                {
                    maxTime:  30,
                    maxShift: 220
                },
                {
                    maxTime:  40,
                    maxShift: 280
                }
            ],
            prizeCombinations = [
                {
                    comb: '777',
                    prize: {
                        1: 300,
                        2: 600,
                        3: 1500
                    }
                },
                {
                    comb: '333',
                    prize: 100
                },
                {
                    comb: '222',
                    prize: 50
                },
                {
                    comb: '111',
                    prize: 25
                },
                {
                    comb: /^[123]{3}$/,
                    prize: 5
                },
                {
                    comb: /C/ig,
                    prize: 2
                }

            ],

            getIntRand = function(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            },

            runRoll = function() {
                var rollingParams = [
                        {
                            timeRolling:            0,
                            totalShift:             0,
                            iterationTotalCount:    0,
                            startSpeed:             0,
                            deceleration:           0,
                            currentAdditionalShift: 0,
                            passedShift:            0
                        }
                    ],

                //iterations global vars
                    iterationCurrentNum = 0,
                    maxIterationCount   = 0,
                    timerId,

                //cycle vars
                    prevMinTime,
                    prevMinShift,
                    rollRandParams,
                    curRollingParams,

                    intervalRotator = function(){
                        var currentShift,
                            requiredShift,
                            movedCount,
                            additionalShift,
                            additionalMoved;

                        if (++iterationCurrentNum === maxIterationCount) {
                            window.clearInterval(timerId);
                            window.setTimeout(finishRolling, 1000);
                        }

                        for (rollIndex = 0; rollIndex < rolls.length; rollIndex++) {
                            curRollingParams = rollingParams[rollIndex];
                            roll             = rolls[rollIndex];

                            if (iterationCurrentNum <= curRollingParams.iterationTotalCount) {
                                if (iterationCurrentNum === curRollingParams.iterationTotalCount) {
                                    currentShift = curRollingParams.totalShift;
                                } else {
                                    currentShift = Math.round(
                                        curRollingParams.startSpeed * iterationCurrentNum -
                                            (curRollingParams.deceleration * Math.pow(iterationCurrentNum, 2)) / 2
                                    );
                                }

                                requiredShift = currentShift - curRollingParams.passedShift;

                                if (requiredShift > 0) {
                                    movedCount = Math.floor(requiredShift / rollCellHigh);
                                    additionalShift = requiredShift - movedCount * rollCellHigh +
                                        curRollingParams.currentAdditionalShift;

                                    if (additionalShift > 0) {
                                        if (additionalShift >= rollCellHigh) {
                                            additionalMoved = Math.floor(additionalShift / rollCellHigh);
                                            movedCount += additionalMoved;
                                            additionalShift = additionalShift - additionalMoved * rollCellHigh;
                                        }
                                        roll.style.top =
                                            (rollStartTop +
                                                (curRollingParams.currentAdditionalShift = additionalShift)
                                                ) + 'px';
                                    }

                                    while (movedCount-- > 0) {
                                        roll.insertBefore(roll.lastElementChild, roll.firstElementChild);
                                    }
                                }

                                curRollingParams.passedShift = currentShift;
                            }
                        }
                    };

                if (!startRolling && changeBank()) {
                    for (rollIndex = 0; rollIndex < rolls.length; rollIndex++) {
                        rollingParams[rollIndex] == null && (rollingParams[rollIndex] = {});
                        curRollingParams = rollingParams[rollIndex];
                        rollRandParams   = randParams[rollIndex];

                        prevMinTime = getIntRand(
                            rollRandParams.minTime == null ? prevMinTime + 1 : rollRandParams.minTime,
                            rollRandParams.maxTime
                        );
                        prevMinShift = getIntRand(
                            rollRandParams.minShift == null ? prevMinShift + 1 : rollRandParams.minShift,
                            rollRandParams.maxShift
                        );

                        curRollingParams.timeRolling = prevMinTime * 1000;
                        curRollingParams.totalShift  = rollCellHigh * prevMinShift;

                        curRollingParams.iterationTotalCount = Math.ceil(
                            curRollingParams.timeRolling / iterationTime
                        );
                        if (curRollingParams.iterationTotalCount > maxIterationCount) {
                            maxIterationCount = curRollingParams.iterationTotalCount;
                        }

                        curRollingParams.startSpeed =
                            (2 * curRollingParams.totalShift) / curRollingParams.iterationTotalCount;
                        curRollingParams.deceleration =
                            curRollingParams.startSpeed / curRollingParams.iterationTotalCount;

                        curRollingParams.currentAdditionalShift = 0;
                        curRollingParams.passedShift = 0;
                    }

                    startRolling = true;
                    timerId = window.setInterval(intervalRotator, iterationTime);
                    intervalRotator();
                }
            },
            checkBank = function(rate) {
                var totalScoreEl = doc.getElementById('total-score'),
                    totalScore = parseInt(totalScoreEl.innerHTML);
                if (totalScore >= rate) {
                    return true;
                } else {
                    totalScoreEl.style.color = 'red';
                    return false;
                }
            },
            changeBank = function() {
                var totalScoreEl = doc.getElementById('total-score'),
                    totalScore = parseInt(totalScoreEl.innerHTML),
                    result = false;

                do {
                    if (currentRate > 0) {
                        if ((result = checkBank(currentRate))) {
                            totalScoreEl.innerHTML = totalScore - currentRate;
                            break;
                        }
                    } else {
                        break;
                    }
                } while ((doc.getElementById('rate-value').innerHTML = String(--currentRate)) > 0);

                return result;
            },
            changeRate = function(direction) {
                var rateValueEl = doc.getElementById('rate-value'),
                    rateValue   = parseInt(rateValueEl.innerHTML);

                if (!startRolling) {
                    switch (direction) {
                        case 'up':
                            if (rateValue < maxRate && checkBank(rateValue + 1)) {
                                currentRate = ++rateValue;
                            }
                            break;
                        case 'down':
                            if (rateValue > minRate) {
                                currentRate = --rateValue;
                            }
                            break;
                    }

                    rateValueEl.innerHTML = rateValue;
                }
            },
            finishRolling = function() {
                var result = '',
                    addMultiplier = 1,
                    lastScore = 0,
                    matchResult,
                    totalScoreEl,
                    lastScoreEl = doc.getElementById('last-score'),
                    prize;

                for (rollIndex = 0; rollIndex < rolls.length; rollIndex++) {
                    result += rolls[rollIndex].children[rollCenter].firstElementChild.innerHTML;
                }

                for (combIndex = 0; combIndex < prizeCombinations.length; combIndex++) {
                    curCombParams = prizeCombinations[combIndex];

                    if (curCombParams.comb.source != null) {
                        if (curCombParams.comb.global) {
                            matchResult = result.match(curCombParams.comb);
                            if (matchResult && matchResult.length > 0) {
                                prize = curCombParams.prize;
                                addMultiplier = matchResult.length;
                                break;
                            }
                        } else if (curCombParams.comb.test(result)) {
                            prize = curCombParams.prize;
                            break;
                        }
                    } else {
                        if (result === curCombParams.comb) {
                            prize = curCombParams.prize;
                            break;
                        }
                    }
                }

                if (prize != null) {
                    if (typeof prize === 'number') {
                        lastScore = prize * currentRate * addMultiplier;
                    } else if (prize[currentRate] != null) {
                        lastScore = prize[currentRate] * addMultiplier;
                    }

                    totalScoreEl           = doc.getElementById('total-score');
                    totalScoreEl.innerHTML = parseInt(totalScoreEl.innerHTML) + lastScore;
                    lastScoreEl.innerHTML  = lastScore;

                    checkBank(currentRate) && (totalScoreEl.style.color = 'inherit');
                } else {
                    lastScoreEl.innerHTML = '0';
                }

                startRolling = false;
            };

        doc.getElementById('start-rolling').addEventListener('click', runRoll, true);
        //doc.getElementById('down-rate').addEventListener('click', function(){changeRate('down');}, true);
        doc.getElementById('up-rate').addEventListener('click', function(){changeRate('up');}, true);
        doc.getElementById('max-start').addEventListener(
            'click',
            function() {
                changeRate('up');
                changeRate('up');
                runRoll();
            },
            true
        );
    };
})(this);