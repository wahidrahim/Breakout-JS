var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var Game = (function() {
  var score = 0;
  var lives = 3;
  var paused = false;

  document.addEventListener('mousemove', function(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.width / 2;
    }
  });

  document.addEventListener('mousedown', function() {
    paused = (paused)? false : true;

    if (paused) {
      ctx.font = '25px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('PAUSED (click to resume)', canvas.width / 2 - 150, canvas.height / 2);
    }
  });

  function randomVelocity(min, max) {
    return ((Math.random() * (max - min + 1)) + min);
  }

  var paddle = {
    width: 75,
    height: 15,
    x: canvas.width / 2 - 37,

    draw: function() {
      ctx.beginPath();
      ctx.rect(this.x, canvas.height - this.height, this.width, this.height);
      ctx.fillStyle = '#8C66FF';
      ctx.fill();
      ctx.closePath();
    }
  };

  var ball = {
    x: paddle.x + (paddle.width / 2), //paddle.x + (paddle.width / 2),
    y: canvas.height - paddle.height - 10,
    r: 10,
    dx: randomVelocity(-2, 2),
    dy: randomVelocity(-6, -3),

    draw: function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = '#FF66FF';
      ctx.fill();
      ctx.closePath();
    },

    move: function() {
      this.x += this.dx;
      this.y += this.dy;
    }
  };

  var brick_wall = {
    rows: 8,
    cols: 4,
    b_width: 75,
    b_height: 20,
    padding: 10,
    offset_top: 30,
    offset_left: 30,
    bricks: [],

    init: function() {
      for (c = 0; c < this.cols; c++) {
        this.bricks[c] = [];
        for (r = 0; r < this.rows; r++) {
          this.bricks[c][r] = {
            x: (r * (this.b_width + this.padding) + this.offset_left),
            y: (c * (this.b_height + this.padding) + this.offset_top),
            exists: 1
          }
        }
      }
    },

    draw: function() {
      for (c = 0; c < this.cols; c++) {
        for (r = 0; r < this.rows; r++) {
          var brick = this.bricks[c][r];
          if (brick.exists) {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, this.b_width, this.b_height);
            ctx.fillStyle = '#D9FF66';
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }
  };

  var drawTexts = function() {
    ctx.font = '16px Monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Score: ' + score, 8, 20);
    ctx.fillText('Lives: ' + lives, canvas.width - 85, 20);
  }

  var reset = function() {
    paused = true;

    ctx.font = '25px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Click to start', canvas.width / 2 - 75, canvas.height / 2);

    ball.x = paddle.x + (paddle.width / 2);
    ball.y = canvas.height - paddle.height - 10;
    ball.dx = randomVelocity(-2, 2);
    ball.dy = randomVelocity(-6, -3);
  }

  var gameOver = function() {
    alert('Game over.');
    document.location.reload();
  }

  var collisionCheck = function() {
    // side walls
    if (ball.x + ball.dy > canvas.width - ball.r || ball.x + ball.dx < ball.r) {
      ball.dx = -ball.dx;
    }
    // top wall
    if (ball.y + ball.dy < ball.r) {
      ball.dy = -ball.dy;
    }
    // bricks
    for (c = 0; c < brick_wall.cols; c++) {
      for (r = 0; r < brick_wall.rows; r++) {
        var brick = brick_wall.bricks[c][r];
        if (brick.exists) {
          // collision
          if (ball.x + ball.r > brick.x && ball.x - ball.r < brick.x + brick_wall.b_width && ball.y + ball.r > brick.y && ball.y - ball.r < brick.y + brick_wall.b_height) {
            // top/bottom
            if (ball.y + ball.r > brick.y && ball.y - ball.r < brick.y + brick_wall.b_height) {
              ball.dy *= -1;
            }
            // sides
            else if (ball.x + ball.r > brick.x && ball.x - ball.r < brick.x + brick_width) {
              ball.dx *= -1;
            }
            brick.exists = 0;
            score += 10;
          }
        }
      }
    }
    // paddle
    if (ball.x + ball.r > paddle.x && ball.x - ball.r < paddle.x + paddle.width) {
      if (ball.y + ball.r > canvas.height - paddle.height) {
        ball.dy *= -1;
        ball.dx = randomVelocity(ball.dx - 1, ball.dx + 1);
      }
    }
    // floor
    if (ball.y + ball.r > canvas.height) {
      lives--;
      if (lives) {
        reset();
      }
      else {
        drawTexts();
        gameOver();
      }
    }
  }

  var gameLoop = function() {
    if (!paused) {
      // clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw entities
      drawTexts();
      brick_wall.draw();
      ball.draw();
      paddle.draw();
      // game logic
      collisionCheck();
      // update
      ball.move();
    }
    requestAnimationFrame(gameLoop);
  }

  // public
  return {
    start: function() {
      paused = true;

      brick_wall.init();
      drawTexts();
      brick_wall.draw();
      ball.draw();
      paddle.draw();

      ctx.font = '25px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Click to start', canvas.width / 2 - 75, canvas.height / 2);

      gameLoop();
    }
  };
})();

Game.start();
