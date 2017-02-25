// Yay ECMAScript 6!
"use strict;";

const STARSYSTEM = (function() {
    // VARIABLES
    const theCanvas = document.querySelector('canvas');
    const ctx = theCanvas.getContext('2d');
    theCanvas.width = window.innerWidth;
    theCanvas.height = window.innerHeight;
    // The global list of particles that are alive
    let particleList = [];
    const numberOfParticles = 1500;
    const growRate = 1.003;
    
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
     * vector), size (as {x, y}), point (as {x, y}),
     * and mass. */
    const createParticle = function(color, direction, size, point, mass) {
        return {
            color: color,
            direction: direction,
            size: size,
            point: point,
            mass: mass,
            age: 0,
            /* The star will "start" dying at a random
              * time between 2 and 5 seconds. */
            death: getRandomArbitrary(12, 128) * 100, // Roghly in seconds
            maxSize: getRandomArbitrary(40, 80)
        };
    };
    /* Return a default size and mass
     * for a particle. */
    const defaultParticleSize = function() {
        /* Randomize size with a small chance
         * for the particle to be a "super" particle. */
        const isSuperParticle = Math.random() > 0.03;
        let size = {
            x: isSuperParticle ? getRandomArbitrary(3, 5) * getRandomArbitrary(0.5, 1.0) : getRandomArbitrary(6, 9) * getRandomArbitrary(0.1, 2.2),
            y: isSuperParticle ? getRandomArbitrary(3, 5) * getRandomArbitrary(0.5, 1.0) : getRandomArbitrary(6, 9) * getRandomArbitrary(0.1, 2.2)
        };
        // Mass is always around 1.0
        let mass = getRandomArbitrary(0.80, 1.20);
        // Super small chance we have a protostar
        if (Math.random() > 0.95 && size.x > 10 && size.y > 10) {
            size.x *= getRandomArbitrary(5, 10);
            size.y *= getRandomArbitrary(5, 10);
            /* Increase mass by the average Increase
             * in size. */
            mass *= ((size.x + size.y) * 0.5);
        }
        /* Give back our object with size
         * and mass. */
        return {
          size: size,
          mass: mass
        };
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
            x: isMouseInitialized() ? particleSpawnPoint.x : theCanvas.width * Math.random(),
            y: isMouseInitialized() ? particleSpawnPoint.y : theCanvas.height * Math.random()
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
        // returns both size and mass
        const particleMeasurements = defaultParticleSize();
        return createParticle(color, vector, particleMeasurements.size, point, particleMeasurements.mass);
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
    /* Positions a particle, will follow the
     * user's mouse if it can, otherwise will Just
     * sort of continue it's direction. Speed degrades
     * over time due to degradeSpeed. */
    const positionParticle = function(particle) {
        //if(isMouseInitialized()) {
          //particle.direction.x = (particleSpawnPoint.x - particle.point.x) * 0.002;
          //particle.direction.y = (particleSpawnPoint.y - particle.point.y) * 0.002;
        //}
        /* Move the particle if it's within
        * the bounds of the canvas. */
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
        degradeSpeed(particle);
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
                particle.color = "#111";
                if(particle.size.x < particle.maxSize) {
                  particle.size.x *= growRate;
                }
                if(particle.size.y < particle.maxSize) {
                  particle.size.y *= growRate;
                }
            }
        } else {
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
        if (particleList.length < numberOfParticles) {
            particleList.push(createDefaultParticle());
        }
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
                // After we draw it, happy birthday!
                ageParticle(particleList[particle]);
            }
        }
    };
    /* The main handler of the animation engine. */
    const tick = function() {
        clear();
        draw();
        queue();
    };
    /* Initialization function */
    starSystemModule.init = function() {
        document.onmousemove = function(e) {
            updateParticleStartPoint(e);
        };
        // Set the blending operation.
        theCanvas.globalCompositeOperation = "multiply";
        // After we initialize, call the first tick.
        tick();
    };

    /* Give back the module with
     * the init function. */
    return starSystemModule;
})(); // Immediately Invoked Function Expression for closure.

/* As soon as the HTML elements are all
 * loaded, run the init function! */
document.addEventListener("DOMContentLoaded", function() {
    /* Initialize all of our particles by calling
     * on our IIFE which has been executed and
     * self-contained above. */
    STARSYSTEM.init();
});