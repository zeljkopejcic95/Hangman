using Hangman.Models;
using Microsoft.AspNetCore.Mvc;

namespace Hangman.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HangmanController : ControllerBase
{
    private static readonly List<string> Words = WordList.Words;

    private static HangmanGame _currentGame;

    [HttpPost("start")]
    public IActionResult StartGame()
    {
        var random = new Random();
        var word = Words[random.Next(Words.Count)];

        _currentGame = new HangmanGame
        {
            WordToGuess = word
        };

        return Ok(new
        {
            maskedWord = _currentGame.GetMaskedWord(),
            remainingAttempts = _currentGame.RemainingAttempts,
            usedLetters = new List<char>()
        });
    }


    [HttpPost("guess")]
    public IActionResult MakeGuess([FromBody] GuessRequest request)
    {
        if (_currentGame == null)
            return BadRequest("Game not started.");

        char letter = char.ToLower(request.Letter);

        if (_currentGame.CorrectGuesses.Contains(letter) ||
            _currentGame.WrongGuesses.Contains(letter))
        {
            return BadRequest("Letter already guessed.");
        }

        if (_currentGame.WordToGuess.Contains(letter))
        {
            _currentGame.CorrectGuesses.Add(letter);
        }
        else
        {
            _currentGame.WrongGuesses.Add(letter);
        }

        return Ok(new
        {
            maskedWord = _currentGame.GetMaskedWord(),
            remainingAttempts = _currentGame.RemainingAttempts,
            wrongGuesses = _currentGame.WrongGuesses,
            correctGuesses = _currentGame.CorrectGuesses,
            isGameOver = _currentGame.IsGameOver,
            isWon = _currentGame.IsWon,
            word = _currentGame.IsGameOver ? _currentGame.WordToGuess : null
        });
    }
}