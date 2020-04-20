// Faster ship prefab
class Fastship extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, pointValue) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);   // add to existing, displayList, updateList
        this.points = pointValue;
    }

    update() {
        // move fast ship left
        this.x -= game.settings.fastshipSpeed;
        // wraparound screen bounds
        if(this.x <= 0 - this.width) {
            this.reset();
        }
    }

    reset(){
        this.x = game.config.width;
    }
}