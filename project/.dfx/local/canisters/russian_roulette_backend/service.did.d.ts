import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Game {
  'id' : bigint,
  'startTime' : bigint,
  'player' : Principal,
  'totalShots' : bigint,
  'state' : GameState,
  'roundsSurvived' : bigint,
  'bulletPosition' : bigint,
  'chambers' : Array<boolean>,
  'currentChamber' : bigint,
}
export type GameResult = { 'Error' : string } |
  { 'Bang' : null } |
  { 'Safe' : null };
export type GameState = { 'GameOver' : null } |
  { 'InProgress' : null } |
  { 'NotStarted' : null };
export interface PlayerStats {
  'lastPlayed' : bigint,
  'gamesPlayed' : bigint,
  'totalShots' : bigint,
  'roundsSurvived' : bigint,
  'bestStreak' : bigint,
}
export type Result = { 'ok' : Game } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export type Result_2 = { 'ok' : { 'result' : GameResult, 'game' : Game } } |
  { 'err' : string };
export interface _SERVICE {
  'getCurrentGame' : ActorMethod<[], Result>,
  'getGameInfo' : ActorMethod<
    [],
    {
      'totalPlayers' : bigint,
      'totalGames' : bigint,
      'activeGamesCount' : bigint,
    }
  >,
  'getLeaderboard' : ActorMethod<[], Array<[Principal, PlayerStats]>>,
  'getPlayerStats' : ActorMethod<[], PlayerStats>,
  'pullTrigger' : ActorMethod<[], Result_2>,
  'resetGame' : ActorMethod<[], Result_1>,
  'spinChamber' : ActorMethod<[], Result>,
  'startNewGame' : ActorMethod<[], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
