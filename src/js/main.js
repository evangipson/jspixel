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

    // FUNCTIONS

    /* returns a random number between the specified values.
     * The returned value is no lower than (and may possibly equal)
     * min, and is less than (but not equal to) max. */
    const getRandomArbitrary = function(min, max) {
        return Math.random() * (max - min) + min;
    };

    /* Will update particleSpawn, queries the event
     * passed in for the user's mouse position then
     * stores it for createDefaultParticle() to use. */
    const updateParticleStartPoint = function(event) {
        particleSpawnPoint.x = event.clientX;
        particleSpawnPoint.y = event.clientY;
    };

    /* Will create a particle if max number of allowed
     * particles isn't surpassed. Takes optional
     * parameters to define particles.
     * Will take in speed, color, direction (as a
     * vector), size (as {x, y}), and point (as {x, y}). */
    const createParticle = function(color, direction, size, point) {
        if (particleList.length < numberOfParticles) {
            return {
                color: color,
                direction: direction,
                size: size,
                point: point,
                age: 0,
                /* The star will "start" dying at a random
                 * time between 2 and 5 seconds. */
                death: getRandomArbitrary(15, 165) * 100, // Roghly in seconds
                maxSize: getRandomArbitrary(40, 80)
            };
        }
    };

    /* Will retrieve an appropriate hex value. */
    const getRandomHexValue = function() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
        /* const colors = [
          "#4b45da",
          "#ea1d76",
          "#290088",
          "#00c18b",
          "#ff9e16",
          "#00afaa",
          "#26CAD3"
        ];
        return colors[Math.floor(Math.random()*colors.length)]; */
    };

    /* Create a particle and put it
     * into the array */
    const createDefaultParticle = function() {
        // Randomize color
        const color = getRandomHexValue();
        // Randomize a vector
        const tempX = getRandomArbitrary(-8.5, 8.5) * getRandomArbitrary(-0.4, 0.4);
        const tempY = getRandomArbitrary(-8.5, 8.5) * getRandomArbitrary(-0.4, 0.4);
        // Build our vector to send to createParticle
        const vector = {
            x: tempX,
            y: tempY
        };
        /* Randomize size with a small chance
         * for the particle to be a "super" particle. */
        const isSuperParticle = Math.random() > 0.03;
        let size = {
            x: isSuperParticle ? getRandomArbitrary(2, 4) * getRandomArbitrary(0.5, 1.0) : getRandomArbitrary(6, 9) * getRandomArbitrary(0.1, 2.2),
            y: isSuperParticle ? getRandomArbitrary(2, 4) * getRandomArbitrary(0.5, 1.0) : getRandomArbitrary(6, 9) * getRandomArbitrary(0.1, 2.2)
        };
        // Super small chance we have a protostar
        if (Math.random() > 0.95 && size.x > 10 && size.y > 10) {
            size.x *= getRandomArbitrary(5, 10);
            size.y *= getRandomArbitrary(5, 10);
        }
        // Randomize point
        var point = {
            x: particleSpawnPoint.x,
            y: particleSpawnPoint.y
        };
        //const point = {x: theCanvas.width * Math.random(), y: theCanvas.height * Math.random()};
        return createParticle(color, vector, size, point);
    };

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
        if (particleSpawnPoint.x !== null && particleSpawnPoint.y !== null) {
            particleList.push(createDefaultParticle());
        }
        window.requestAnimationFrame(tick);
    };

    /* Will remove a particle from
     * the global array. */
    const killParticle = function(particle) {
        // Find the index of our particle
        const particleIndex = particleList.indexOf(particle);
        // So I can remove it, because it's dead!
        particleList.splice(particleIndex, 1);
        // Create a new one!
        particleList.push(createDefaultParticle());
    };

    /* Will degrade the speed of the direction for
     * a particle. */
    const degradeSpeed = function(particle) {
        // Adjust the vector?
        if (Math.random() > 0.95) {
            particle.direction.x = particle.direction.x - (particle.direction.x * 0.005);
        }
        if (Math.random() > 0.95) {
            particle.direction.y = particle.direction.y - (particle.direction.y * 0.005);
        }
    };

    /* Positions a particle. */
    const position = function(particle) {
        /* Move the particle if it's within
         * the bounds of the canvas. */
        if ((particle.point.x + particle.size.x) + particle.direction.x < theCanvas.width && particle.point.x + particle.direction.x > 0) {
            particle.point.x += particle.direction.x;
        } else {
            // Kill the particle or bounce it back
            particle.direction.x = particle.direction.x * -1;
        }
        if ((particle.point.y + particle.size.y) + particle.direction.y < theCanvas.height && particle.point.y + particle.direction.y > 0) {
            particle.point.y += particle.direction.y;
        } else {
            // Kill the particle or bounce it back
            particle.direction.y = particle.direction.y * -1;
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
            if (particle.age > particle.death && particle.size < particle.maxSize) {
                particle.color = "#eee";
                particle.size = particle.size * 1.005;
            }
        } else {
            // Kill the particle
            killParticle(particle);
        }
    };

    /* Draws each particle. */
    const draw = function() {
        for (var particle in particleList) {
            if (particleList[particle] !== null)  {
                // Position our particle
                position(particleList[particle]);
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
        // After we initialize, call the first tick.
        tick();
    };

    return starSystemModule;
})();

/* As soon as the HTML elements are all
 * loaded, run the init function! */
document.addEventListener("DOMContentLoaded", function() {
    /* Initialize all of our particles */
    STARSYSTEM.init();
});