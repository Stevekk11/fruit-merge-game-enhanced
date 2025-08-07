import type { GameState } from '../stores/game.svelte';
interface GameHeaderProps {
    gameState: GameState;
}
declare const GameHeader: import("svelte").Component<GameHeaderProps, {}, "">;
type GameHeader = ReturnType<typeof GameHeader>;
export default GameHeader;
