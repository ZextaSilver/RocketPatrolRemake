class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprite
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('fastship', './assets/fastship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('meteoroidfield', './assets/meteoroidfield.png');
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);

        // parallax background
        this.meteoroidfield = this.add.tileSprite(0, 0, 640, 480, 'meteoroidfield').setOrigin(0, 0);

        // add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, 431, 'rocket').setScale(0.5, 0.5).setOrigin(0, 0);

        // add fastship 
        this.shipF = new Fastship(this, game.config.width + 192, 132, 'fastship', 0, 40).setOrigin(0, 0);

        // add spaceship (x3)
        this.ship01 = new Spaceship(this, game.config.width + 192, 172, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + 96, 236, 'spaceship', 0, 20).setOrigin(0, 0);
        this.ship03 = new Spaceship(this, game.config.width, 300, 'spaceship', 0, 10).setOrigin(0, 0);

        // white rectangle borders
        this.add.rectangle(5, 5, 630, 32, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(5, 443, 630, 32, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(5, 5, 32, 455, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(603, 5, 32, 455, 0xFFFFFF).setOrigin(0, 0);
        // green UI background
        this.add.rectangle(37, 42, 566, 64, 0x00FF00).setOrigin(0, 0);



        // define keyboard keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // score
        this.p1Score = 0;
        
        // score display
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#006ecf',
            color: '#afd7fa',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(69, 54, this.p1Score, scoreConfig);

        //game over flag
        this.gameOver = false;

        // 60sec play time
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig). setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, '(F)ire to Restart or ← for Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
    }

    update() {
        //check for restart key input
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyF)){
            this.scene.restart(this.p1Score);
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }
        // scroll starfield
        this.starfield.tilePositionX -= 4;
        // parallax meteoroidfield
        this.meteoroidfield.tilePositionX -= 2;

        // game continue condition
        if(!this.gameOver){
            // update rocket
            this.p1Rocket.update();
            // update spaceship
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
            //update fastship
            this.shipF.update();
        }


        //check rocket-ship collision per frame
        if(this.checkCollision(this.p1Rocket, this.ship01)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
        if(this.checkCollision(this.p1Rocket, this.ship02)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if(this.checkCollision(this.p1Rocket, this.ship03)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if(this.checkCollision(this.p1Rocket, this.shipF)){
            this.p1Rocket.reset();
            this.shipExplode(this.shipF);
        }
    }

    //update rocket-ship collision
    checkCollision(rocket, ship) {
        //simple AABB checking
        if(rocket.x < ship.x + ship.width &&
           rocket.x + rocket.width > ship.x &&
           rocket.y < ship.y + ship.height &&
           rocket.height + rocket.y > ship.y){
            return true;
        }
        else{
            return false;
        }
                
    }

    // explosion animation generate
    shipExplode(ship){
        //temp invisible ship sprite
        ship.alpha = 0;

        // explosion sprite generate position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        // explosoion animation start playing at the position
        boom.anims.play('explode');
        // after explosion animation start
        boom.on('animationcomplete', () => {
            // set ship back to spawn
            ship.reset();
            // set ship visible
            ship.alpha = 1;
            // destroy explosion animation once finished
            boom.destroy();
        });
        // score increment when hitting
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;

        //explosion sound
        this.sound.play('sfx_explosion');
    }
}