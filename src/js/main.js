// Yay ECMAScript 6!
"use strict;";

let starSystem = {};

// Store our program in a function for closure
const STARSYSTEM = function() {
    
    // VARIABLES
    
    // Create and place canvas to get context
    const theCanvas = document.createElement("canvas");
    document.body.appendChild(theCanvas);
    const ctx = theCanvas.getContext('2d');
    theCanvas.width = window.innerWidth;
    theCanvas.height = window.innerHeight;
    // The global list of particles that are alive
    let particleList = [];
    const growRate = 1.003;
    let tickCount = 0;
    // In pixels
    const maximumParticleSize = 60;
    /* How big a particle needs to be before
     * it's considered "large" for mass and
     * size purposes. */
    const largeParticleThreshold = 8;
    // How often particles spawn. 10 = 1 second.
    const spawnFrequency = 15;
    
    // "USER CONTROL"/"FRONT END" VARIABLES
    
    // How many particles we can have on screen
    const maxNumberOfParticles = 300;
    let userNumberOfParticles = maxNumberOfParticles * 0.5;
    // How long particle tails are
    const maxTailLength = 40;
    let userTailLength = maxTailLength * 0.5;

    // Set up our defaults for use in createDefaultParticle.
    const smallParticle = {
      min: 3,
      max: 5
    };
    const bigParticle = {
      min: 6,
      max: 9
    };

    /* This will be updated in updateParticleStartPoint
     * and used in createDefaultParticle. Initialized to
     * null to ensure particles won't spawn until user
     * moves their mouse. */
    let particleSpawnPoint = {
        x: null,
        y: null
    };

    // MODULE
    let starSystemModule = {};

    // HELPER FUNCTIONS

    /* returns a random number between the specified values.
     * The returned value is no lower than (and may possibly equal)
     * min, and is less than (but not equal to) max. */
    const getRandomArbitrary = function(min, max) {
        return Math.random() * (max - min) + min;
    };
    /* Will retrieve an appropriate hex value. */
    const getRandomHexValue = function() {
        //return '#' + Math.floor(Math.random() * 16777215).toString(16);
        const colors = [
          "#4b45da",
          "#ea1d76",
          //"#290088",
          "#00c18b",
          "#ff9e16",
          "#00afaa",
          "#26CAD3"
        ];
        return colors[Math.floor(Math.random()*colors.length)];
    };
    /* Returns a truthy value if user has moved mouse, otherwise
     * will return false. */
    let isMouseInitialized = function() {
      return (particleSpawnPoint.x !== null && particleSpawnPoint.y !== null) ? true : false;
    }
    /* Will update particleSpawn, queries the event
     * passed in for the user's mouse position then
     * stores it for createDefaultParticle() to use. */
    const updateParticleStartPoint = function(event) {
        particleSpawnPoint.x = event.clientX;
        particleSpawnPoint.y = event.clientY;
    };

    // PARTICLE FUNCTIONS

    /* Will create a particle. Takes optional
     * parameters to define particles.
     * Will take in speed, color, direction (as a
     * vector), size (as {x, y}), and point (as {x, y}). */
    const createParticle = function(color, direction, size, point) {
        /* Declare mass outside of object so
         * I can use it inside of the object. */
        const mass = (size.x > largeParticleThreshold || size.y > largeParticleThreshold) ? (((size.x + size.y) * 0.5) * getRandomArbitrary(0.4, 0.65)) : getRandomArbitrary(2.5, 3.5);
        return {
            color: color,
            direction: direction,
            size: size,
            point: point,
            age: 0,
            /* The star will "start" dying at a random
              * time between 2 and 5 seconds. */
            death: getRandomArbitrary(12, 150) * 100, // Roghly in seconds
            maxSize: getRandomArbitrary(maximumParticleSize * 0.7, maximumParticleSize),
            /* If we have a "big" particle,
             * the mass should also be large. */
            mass: mass,
            drag: mass * getRandomArbitrary(0.00005, 0.0001),
            maxSpeed: getRandomArbitrary(mass * 0.7, mass * 0.9),
            history: []
        };
    };
    /* Return a default size for a particle. */
    const defaultParticleSize = function() {
        /* Randomize size with a small chance
         * for the particle to be a "super" particle. */
        const isSuperParticle = Math.random() > 0.03;
        let size = {
            x: isSuperParticle ? getRandomArbitrary(smallParticle.min, smallParticle.max) * getRandomArbitrary(0.7, 1.0) : getRandomArbitrary(bigParticle.min, bigParticle.max) * getRandomArbitrary(1.1, 2.2),
            y: isSuperParticle ? getRandomArbitrary(smallParticle.min, smallParticle.max) * getRandomArbitrary(0.7, 1.0) : getRandomArbitrary(bigParticle.min, bigParticle.max) * getRandomArbitrary(1.1, 2.2)
        };
        // Super small chance we have a protostar
        if (Math.random() > 0.95 && size.x > 10 && size.y > 10) {
            size.x *= getRandomArbitrary(5, 10);
            size.y *= getRandomArbitrary(5, 10);
        }
        /* Give back our size. */
        return size;
    };
    /* Return a color for the particle. */
    const defaultParticleColor = function() {
        return getRandomHexValue();
    };
    /* Return a default vector for the
     * particles. */
    const defaultParticleDirection = function() {
        const tempX = getRandomArbitrary(-8.5, 8.5) * getRandomArbitrary(-0.4, 0.4);
        const tempY = getRandomArbitrary(-8.5, 8.5) * getRandomArbitrary(-0.4, 0.4);
        return {
            x: tempX,
            y: tempY
        };
    };
    /* Randomize point, spawn particles
      * near the mouse if user has moved
      * the mouse. */
    const defaultParticlePoint = function() {
        return {
            x: isMouseInitialized() ? particleSpawnPoint.x : getRandomArbitrary(maximumParticleSize, theCanvas.width - maximumParticleSize),
            y: isMouseInitialized() ? particleSpawnPoint.y : getRandomArbitrary(maximumParticleSize, theCanvas.height - maximumParticleSize)
        };
        /* Middle of the screen */
        /*return {
          x: theCanvas.width * Math.random(),
          y: theCanvas.height * Math.random()
        };*/
    };
    /* Create a particle in the default position
     * and put it into the array */
    const createDefaultParticle = function() {
        const color = defaultParticleColor();
        const vector = defaultParticleDirection();
        let point = defaultParticlePoint();
        const size = defaultParticleSize();
        return createParticle(color, vector, size, point);
    };
    /* Will remove a particle from
     * the global array. */
    const killParticle = function(particle) {
        // Find the index of our particle
        const particleIndex = particleList.indexOf(particle);
        // So I can remove it, because it's dead!
        particleList.splice(particleIndex, 1);
    };
    /* Will degrade the speed of the direction for
     * a particle. */
    const degradeSpeed = function(particle) {
        /* Small chance to "slow down" and
         * zoom in. */
        if (Math.random() > 0.975) {
            particle.direction.x = particle.direction.x - (particle.direction.x * 0.005);
            particle.direction.y = particle.direction.y - (particle.direction.y * 0.005);
            // Limit growth to maxSize property
            if(particle.size.x < particle.maxSize) {
              particle.size.x *= growRate;
            }
            if(particle.size.y < particle.maxSize) {
              particle.size.y *= growRate;
            }
        }
    };
    // Puts a particle in orbit.
    const engageParticleOrbit = function(particle) {
        // Now we can add axes easily!
        const axes = ["x", "y"];
        for(const axis in axes) {
          const contextAxis = axes[axis];
          if(particle.point[contextAxis] > particleSpawnPoint[contextAxis]) {
            if(particle.direction[contextAxis] > -particle.maxSpeed) {
              particle.direction[contextAxis] -= (particle.point[contextAxis] - particleSpawnPoint[contextAxis]) * particle.drag;
            }
            else {
              particle.direction[contextAxis] = -particle.maxSpeed;
            }
          }
          else if(particle.point[contextAxis] < particleSpawnPoint[contextAxis]) {
            if(particle.direction[contextAxis] < particle.maxSpeed) {
              particle.direction[contextAxis] += (particleSpawnPoint[contextAxis] - particle.point[contextAxis]) * particle.drag;
            }
            else {
              particle.direction[contextAxis] = particle.maxSpeed;
            }
          }
        }
    };
    /* Positions a particle, will follow the
     * user's mouse if it can, otherwise will Just
     * sort of continue it's direction. Speed degrades
     * over time due to degradeSpeed. */
    const positionParticle = function(particle) {
        if(isMouseInitialized()) {
          engageParticleOrbit(particle);
        }
        /* Move the particle if it's outside the bounds of the canvas. */
        if ((particle.point.x + particle.size.x) + particle.direction.x < theCanvas.width && particle.point.x + particle.direction.x > 0) {
            particle.point.x += particle.direction.x;
        } else {
            // Kill the particle or bounce it back
            particle.direction.x *= -1;
        }
        if ((particle.point.y + particle.size.y) + particle.direction.y < theCanvas.height && particle.point.y + particle.direction.y > 0) {
            particle.point.y += particle.direction.y;
        } else {
            // Kill the particle or bounce it back
            particle.direction.y *= -1;
        }
        // Degrade our particle speed.
        //degradeSpeed(particle);
    };
    /* Will "remember" a state for any passed
     * in particle. */
    const rememberPoint = function(particle) {
      const particlePointCopy = {
        x: particle.point.x,
        y: particle.point.y
      };
      /* If we have "room" in our particle tail,
       * then push the particle into our history to
       * draw later. If we don't have room, remove
       * the last entry of history and add a new one
       * on top again, to update the tail. */
      if(particle.history.length < userTailLength) {
        particle.history.push(particlePointCopy);
      }
      else if(particle.history.length >= userTailLength) {
        /* If we are over the user set limit, remove until
         * we match that user set limit! */
        while(particle.history.length > userTailLength) {
          particle.history.splice(0, 1);
        }
        particle.history.push(particlePointCopy);
      }
    };
    /* Will age a particle. The high level logic is that
     * if the particle is alive longer than the threshold set,
     * it will first enter a death state, then after 1.5x it's
     * threshold, will die. */
    const ageParticle = function(particle) {
        /* And then go for 3 more seconds before
         * it expires */
        const particleExpire = particle.death + (2 * 100); // Roughly in seconds
        // Just age like normally
        if (particle.age < particleExpire) {
            if (Math.random() > 0.7) {
                particle.age++;
            }
            // Enter death state
            if (particle.age > particle.death) {
                if(particle.size.x < particle.maxSize) {
                  particle.size.x *= growRate;
                }
                if(particle.size.y < particle.maxSize) {
                  particle.size.y *= growRate;
                }
            }
        }
        else {
            // Kill the particle
            killParticle(particle);
        }
    };

    // DRAW FUNCTIONS

    /* Will clear the screen. */
    const clear = function() {
        // Set the color of our particles
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, theCanvas.width, theCanvas.height);
    };
    /* Let the browser decide which frames to "queue" up,
     * and "queue" up a new particle as well. */
    const queue = function() {
        /* Add a particle if the user has moved
         * their mouse */
        if (particleList.length < userNumberOfParticles) {
            if(tickCount == spawnFrequency) {
              particleList.push(createDefaultParticle());
            }
        }
        /* Clean up extra particles we don't want */
        else {
          particleList.splice(particleList.length - (particleList.length - (userNumberOfParticles - 1), (particleList.length - (userNumberOfParticles - 1))));
        }
        tickCount = tickCount > spawnFrequency ? 0 : tickCount + 1;
        window.requestAnimationFrame(tick);
    };
    /* Draws each particle. */
    const draw = function() {
        for (var particle in particleList) {
            if (typeof particleList[particle] !== 'undefined')  {
                // Position our particle
                positionParticle(particleList[particle]);
                // Set the color of our particle
                ctx.fillStyle = particleList[particle].color;
                ctx.fillRect(
                  particleList[particle].point.x,
                  particleList[particle].point.y,
                  particleList[particle].size.x,
                  particleList[particle].size.y
                );
                /* Draw the particles history in a different
                 * color to indicate it's a trail... but let's use
                 * the size from above since we know it's the same. */
                if(particleList[particle].history.length > 0) {
                  for(let historyIndex = 0; historyIndex < particleList[particle].history.length; historyIndex++) {
                    ctx.fillRect(
                      particleList[particle].history[historyIndex].x,
                      particleList[particle].history[historyIndex].y,
                      particleList[particle].size.x * (historyIndex / particleList[particle].history.length),
                      particleList[particle].size.y * (historyIndex / particleList[particle].history.length)
                    );
                  }
                }
                // After we draw it, happy birthday!
                ageParticle(particleList[particle]);
                /* And make sure to remember where we are
                  * for the tail calculations. */
                //if(tickCount % 2 === 0) {
                  rememberPoint(particleList[particle]);
                //}
            }
        }
    };
    /* The main handler of the animation engine. */
    const tick = function() {
        clear();
        draw();
        queue();
    };

    // PUBLIC FUNCTIONS
    starSystemModule.updateParticleTail = function(value) {
      userTailLength = value < maxTailLength ? value : maxTailLength;
    };

    starSystemModule.getParticleTailLength = function() {
      return userTailLength;
    };
    starSystemModule.updateParticleLimit = function(value) {
      userNumberOfParticles = value < maxNumberOfParticles ? value : maxNumberOfParticles;
    };
    starSystemModule.getParticleLimit = function() {
      return userNumberOfParticles;
    };

    /* Initialization function */
    starSystemModule.init = function() {
        document.onmousemove = function(event) {
            updateParticleStartPoint(event);
        };
        // After we initialize, call the first tick.
        tick();
    };

    /* Give back the module with
     * the init function. */
    return starSystemModule;
};

/* As soon as the HTML elements are all
 * loaded, run the init function! */
document.addEventListener("DOMContentLoaded", function() {
    // Initialize our closure after DOMContent loads.
    starSystem = STARSYSTEM();
    /* Initialize all of our particles by calling
     * on our IIFE which has been executed and
     * self-contained above. */
    starSystem.init();
});