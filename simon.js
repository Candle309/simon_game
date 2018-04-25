$(document).ready(function(){
    /**************************************** sound variables*******************************************/
      var boardSound = [
        "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3", //g
        "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3", //r
        "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3", //y
        "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3" //b
      ];
      var errorSound = "http://soundbible.com/mp3/efx_NO-Fabio_Farinelli-955789468.mp3"; //error
      var cheerSound = "http://soundbible.com/mp3/1_person_cheering-Jett_Rifkin-1851518140.mp3"; //game over
      var gameOverSound = "http://soundbible.com/mp3/Sad_Trombone-Joe_Lamb-665429450.mp3"; //win
      
    /**************************************** game preparation*******************************************/  
      //document variables
      var gameStatus = {};
      //status reset
      gameStatus.reset = function(){
        this.init();
        this.strict = false;
      }
      //status initialization
      gameStatus.init = function(){
        reGainHearts();
        this.life = 5;
        this.simonSeq = [];
        this.index = 0;   
        this.level = 0;
        this.lock = false;
      }
      //lifes reset
      function reGainHearts(){
        var i = 0;
        gameStatus.heartIntvl = setInterval(function(){
          i++;
          $("#life"+i+" #heart1").removeClass('emptyHeart');
          if (i == 5) clearInterval(gameStatus.heartIntvl);
        }, 100);
      }
      //clear all timers
      function timerClear(){
        clearInterval(gameStatus.curIntvl);
        clearInterval(gameStatus.flIntvl);
        clearInterval(gameStatus.winIntvl);
        clearTimeout(gameStatus.curTimer);
        clearTimeout(gameStatus.flTimer);
        clearTimeout(gameStatus.strTimer);
        clearTimeout(gameStatus.winTimer);
      };
      //reset
      gameStatus.reset();
      //start game function
      function startGame(){ 
        timerClear();
        gameStatus.init();
        padEffectOff();
        flashing('--',1);   
        $('.count').text('--').removeClass('led-off'); 
        pushSimon();
      }
      
    /**************************************** play audio *******************************************/ 
      /*pad light and sound on*/
      function padEffectOn(id) {
        gameStatus.curPad = $('#'+id);
        gameStatus.curPad.addClass("light");
        playSound(id);
      }
      /*pad light off*/
      function padEffectOff() {
        if(gameStatus.curPad) gameStatus.curPad.removeClass("light");
        gameStatus.curPad = undefined;
      }
      //play audio function
      function playSound(id){
        var sound;
        if (id >= 0 && id < 4) {
          sound = new Audio(boardSound[id]);
        } else if (id == 4) {
          sound = new Audio(errorSound);
        } else if (id == 5) {
          sound = new Audio(cheerSound);
        } else {
          sound = new Audio(gameOverSound);
        }   
        sound.play();
      }
    
      /****************************************  show Error/ Win  *****************************************/
      //error effect
      function errorEffect(userObj){
        timerClear();
        gameStatus.lock = true; 
        $('.pad').removeClass('clickable').addClass('unclickable');
        if(gameStatus.strict){
          gameStatus.life = 0;
          $("#life1 #heart1").addClass('emptyHeart');
          $("#life2 #heart1").addClass('emptyHeart');
          $("#life3 #heart1").addClass('emptyHeart');
          $("#life4 #heart1").addClass('emptyHeart');
          $("#life5 #heart1").addClass('emptyHeart');
        } else{
          $("#life"+gameStatus.life+" #heart1").addClass('emptyHeart');
          gameStatus.life--;
        }
        
        if (gameStatus.life == 0){
          playSound(6);
          flashing(':(',2);
        } else {
          playSound(4);    
          if(userObj) userObj.addClass('light');     
          gameStatus.curTimer = setTimeout(function(){
            if(userObj) userObj.removeClass('light');
            gameStatus.strTimer = setTimeout(function(){
              if(gameStatus.strict) startGame();
              else playSimonSeq();
            },1000);
          },1000);
          flashing('!!',2);
        }
        
        
      };
      //win effect
      function winEffect(){
        var i = 0;
        timerClear();
        playSound(5);
        gameStatus.curIntvl = setInterval(function(){
          var colorId = i % 4;  
          i++;
          $("#" + colorId).addClass('light');
          gameStatus.curTimer = setTimeout(function(){
            $("#" + colorId).removeClass('light'); 
          }, 80);
          if(i == 20){
            clearInterval(gameStatus.curIntvl);
          }
        }, 160);
        flashing('WIN',2);
      }
    
      //flashing effect
      function flashing(s,t){
        $('.count').text(s);
        var flash = function(){
          $('.count').addClass('status-off');
          gameStatus.flTimer = setTimeout(function(){
            $('.count').removeClass('status-off');
          },250);
        };
        var i = 0;
        gameStatus.flIntvl = setInterval(function(){
          flash();
          i++;
          if(i == t + 1) clearInterval(gameStatus.flIntvl);
        },500)
      };
      
    /********************************   generate and play simon sequence   ********************************/  
      //set frequency function
      function setFreq(num){
        var steps = [1500, 1250, 1000, 750, 500];
        if (num <= 4) return steps[0];
        if (num <= 8) return steps[1];
        if (num <= 12) return steps[2];
        if (num <= 16) return steps[3];
        else return steps[4];
      }
      //push a new element to play
      function pushSimon() {   
        var random = Math.floor(Math.random() * 4);
        gameStatus.simonSeq.push(random);    
        gameStatus.freq = setFreq(gameStatus.level);  
        gameStatus.level++;
        gameStatus.curTimer = setTimeout(playSimonSeq,500);
      }
      //play Simon sequence
      function playSimonSeq(){
        
        var i = 0;
        gameStatus.index = 0;
        gameStatus.curIntvl = setInterval(function(){
          displayCount();
          gameStatus.lock = true;
          padEffectOn(gameStatus.simonSeq[i]);
          gameStatus.curTimer = setTimeout(padEffectOff, gameStatus.freq/2 - 10);
          i++;
          if(i === gameStatus.simonSeq.length){
            clearInterval(gameStatus.curIntvl);
            gameStatus.lock = false;
            $('.pad').removeClass('unclickable').addClass('clickable');
            gameStatus.curTimer = setTimeout(errorEffect, 5*gameStatus.freq);
          }
        },gameStatus.freq);
      }  
      /* display count*/
      function displayCount(){
        if (gameStatus.level < 10) $('.count').text("0" + gameStatus.level);
        else $('.count').text(gameStatus.level);
      }
      
     /***********************************user input********************************************/
      //play simon game
      function userFB(userPad){
        if(!gameStatus.lock) {
          clearTimeout(gameStatus.curTimer);
          var id = userPad.attr('id');
          if (id == gameStatus.simonSeq[gameStatus.index]){
            padEffectOn(id);
            gameStatus.index++;
            if(gameStatus.index < gameStatus.simonSeq.length){
              gameStatus.curTimer = setTimeout(errorEffect, 5 * gameStatus.freq);
            }else if (gameStatus.index == 5){
              gameStatus.lock = true;
              $('.pad').removeClass('clickable').addClass('unclickable');
              gameStatus.curTimer = setTimeout(winEffect, gameStatus.freq);
            }else{
              $('.pad').removeClass('clickable').addClass('unclickable');
              pushSimon();
            }
            //padEffectOff();
          }else{
            $('.pad').removeClass('clickable').addClass('unclickable');
            errorEffect(userPad);
          }
        }    
      }
      /************************************  click function  ************************************************/
      //pad light on as long as mousedown
      $('.pad').mousedown(function(){
        userFB($(this));    
      });
      //pad light off when use mouseup
      $('*').mouseup(function(){   
        if(!gameStatus.lock) padEffectOff();
      });
      //toggle strict
      function toggleStrict(){
          $('#strict-led').toggleClass('led-on');
          gameStatus.strict = !gameStatus.strict;
      }
      //start button control
      $('#start').click(startGame);
      //strict button control
      $('#strict').click(toggleStrict);
      //switch control
      $('.outer-switch').click(function(){
        $('#inner').toggleClass('switch-on');
        if($('#inner').hasClass('switch-on')){
          $('.round-btn').removeClass('unclickable').addClass('clickable');
          $('.count').removeClass('status-off');
        }else{   
          gameStatus.reset();
          timerClear();
          padEffectOff();
          $('.count').addClass('status-off');
          $('.count').text('--');
          $('.pad').removeClass('clickable').addClass('unclickable');
          $('.round-btn').removeClass('clickable').addClass('unclickable');
          $('#strict-led').removeClass('led-on'); 
        }
      });    
      
    });
    