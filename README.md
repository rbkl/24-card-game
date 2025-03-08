# 24 Card Game

A simple web-based implementation of the classic "24" card game.

## Game Rules

1. Four random cards are dealt from a standard deck.
2. Each card has a numerical value: Ace = 1, 2-10 = face value, Jack = 11, Queen = 12, King = 13.
3. The goal is to use all four cards exactly once to make the number 24.
4. You can use addition (+), subtraction (-), multiplication (*), and division (/) operations.
5. You can use parentheses to change the order of operations.

## How to Play

1. Open `index.html` in your web browser.
2. Four random cards will be displayed.
3. Enter your solution in the input field using the card values and operations.
4. Click "Check Answer" to verify your solution.
5. If you're stuck, click "Show Solution" to see possible solutions.
6. Click "Deal New Cards" to start a new round.

## Example

If the cards are: Ace (1), 3, 8, and King (13)
A possible solution might be: (13 - 1) * (8 - 3) = 12 * 5 = 60

## Running the Game

No installation is required. Simply open the `index.html` file in a web browser to start playing.

```
# Using Python's built-in HTTP server (optional)
python -m http.server

# Then open http://localhost:8000 in your browser
```
