document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const cardsContainer = document.getElementById('cards-container');
    const dealButton = document.getElementById('deal-btn');
    const solutionButton = document.getElementById('solution-btn');
    const solutionContainer = document.getElementById('solution-container');
    const answerInput = document.getElementById('answer-input');
    const checkButton = document.getElementById('check-btn');
    const resultDiv = document.getElementById('result');
    const noFaceCardsCheckbox = document.getElementById('no-face-cards');
    
    // Card data
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const suitSymbols = {
        'hearts': '♥',
        'diamonds': '♦',
        'clubs': '♣',
        'spades': '♠'
    };
    
    // Current game state
    let currentCards = [];
    let currentValues = [];
    
    // Create a deck of cards based on game mode
    function createDeck() {
        const deck = [];
        const noFaceCards = noFaceCardsCheckbox.checked;
        const maxValue = noFaceCards ? 10 : 13;
        
        for (let suit of suits) {
            for (let value = 1; value <= maxValue; value++) {
                deck.push({ value, suit });
            }
        }
        return deck;
    }
    
    // Shuffle the deck using Fisher-Yates algorithm
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    // Deal new cards
    function dealCards() {
        // Clear previous cards and results
        cardsContainer.innerHTML = '';
        solutionContainer.style.display = 'none';
        resultDiv.style.display = 'none';
        answerInput.value = '';
        answerInput.blur(); // Remove focus from input field on mobile
        
        currentCards = [];
        currentValues = [];
        
        // Create and shuffle a new deck
        const deck = shuffleDeck(createDeck());
        
        // Take the first 4 cards from the shuffled deck
        for (let i = 0; i < 4; i++) {
            const card = deck[i];
            currentCards.push(card);
            currentValues.push(card.value);
            
            // Create card element
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.suit}`;
            
            // Display card value
            let displayValue;
            if (card.value === 1) {
                displayValue = 'A';
            } else if (card.value === 11) {
                displayValue = 'J';
            } else if (card.value === 12) {
                displayValue = 'Q';
            } else if (card.value === 13) {
                displayValue = 'K';
            } else {
                displayValue = card.value;
            }
            
            cardElement.innerHTML = `
                <div class="value">${displayValue}</div>
                <div class="suit">${suitSymbols[card.suit]}</div>
            `;
            
            cardsContainer.appendChild(cardElement);
        }
        
        // Try to find a solution
        findSolution(currentValues);
    }
    
    // Find a solution using the 4 cards
    function findSolution(values) {
        const operations = ['+', '-', '*', '/'];
        const solutions = [];
        
        // Helper function to evaluate an expression
        function evaluate(expr) {
            try {
                return Function('"use strict";return (' + expr + ')')();
            } catch (e) {
                return null;
            }
        }
        
        // Try all possible permutations of the 4 values
        function permute(arr, result = []) {
            if (arr.length === 0) {
                // Try all possible combinations of operations
                for (let op1 of operations) {
                    for (let op2 of operations) {
                        for (let op3 of operations) {
                            // Try different groupings with parentheses
                            const expressions = [
                                `(${result[0]} ${op1} ${result[1]}) ${op2} (${result[2]} ${op3} ${result[3]})`,
                                `((${result[0]} ${op1} ${result[1]}) ${op2} ${result[2]}) ${op3} ${result[3]}`,
                                `(${result[0]} ${op1} (${result[1]} ${op2} ${result[2]})) ${op3} ${result[3]}`,
                                `${result[0]} ${op1} ((${result[1]} ${op2} ${result[2]}) ${op3} ${result[3]})`,
                                `${result[0]} ${op1} (${result[1]} ${op2} (${result[2]} ${op3} ${result[3]}))`,
                                // Additional groupings
                                `${result[0]} ${op1} (${result[1]} ${op2} ${result[2]} ${op3} ${result[3]})`,
                                `(${result[0]} ${op1} ${result[1]} ${op2} ${result[2]}) ${op3} ${result[3]}`
                            ];
                            
                            for (const expr of expressions) {
                                const value = evaluate(expr);
                                if (value !== null && value === 24) {
                                    solutions.push(expr);
                                }
                            }
                        }
                    }
                }
                return;
            }
            
            for (let i = 0; i < arr.length; i++) {
                const current = arr.slice();
                const next = current.splice(i, 1);
                permute(current, result.concat(next));
            }
        }
        
        permute(values);
        
        // Store the solutions
        if (solutions.length > 0) {
            solutionContainer.innerHTML = `
                <h3>Possible Solutions:</h3>
                <ul>
                    ${solutions.slice(0, 5).map(sol => `<li>${sol} = 24</li>`).join('')}
                </ul>
            `;
        } else {
            solutionContainer.innerHTML = '<p>No solution found for these cards. Try dealing new ones!</p>';
        }
        
        // Always enable the solution button
        solutionButton.disabled = false;
    }
    
    // Check if the user's answer is correct
    function checkAnswer() {
        const userAnswer = answerInput.value.trim();
        
        if (!userAnswer) {
            showResult(false, "Please enter your solution.");
            return;
        }
        
        // Extract all numbers from the user's answer
        const numbersInAnswer = userAnswer.match(/\d+/g);
        
        // Check if all 4 card values are used
        const cardValuesUsed = currentValues.slice().sort().toString();
        const userValuesUsed = numbersInAnswer ? 
            numbersInAnswer.map(n => parseInt(n)).filter(n => n >= 1 && n <= 13).sort().toString() : "";
        
        if (userValuesUsed !== cardValuesUsed) {
            showResult(false, "You must use all four card values exactly once.");
            return;
        }
        
        // Evaluate the expression
        try {
            // Replace card names with values if needed
            let processedAnswer = userAnswer
                .replace(/A/gi, '1')
                .replace(/J/gi, '11')
                .replace(/Q/gi, '12')
                .replace(/K/gi, '13');
            
            const result = Function('"use strict";return (' + processedAnswer + ')')();
            
            if (result === 24) {
                showResult(true, "Correct! Your solution equals exactly 24.");
            } else {
                showResult(false, `Your solution equals ${result}, not exactly 24.`);
            }
        } catch (e) {
            showResult(false, "Invalid expression. Please check your syntax.");
        }
    }
    
    // Display result message
    function showResult(isCorrect, message) {
        resultDiv.className = isCorrect ? 'result correct' : 'result incorrect';
        resultDiv.textContent = message;
        resultDiv.style.display = 'block';
    }
    
    // Function to handle virtual keyboard issues on mobile
    function handleInputFocus() {
        // On mobile, scroll to make sure the input is visible
        if (window.innerWidth <= 600) {
            setTimeout(() => {
                answerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    // Event listeners
    dealButton.addEventListener('click', dealCards);
    
    solutionButton.addEventListener('click', () => {
        solutionContainer.style.display = 'block';
    });
    
    checkButton.addEventListener('click', checkAnswer);
    
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
            // On mobile, blur the input to hide keyboard after submission
            if (window.innerWidth <= 600) {
                answerInput.blur();
            }
        }
    });
    
    // Handle focus events for better mobile experience
    answerInput.addEventListener('focus', handleInputFocus);
    
    // Add touch events for cards to make them more interactive on mobile
    cardsContainer.addEventListener('touchstart', (e) => {
        if (e.target.closest('.card')) {
            e.target.closest('.card').classList.add('active');
        }
    }, { passive: true });
    
    cardsContainer.addEventListener('touchend', (e) => {
        document.querySelectorAll('.card.active').forEach(card => {
            card.classList.remove('active');
        });
    }, { passive: true });
    
    // Deal new cards when the game mode changes
    noFaceCardsCheckbox.addEventListener('change', dealCards);
    
    // Initial deal
    dealCards();
});
