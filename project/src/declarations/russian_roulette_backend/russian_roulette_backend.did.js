export const idlFactory = ({ IDL }) => {
  const GameState = IDL.Variant({
    'GameOver' : IDL.Null,
    'InProgress' : IDL.Null,
    'NotStarted' : IDL.Null,
  });
  const Game = IDL.Record({
    'id' : IDL.Nat,
    'startTime' : IDL.Int,
    'player' : IDL.Principal,
    'totalShots' : IDL.Nat,
    'state' : GameState,
    'roundsSurvived' : IDL.Nat,
    'bulletPosition' : IDL.Nat,
    'chambers' : IDL.Vec(IDL.Bool),
    'currentChamber' : IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok' : Game, 'err' : IDL.Text });
  const PlayerStats = IDL.Record({
    'lastPlayed' : IDL.Int,
    'gamesPlayed' : IDL.Nat,
    'totalShots' : IDL.Nat,
    'roundsSurvived' : IDL.Nat,
    'bestStreak' : IDL.Nat,
  });
  const GameResult = IDL.Variant({
    'Error' : IDL.Text,
    'Bang' : IDL.Null,
    'Safe' : IDL.Null,
  });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Record({ 'result' : GameResult, 'game' : Game }),
    'err' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'getCurrentGame' : IDL.Func([], [Result], []),
    'getGameInfo' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalPlayers' : IDL.Nat,
            'totalGames' : IDL.Nat,
            'activeGamesCount' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getLeaderboard' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, PlayerStats))],
        ['query'],
      ),
    'getPlayerStats' : IDL.Func([], [PlayerStats], []),
    'pullTrigger' : IDL.Func([], [Result_2], []),
    'resetGame' : IDL.Func([], [Result_1], []),
    'spinChamber' : IDL.Func([], [Result], []),
    'startNewGame' : IDL.Func([], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
