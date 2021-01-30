require(`dotenv`).config();

module.exports = grunt => {
    grunt.initConfig({
        pkg: grunt.file.readJSON(`package.json`),

        // Watch for file changes.
        watch: {
            scripts: {
                files: [`**/*.js`, `!**/node_modules/**`, `**/*.json`],
                tasks: [`build-dev`],
                options: {
                    spawn: false
                }
            }
        },

        // Concurrently run watch and nodemon.
        concurrent: {
            dev: [
                `nodemon:dev`,
                `watch:scripts`
            ],
            options: {
                logConcurrentOutput: true
            }
        },

        // Use nodemon to restart the app.
        nodemon: {
            dev: {
                script: `src/server.js`,
                options: {
                    args: [`dev`],
                    nodeArgs: [`--inspect`]
                }
            }
        }
    });
    // Build development
    grunt.registerTask(`build-dev`, []);

    // Run development.
    grunt.registerTask(`dev`, [`concurrent:dev`]);

    // Load grunt plugins.
    grunt.loadNpmTasks(`grunt-contrib-watch`);
    grunt.loadNpmTasks(`grunt-nodemon`);
    grunt.loadNpmTasks(`grunt-concurrent`);
};
