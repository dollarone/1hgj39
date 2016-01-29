var PlatfomerGame = PlatformerGame || {};

//title screen
PlatformerGame.Game = function(){};

PlatformerGame.Game.prototype = {
    create: function() {
        this.sky1 = this.game.add.sprite(0, 0, 'sky');
        this.sky1.scale.setTo(10, 1.5);

        this.sunSprite = this.game.add.sprite(700, 260, 'sun');
        this.sunOffsetX = 300;

        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('bitslap-minild62', 'tiles');

        this.backgroundLayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        this.map.setCollisionBetween(1, 10000, true, 'blockedLayer');

        this.blockedLayer.resizeWorld();

        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player = this.game.add.sprite(result[0].x, result[0].y, 'tiles');
        this.player.frame = 1; 

        var result = this.findObjectsByType('teabag', this.map, 'objectLayer');
        this.teabag = this.game.add.sprite(result[0].x, result[0].y, 'tiles');
        this.teabag.frame = 31;
        this.game.physics.arcade.enable(this.teabag);

        this.teabag.body.gravity.y = 10;

        var result = this.findObjectsByType('home', this.map, 'objectLayer');
        this.home = this.game.add.sprite(result[0].x, result[0].y, 'tiles');
        this.game.physics.arcade.enable(this.home);
        this.home.alpha = 0;
        this.home.anchor.setTo(0.5);
        

        this.game.physics.arcade.enable(this.player);
        this.player.body.bounce.y = 0;
        this.player.body.gravity.y = 400;
        this.player.anchor.setTo(0.5);
        this.player.body.collideWorldBounds = false;

        this.game.camera.follow(this.player);

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [4, 5], 10, true);
        this.player.animations.add('right', [4, 5], 10, true);


        this.music = this.game.add.audio('music');
        this.music.loop = true;
        this.music.play();

        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.timer = 0;

        this.showDebug = false; 
        this.teaCollected = false;
        this.foregroundLayer = this.map.createLayer('foregroundLayer');

        this.sky = this.game.add.sprite(0, 0, 'sky');
        this.sky.scale.setTo(10, 1.5);

        this.sky.alpha = 0.1;
        var tween = this.game.add.tween(this.sky).to({alpha: 1}, 30000);    
        tween.start();
        this.tweenTint(this.sky, 0xfffff, 0x01000, 30000); // tween the tint of sprite from red to blue over 2 seconds (2000ms)

        this.scoreText = this.game.add.text(8, 16, 'Go get the mystic bag and bring it back before dark.', { fontSize: '32px', fill: '#fff' });
        this.scoreText.fixedToCamera = true;
        this.score = 0;

        var tween = this.game.add.tween(this.scoreText).to( { alpha: 0 }, 7000);
        tween.start();

        var tween = this.game.add.tween(this.sunSprite).to({y: 366}, 30000);    
        tween.start();


    },

    tweenTint: function(obj, startColor, endColor, time) {    // create an object to tween with our step value at 0    
        var colorBlend = {step: 0};    // create the tween on this object and tween its step property to 100    
        var colorTween = this.game.add.tween(colorBlend).to({step: 100}, time);        
        // run the interpolateColor function every time the tween updates, feeding it the    
        // updated value of our tween each time, and set the result as our tint    
        colorTween.onUpdateCallback(function() {      
            obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);       
        });        // set the object to the start color straight away    
        obj.tint = startColor;            // start the tween    
        colorTween.start();
    },

    update: function() {
        this.timer++;

        //  Collide the player and the bag with the platforms
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.teabag, this.blockedLayer);

        //  Checks to see if the player overlaps with the bag, if he does call the collectTeabag function
        this.game.physics.arcade.overlap(this.player, this.teabag, this.collectTeabag, null, this);
        this.game.physics.arcade.overlap(this.player, this.home, this.wentHome, null, this);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.cursors.left.isDown)
        {
            //  Move to the left
            this.player.scale.setTo(-1, 1);
            this.player.body.velocity.x = -150;

            this.player.animations.play('left');
        }
        else if (this.cursors.right.isDown)
        {
            //  Move to the right
            this.player.scale.setTo(1, 1);
            this.player.body.velocity.x = 150;

            this.player.animations.play('right');
        }
        else
        {
            //  Stand still
            this.player.animations.stop();

            this.player.frame = 3;
        }
        
        //  Allow the player to jump if they are touching the ground.
        if (this.cursors.up.isDown && this.player.body.blocked.down)
        {
            this.player.body.velocity.y = -200;
        }

        if (this.player.y > this.game.world.height) {
            this.death();
        }


        if (this.player.x >= 400 && this.player.x < 2800 && this.player.body.velocity.x > 0) {
            this.sunSprite.x = this.player.x + this.sunOffsetX;

            if (this.timer % 2 == 0) {
                this.sunOffsetX--;
            }

        }
        else if (this.player.x >= 400 && this.player.x < 2800 && this.player.body.velocity.x < 0) {
            this.sunSprite.x = this.player.x + this.sunOffsetX;
            if (this.timer % 2 == 0) {
                this.sunOffsetX++;
            }

        }
    },

    death: function() {
        this.state.restart();
    },

    collectTeabag : function(player, tea) {
        tea.kill();
        this.teaCollected = true;
    },

    wentHome: function(player, tea) {
        
        if (this.teaCollected) {
            this.scoreText.text = " You managed to find your way home! Good work!";
            this.scoreText.alpha = 1;
            this.game.paused = true;

        }
    },


    // find objects in a tiled layer that contains a property called "type" equal to a value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                // phaser uses top left - tiled bottom left so need to adjust:
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },

    render: function() {

        if (this.showDebug) {
            this.game.debug.body(this.teabag);
            this.game.debug.body(this.player);
        }
    },

};
