import Phaser from 'phaser'
import Preloader from './scenes/Peloader'
import Game from './scenes/Game'
import GameUI from './scenes/GameUI'

// const config: Phaser.Types.Core.GameConfig = {
// 	type: Phaser.AUTO,
// 	width: 400,
// 	height: 250,
// 	physics: {
// 		default: 'arcade',
// 		arcade: {
// 			gravity: { y: 0 }
// 		}
// 	},
// 	scene: [Preloader, Game]
// }

export default new Phaser.Game({
	type: Phaser.AUTO,
	width: 400,
	height: 250,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		}
	},
	scene: [Preloader, Game, GameUI],
	scale:{
		zoom: 2
	}
})
