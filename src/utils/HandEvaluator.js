// Texas Hold'em Hand Evaluator - Rewritten for reliability
export class HandEvaluator {
    constructor() {
        this.cardValues = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
        };
        
        this.handRanks = {
            'high_card': 1,
            'pair': 2,
            'two_pair': 3,
            'three_of_a_kind': 4,
            'straight': 5,
            'flush': 6,
            'full_house': 7,
            'four_of_a_kind': 8,
            'straight_flush': 9,
            'royal_flush': 10
        };
    }

    // Evaluate a player's hand (hole cards + community cards)
    evaluateHand(holeCards, communityCards) {
        const allCards = [...holeCards, ...communityCards];
        const bestHand = this.findBestHand(allCards);
        
        return {
            rank: bestHand.rank,
            rankName: bestHand.rankName,
            cards: bestHand.cards,
            score: bestHand.score
        };
    }

    // Find the best 5-card hand from 7 cards
    findBestHand(cards) {
        console.log('HandEvaluator: Finding best hand from cards:', cards.map(c => `${c.value} of ${c.suit}`));
        
        // Generate all possible 5-card combinations
        const combinations = this.generateCombinations(cards, 5);
        let bestHand = null;
        let bestScore = 0;

        console.log(`HandEvaluator: Generated ${combinations.length} 5-card combinations`);

        for (let i = 0; i < combinations.length; i++) {
            const combination = combinations[i];
            const handRank = this.rankHand(combination);
            
            if (handRank.score > bestScore) {
                bestScore = handRank.score;
                bestHand = handRank;
                console.log(`HandEvaluator: New best hand found (combination ${i + 1}):`, {
                    cards: combination.map(c => `${c.value} of ${c.suit}`),
                    rank: handRank.rankName,
                    score: handRank.score
                });
            }
        }

        console.log('HandEvaluator: Final best hand:', bestHand);
        return bestHand;
    }

    // Generate all combinations of n cards from a set of cards
    generateCombinations(cards, n) {
        if (n === 0) return [[]];
        if (cards.length === 0) return [];

        const combinations = [];
        
        // Recursive function to generate combinations
        const generate = (start, current) => {
            if (current.length === n) {
                combinations.push([...current]);
                return;
            }
            
            for (let i = start; i < cards.length; i++) {
                current.push(cards[i]);
                generate(i + 1, current);
                current.pop();
            }
        };
        
        generate(0, []);
        return combinations;
    }

    // Rank a 5-card hand
    rankHand(cards) {
        // Sort cards by value (highest first)
        const sortedCards = [...cards].sort((a, b) => 
            this.cardValues[b.value] - this.cardValues[a.value]
        );

        // Count card values
        const valueCounts = {};
        for (const card of cards) {
            valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
        }
        
        // Get counts and values sorted by frequency and value
        const counts = Object.values(valueCounts).sort((a, b) => b - a);
        const values = Object.keys(valueCounts).sort((a, b) => 
            this.cardValues[b] - this.cardValues[a]
        );

        // Check for flush
        const isFlush = cards.every(card => card.suit === cards[0].suit);
        
        // Check for straight
        const isStraight = this.isStraight(sortedCards);

        // Determine hand rank
        let rank, rankName;

        if (isFlush && isStraight) {
            if (sortedCards[0].value === 'ace' && sortedCards[4].value === '10') {
                rank = this.handRanks.royal_flush;
                rankName = 'Royal Flush';
            } else {
                rank = this.handRanks.straight_flush;
                rankName = 'Straight Flush';
            }
        } else if (counts[0] === 4) {
            rank = this.handRanks.four_of_a_kind;
            rankName = 'Four of a Kind';
        } else if (counts[0] === 3 && counts[1] === 2) {
            rank = this.handRanks.full_house;
            rankName = 'Full House';
        } else if (isFlush) {
            rank = this.handRanks.flush;
            rankName = 'Flush';
        } else if (isStraight) {
            rank = this.handRanks.straight;
            rankName = 'Straight';
        } else if (counts[0] === 3) {
            rank = this.handRanks.three_of_a_kind;
            rankName = 'Three of a Kind';
        } else if (counts[0] === 2 && counts[1] === 2) {
            rank = this.handRanks.two_pair;
            rankName = 'Two Pair';
        } else if (counts[0] === 2) {
            rank = this.handRanks.pair;
            rankName = 'Pair';
        } else {
            rank = this.handRanks.high_card;
            rankName = 'High Card';
        }

        // Calculate score based on hand type
        const score = this.calculateScore(rank, rankName, sortedCards, valueCounts, values);

        return {
            rank,
            rankName,
            cards: sortedCards,
            score
        };
    }

    // Calculate score for hand comparison
    calculateScore(rank, rankName, sortedCards, valueCounts, values) {
        let score = rank * 1000000; // Base score from hand rank

        switch (rankName) {
            case 'Royal Flush':
                score += 1000000000;
            case 'Straight Flush':
                score += 1000000000;
                case 'Four of a Kind':
                    // Four value first, then kicker
                    const fourValue = values[0];
                    const kicker = values[1];
                    score += this.cardValues[fourValue] * 10000;
                    score += this.cardValues[kicker] * 1000;
                    score += 1000000000;
                    case 'Full House':
                        // Three value first, then pair value
                        const threeValue = values[0];
                        const pairValue = values[1];
                        score += this.cardValues[threeValue] * 10000;
                        score += this.cardValues[pairValue] * 1000;
                        score += 1000000000;
                        case 'Flush':
            case 'Straight':
                score += 1000000000;
                case 'Three of a Kind':
                    // Three value first, then kickers
                    const threeVal = values[0];
                    const kickers = values.slice(1);
                    score += this.cardValues[threeVal] * 10000;
                    for (let i = 0; i < kickers.length; i++) {
                        score += this.cardValues[kickers[i]] * Math.pow(100, 1 - i);
                    }
                    score += 1000000000;
                    case 'Two Pair':
                        // Higher pair, lower pair, then kicker
                        const higherPair = values[0];
                        const lowerPair = values[1];
                        const kickerCard = values[2];
                        score += this.cardValues[higherPair] * 10000;
                        score += this.cardValues[lowerPair] * 1000;
                        score += this.cardValues[kickerCard] * 100;
                        score += 1000000000;
        
                    case 'Pair':
                        // Pair value first, then kickers
                        const pairVal = values[0];
                        const pairKickers = values.slice(1);
                        score += this.cardValues[pairVal] * 10000;
                        for (let i = 0; i < pairKickers.length; i++) {
                            score += this.cardValues[pairKickers[i]] * Math.pow(100, 2 - i);
                        }
                        score += 1000000000;
            case 'High Card':
                // Use all cards in order
                for (let i = 0; i < sortedCards.length; i++) {
                    score += this.cardValues[sortedCards[i].value] * Math.pow(100, 4 - i);
                }
                break;




        }

        return score;
    }

    // Check if cards form a straight
    isStraight(cards) {
        const values = cards.map(card => this.cardValues[card.value]);
        
        // Remove duplicates and sort
        const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
        
        // Need exactly 5 unique values for a straight
        if (uniqueValues.length !== 5) {
            return false;
        }
        
        // Check if values are consecutive
        for (let i = 0; i < uniqueValues.length - 1; i++) {
            if (uniqueValues[i] - uniqueValues[i + 1] !== 1) {
                return false;
            }
        }
        
        return true;
    }

    // Compare two hands and return the winner
    compareHands(hand1, hand2) {
        if (hand1.score > hand2.score) {
            return 1; // hand1 wins
        } else if (hand1.score < hand2.score) {
            return -1; // hand2 wins
        } else {
            return 0; // tie
        }
    }

    // Get hand description for display
    getHandDescription(hand) {
        return hand.rankName;
    }

    // Get hand strength (0-1) for AI decision making
    getHandStrength(hand) {
        // Normalize hand rank to 0-1 scale
        const maxRank = this.handRanks.royal_flush;
        return hand.rank / maxRank;
    }
} 
 
