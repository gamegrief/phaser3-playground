import Phaser from "phaser";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const randomDirection = (exclude: Direction) => {
    let newDirection = Phaser.Math.Between(0,3)
    while (newDirection === exclude){
        newDirection = Phaser.Math.Between(0,3)
    }
    return newDirection
}

export default class Lizard extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT;
  private moveEvent: Phaser.Time.TimerEvent
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    this.anims.play("lizard-run");
    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollission,
      this
    );
    this.moveEvent = scene.time.addEvent({
        delay: 2000,
        callback: () => {
            this.direction = randomDirection(this.direction)
        },
        loop: true
    })
  }

  destroy(fromScene?: boolean){
    this.moveEvent.destroy()
    super.destroy()
  }

  private handleTileCollission(
    go: Phaser.GameObjects.GameObject,
    tile: Phaser.Tilemaps.Tile
  ) {
    if (go !== this) {
      return;
    }

    this.direction = randomDirection(this.direction)
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const speed = 50;
    switch (this.direction) {
      case Direction.UP:
        this.setVelocity(0, -speed);
        break;
      case Direction.DOWN:
        this.setVelocity(0, speed);
        break;
      case Direction.LEFT:
        this.setVelocity(-speed, 0);
        break;
      case Direction.RIGHT:
        this.setVelocity(speed, 0);
        break;
    }
  }
}
