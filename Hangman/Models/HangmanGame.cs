namespace Hangman.Models;

public class HangmanGame
{
    public string WordToGuess { get; set; } = "";
    public HashSet<char> CorrectGuesses { get; set; } = new();
    public HashSet<char> WrongGuesses { get; set; } = new();
    public int MaxAttempts { get; set; } = 6;

    public string GetMaskedWord()
    {
        return string.Concat(WordToGuess.Select(c => CorrectGuesses.Contains(c) ? c : '_'));
    }

    public int RemainingAttempts => MaxAttempts - WrongGuesses.Count;

    public bool IsGameOver => RemainingAttempts <= 0 || IsWon;

    public bool IsWon => WordToGuess.All(c => CorrectGuesses.Contains(c));
}
