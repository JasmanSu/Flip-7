# Flip 7 With a Vengeance – Live Scoreboard

A mobile-first, single-file web app (`index.html`) that works as a live scoreboard for the card game **Flip 7 With a Vengeance**, with a house-rule **chip** twist. Every player scores on their own phone, and everyone sees the standings update in real time.

No build step, no frameworks. Plain HTML, CSS and JavaScript, plus the Firebase Realtime Database (compat SDK, pinned to 10.14.1) loaded from the gstatic CDN.

## Features

- **Rules** tab: how to play, with a gallery of the number, power and special cards.
- **Chip twist** tab: the chip house rules with a worked example.
- **Game** tab: create or join a game and send your score.
  - Admin creates a game (name, Normal or Chip mode, target score) and gets a 5-character join code (no ambiguous characters, checked to be unused). The admin plays too.
  - Players join with a name and the code. Late joiners get `5 + 2 x rounds already played` chips in Chip mode.
  - Each player taps the cards they hold and the score is calculated live, for example `Score 33 x 3 = 99 points`. Scores can be resent until the round closes.
  - Admin closes the round (`Close round (n/total sent)`), or ends the game early with **End this game** if nobody has reached the target.
  - When a game finishes, the admin can start a **new game with the same code and players**. The finished game is saved under *Past games*, with a win tally.
- **Scoreboard** tab: a read-only live view of one game (opened from the Admin tab).
- **Admin** tab: lists every game created on this device, with *View* and *Forget*.

## Scoring

Round score, in this order:

1. Add all number cards (1 to 13). Lucky 13 counts as 13, The Zero as 0.
2. If the player has the ÷2 power card, halve the total and round **up**.
3. Subtract the minus power cards (-2, -4, -6, -8, -10). The score cannot go below 0.
4. If the player holds 7 cards, add 15 (Flip 7 bonus).
5. A bust scores 0.

Special cards:

- **The Zero**: scores 0 unless the player holds 7 cards including the Zero. Then the points count.
- **Lucky 13**: the only card that can be held together with the 13. There are no other duplicates.

The game ends when at least one player has reached the target at the end of a round and the top score is not tied. A tied top score means one more round.

### Chip twist (Chip mode only)

- One chip type, each worth 1. Everyone starts round 1 with 5 chips and receives 2 more when each round ends. Chips carry over.
- Before flipping, each player bets any number of chips they hold. Betting 0 counts as x1.
- After normal scoring (including the +15 bonus) the round score is multiplied by the chips bet.
  Example: `(45 - 4 - 8) x 3 = 99`.
- A bust scores 0 and loses the chips bet. Otherwise the chips are kept.

## Security notes

- `.env` and `config.js` are gitignored, so the Firebase config stays out of the repository. A browser app still has to download its config, so the `apiKey` is visible to anyone using the site. It only identifies the project and is not a password. Access is controlled by the database rules, so also restrict the key to your site's domain under **Google Cloud Console > APIs & Services > Credentials**.
- The rules above are open on purpose: there is no login, so anyone who knows a join code can read and write that game. That is fine for a game among friends. Nothing outside `games/` is accessible.
- Only the admin's device is allowed to close rounds and start new games in the UI, but this is not enforced by the database. For real enforcement, add Firebase Anonymous Authentication and tighten the rules.
- The Admin tab only lists games created in the same browser (kept in localStorage). Clearing browser data removes that list, not the games.

## Data layout

```
games/{code}/
  meta         name, mode, target, round, gameNo, status, tie, adminId, createdAt
  players/{pid}      name, joinRound
  submissions/r{n}/{pid}   the card hand and calculated score for the open round
  results/r{n}/{pid}       points, bet, bust, sent, lost (written when the round closes)
  history/g{n}       finished games: winner, standings and per-round results
```

Chips are derived, not stored: `5 + 2 x (round - 1) - chips lost on busts in closed rounds`.
