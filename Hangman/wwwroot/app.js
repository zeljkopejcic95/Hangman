const maskedWordEl = document.getElementById("masked-word");
const attemptsEl = document.getElementById("attempts");
const wrongLettersEl = document.getElementById("wrong-letters");
const messageEl = document.getElementById("message");
const letterInput = document.getElementById("letter-input");
const guessBtn = document.getElementById("guess-btn");
const startBtn = document.getElementById("start-btn");

const apiBase = "/api/hangman";

startBtn.addEventListener("click", startGame);
guessBtn.addEventListener("click", makeGuess);
letterInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        makeGuess();
    }
});

function startGame() {
    letterInput.disabled = false;
    guessBtn.disabled = false;
    messageEl.textContent = "";
    wrongLettersEl.textContent = "";
    letterInput.value = "";
    letterInput.focus();

    fetch(`${apiBase}/start`, {
        method: "POST"
    })
        .then(res => res.json())
        .then(data => {
            updateUI(data);
            updateHangmanImage(data.remainingAttempts);
            createLetterButtons();
        })
        .catch(e => {
            console.log(e);
        });
}

function makeGuess(letterFromButton = null) {
    const letter = letterFromButton ? letterFromButton.toLowerCase() : letterInput.value.toLowerCase();
    if (!letter || letter.length !== 1 || !letter.match(/[a-z]/i)) {
        alert("Enter a valid single letter.");
        return;
    }

    fetch(`${apiBase}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter: letter })
    })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text); });
            return res.json();
        })
        .then(data => {
            updateUI(data);
            updateHangmanImage(data.remainingAttempts);
            letterInput.value = "";
            const btn = document.getElementById(`btn-${letter.toUpperCase()}`);
            if (btn) btn.disabled = true;

            if (data.correctGuesses.includes(letter)) {
                letterInput.classList.add("correct");
                letterInput.classList.remove("wrong");
            } else if (data.wrongGuesses.includes(letter)) {
                letterInput.classList.add("wrong");
                letterInput.classList.remove("correct");
            }

            if (data.isGameOver) {
                letterInput.disabled = true;
                guessBtn.disabled = true;
                messageEl.classList.remove("fade-in");
                void messageEl.offsetWidth;
                disableAllButtons();
                if (data.isWon) {
                    messageEl.textContent = "🎉 You won!";
                } else {
                    messageEl.textContent = `💀 Game over! The word was: ${data.word}`;
                }
                messageEl.classList.add("fade-in");
            }

            setTimeout(() => {
                letterInput.classList.remove("correct", "wrong");
            }, 1000);

            letterInput.focus();
        })
        .catch(err => {
            alert(err.message);
        });
}


function createLetterButtons() {

    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    const container = document.getElementById("letter-buttons");
    container.innerHTML = "";

    rows.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");

        row.split("").forEach(letter => {
            const btn = document.createElement("button");
            btn.textContent = letter;
            btn.addEventListener("click", () => {
                makeGuess(letter);
            });
            btn.id = `btn-${letter}`;
            rowDiv.appendChild(btn);
        });

        container.appendChild(rowDiv);
    });
}

function updateUI(data) {
    maskedWordEl.textContent = data.maskedWord.split("").join(" ");
    attemptsEl.textContent = `Attempts left: ${data.remainingAttempts}`;
    const wrongGuesses = Array.isArray(data.wrongGuesses) ? data.wrongGuesses : [];
    wrongLettersEl.textContent = `Wrong letters: ${wrongGuesses.join(", ")}`;
}

function updateHangmanImage(remainingAttempts) {
    const imageEl = document.getElementById("hangman-image");
    const wrongCount = 6 - remainingAttempts;
    imageEl.src = `images/hangman-${wrongCount}.svg`;
};

document.addEventListener("DOMContentLoaded", () => {
    startGame();
});

function disableAllButtons() {
    document.querySelectorAll("#letter-buttons button").forEach(btn => {
        btn.disabled = true;
    });
}