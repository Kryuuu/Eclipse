import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

actor RussianRoulette {
    
    // Types
    public type GameState = {
        #NotStarted;
        #InProgress;
        #GameOver;
    };
    
    public type GameResult = {
        #Safe;
        #Bang;
        #Error: Text;
    };
    
    public type PlayerStats = {
        gamesPlayed: Nat;
        totalShots: Nat;
        roundsSurvived: Nat;
        bestStreak: Nat;
        lastPlayed: Int;
    };
    
    public type Game = {
        id: Nat;
        player: Principal;
        bulletPosition: Nat;
        currentChamber: Nat;
        roundsSurvived: Nat;
        totalShots: Nat;
        state: GameState;
        startTime: Int;
        chambers: [Bool]; // 6 chambers, true = bullet
    };
    
    // State variables
    private stable var gameCounter: Nat = 0;
    private stable var playerStatsEntries: [(Principal, PlayerStats)] = [];
    private stable var activeGamesEntries: [(Principal, Game)] = [];
    
    private var playerStats = HashMap.fromIter<Principal, PlayerStats>(
        playerStatsEntries.vals(), 
        playerStatsEntries.size(), 
        Principal.equal, 
        Principal.hash
    );
    
    private var activeGames = HashMap.fromIter<Principal, Game>(
        activeGamesEntries.vals(),
        activeGamesEntries.size(),
        Principal.equal,
        Principal.hash
    );
    
    // System functions for upgrades
    system func preupgrade() {
        playerStatsEntries := Iter.toArray(playerStats.entries());
        activeGamesEntries := Iter.toArray(activeGames.entries());
    };
    
    system func postupgrade() {
        playerStatsEntries := [];
        activeGamesEntries := [];
    };
    
    // Helper functions
    private func generateRandomNumber(max: Nat) : async Nat {
        let now = Time.now();
        let seed = Int.abs(now) % (max * 1000);
        seed % max
    };
    
    private func initializeChambers(bulletPos: Nat) : [Bool] {
        Array.tabulate<Bool>(6, func(i) = i == bulletPos)
    };
    
    private func updatePlayerStats(player: Principal, game: Game, result: GameResult) {
        let currentStats = switch (playerStats.get(player)) {
            case (?stats) { stats };
            case null { 
                {
                    gamesPlayed = 0;
                    totalShots = 0;
                    roundsSurvived = 0;
                    bestStreak = 0;
                    lastPlayed = 0;
                }
            };
        };
        
        let newStats = {
            gamesPlayed = currentStats.gamesPlayed + 1;
            totalShots = currentStats.totalShots + game.totalShots;
            roundsSurvived = currentStats.roundsSurvived + game.roundsSurvived;
            bestStreak = Nat.max(currentStats.bestStreak, game.roundsSurvived);
            lastPlayed = Time.now();
        };
        
        playerStats.put(player, newStats);
    };
    
    // Public functions
    public shared(msg) func startNewGame() : async Result.Result<Game, Text> {
        let player = msg.caller;
        
        // Check if player already has an active game
        switch (activeGames.get(player)) {
            case (?existingGame) {
                if (existingGame.state == #InProgress) {
                    return #err("You already have an active game. Finish it first or reset.");
                };
            };
            case null {};
        };
        
        gameCounter += 1;
        let bulletPosition = await generateRandomNumber(6);
        let startingChamber = await generateRandomNumber(6);
        
        let newGame: Game = {
            id = gameCounter;
            player = player;
            bulletPosition = bulletPosition;
            currentChamber = startingChamber;
            roundsSurvived = 0;
            totalShots = 0;
            state = #InProgress;
            startTime = Time.now();
            chambers = initializeChambers(bulletPosition);
        };
        
        activeGames.put(player, newGame);
        #ok(newGame)
    };
    
    public shared(msg) func spinChamber() : async Result.Result<Game, Text> {
        let player = msg.caller;
        
        switch (activeGames.get(player)) {
            case (?game) {
                if (game.state != #InProgress) {
                    return #err("No active game. Start a new game first.");
                };
                
                // Generate new bullet position and starting chamber
                let newBulletPosition = await generateRandomNumber(6);
                let newStartingChamber = await generateRandomNumber(6);
                
                let updatedGame: Game = {
                    id = game.id;
                    player = game.player;
                    bulletPosition = newBulletPosition;
                    currentChamber = newStartingChamber;
                    roundsSurvived = game.roundsSurvived;
                    totalShots = game.totalShots;
                    state = game.state;
                    startTime = game.startTime;
                    chambers = initializeChambers(newBulletPosition);
                };
                
                activeGames.put(player, updatedGame);
                #ok(updatedGame)
            };
            case null {
                #err("No active game found. Start a new game first.")
            };
        }
    };
    
    public shared(msg) func pullTrigger() : async Result.Result<{game: Game; result: GameResult}, Text> {
        let player = msg.caller;
        
        switch (activeGames.get(player)) {
            case (?game) {
                if (game.state != #InProgress) {
                    return #err("No active game in progress.");
                };
                
                let newTotalShots = game.totalShots + 1;
                let result: GameResult = if (game.currentChamber == game.bulletPosition) {
                    #Bang
                } else {
                    #Safe
                };
                
                let (newRoundsSurvived, newState) = switch (result) {
                    case (#Safe) {
                        (game.roundsSurvived + 1, #InProgress)
                    };
                    case (#Bang) {
                        (game.roundsSurvived, #GameOver)
                    };
                    case (#Error(_)) {
                        (game.roundsSurvived, game.state)
                    };
                };
                
                let nextChamber = (game.currentChamber + 1) % 6;
                
                let updatedGame: Game = {
                    id = game.id;
                    player = game.player;
                    bulletPosition = game.bulletPosition;
                    currentChamber = nextChamber;
                    roundsSurvived = newRoundsSurvived;
                    totalShots = newTotalShots;
                    state = newState;
                    startTime = game.startTime;
                    chambers = game.chambers;
                };
                
                activeGames.put(player, updatedGame);
                
                // Update player stats if game is over
                if (newState == #GameOver) {
                    updatePlayerStats(player, updatedGame, result);
                };
                
                #ok({game = updatedGame; result = result})
            };
            case null {
                #err("No active game found. Start a new game first.")
            };
        }
    };
    
    public shared(msg) func getCurrentGame() : async Result.Result<Game, Text> {
        let player = msg.caller;
        
        switch (activeGames.get(player)) {
            case (?game) { #ok(game) };
            case null { #err("No active game found.") };
        }
    };
    
    public shared(msg) func getPlayerStats() : async PlayerStats {
        let player = msg.caller;
        
        switch (playerStats.get(player)) {
            case (?stats) { stats };
            case null {
                {
                    gamesPlayed = 0;
                    totalShots = 0;
                    roundsSurvived = 0;
                    bestStreak = 0;
                    lastPlayed = 0;
                }
            };
        }
    };
    
    public shared(msg) func resetGame() : async Result.Result<Text, Text> {
        let player = msg.caller;
        
        switch (activeGames.get(player)) {
            case (?game) {
                // Update stats if game was in progress
                if (game.state == #InProgress) {
                    updatePlayerStats(player, game, #Error("Game reset"));
                };
                
                activeGames.delete(player);
                #ok("Game reset successfully.")
            };
            case null {
                #err("No active game to reset.")
            };
        }
    };
    
    public query func getLeaderboard() : async [(Principal, PlayerStats)] {
        let entries = Iter.toArray(playerStats.entries());
        Array.sort(entries, func(a: (Principal, PlayerStats), b: (Principal, PlayerStats)) : {#less; #equal; #greater} {
            if (a.1.bestStreak > b.1.bestStreak) { #less }
            else if (a.1.bestStreak < b.1.bestStreak) { #greater }
            else { #equal }
        })
    };
    
    // Debug function (remove in production)
    public query func getGameInfo() : async {
        totalGames: Nat;
        totalPlayers: Nat;
        activeGamesCount: Nat;
    } {
        {
            totalGames = gameCounter;
            totalPlayers = playerStats.size();
            activeGamesCount = activeGames.size();
        }
    };
}