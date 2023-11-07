import Phaser from "phaser";
import { debugDraw } from "../utils/debug";
import { createLizardAnims } from "../anims/EnemyAnims";
import { createCharacterAnims } from "../anims/CharacterAnims";
import Lizard from "../enemies/Lizard";
import "../characters/Faune";
import Faune from "../characters/Faune";
import { sceneEvents } from "../events/EventCenter";
import { createChestAnims } from "../anims/TreasureAnims";
import Chest from "../items/Chest";
export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private faune!: Faune;
  private knives!: Phaser.Physics.Arcade.Group;
  private lizards!: Phaser.Physics.Arcade.Group;

  private playerLizardsCollider?: Phaser.Physics.Arcade.Collider;
  private hit = 0;
  constructor() {
    super("game");
  }

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.scene.run("game-ui");
    createLizardAnims(this.anims);
    createCharacterAnims(this.anims);
    createChestAnims(this.anims);
    const map = this.make.tilemap({ key: "dungeon" });
    const tileset = map.addTilesetImage("dungeon", "tiles", 16, 16, 1, 2);
    map.createLayer("Ground", tileset);

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });
    const wallsLayer = map.createLayer("Walls", tileset);

    wallsLayer.setCollisionByProperty({ collides: true });

    const chests = this.physics.add.staticGroup({
      classType: Chest,
    });

    const chestsLayer = map.getObjectLayer("Chests");
    chestsLayer.objects.forEach((chestObj) => {
      chests.get(
        chestObj.x! + chestObj.width! * 0.5,
        chestObj.y! - chestObj.height! * 0.5,
        "treasure"
      );
    });
    debugDraw(wallsLayer, this);
    this.faune = this.add.faune(128, 128, "faune");
    this.faune.setKnives(this.knives);
    this.cameras.main.startFollow(this.faune, true);

    this.lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (go) => {
        const lizGo = go as Lizard;
        lizGo.body.onCollide = true;
      },
    });
    this.lizards.get(256, 128, "lizard");
    this.lizards.get(256, 100, "lizard");
    // const lizard = this.physics.add.sprite(256,128, 'lizard', 'lziard_m_idle_anim_f0.png')
    this.physics.add.collider(this.faune, wallsLayer);
    this.physics.add.collider(this.lizards, wallsLayer);
    this.physics.add.collider(
      this.faune,
      chests,
      this.handlePlayerChestCollision,
      undefined,
      this
    );

    this.physics.add.collider(
      this.knives,
      wallsLayer,
      this.handleKnifeWallCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.knives,
      this.lizards,
      this.handleKnifeLizardCollision,
      undefined,
      this
    );

    this.playerLizardsCollider = this.physics.add.collider(
      this.lizards,
      this.faune,
      this.handlePlayerLizardCollission,
      undefined,
      this
    );
  }

  private handlePlayerChestCollision(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    const chest = obj2 as Chest
    this.faune.setChest(chest)
  }

  private handleKnifeWallCollision(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    this.knives.killAndHide(obj1);
  }
  private handleKnifeLizardCollision(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    this.knives.killAndHide(obj1);
    this.lizards.killAndHide(obj2);
  }

  private handlePlayerLizardCollission(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    const lizard = obj2 as Lizard;
    const dx = this.faune.x - lizard.x;
    const dy = this.faune.y - lizard.y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    this.faune.handleDamage(dir);

    //probably change this to enum/const
    sceneEvents.emit("player-health-changed", this.faune.health);

    if (this.faune.health <= 0) {
      this.playerLizardsCollider?.destroy();
    }
  }

  update(t: number, dt: number) {
    if (this.hit > 0) {
      ++this.hit;
      if (this.hit > 10) {
        this.hit = 0;
      }
      return;
    }
    if (this.faune) {
      this.faune.update(this.cursors);
    }
  }
}
