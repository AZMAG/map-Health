module.exports = function (grunt) {

    "use strict";

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),
        babel: {
            options: {
                sourceMap: true,
                presets: ['env']
            },
            CAG: {
                files: {
                    "./dist/CAG/js/main.js": "./dist/CAG/js/main.js"
                }
            },
            MAG: {
                files: {
                    "./dist/MAG/js/main.js": "./dist/MAG/js/main.js"
                }
            },
            Shared: {
                files: {
                    "./dist/shared/js/main.js": "./dist/shared/js/main.js"
                }
            }
        },
        copy: {
            build: {
                cwd: "src/",
                src: ["**"],
                dest: "dist/",
                expand: true,
                dot: true
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            build: {
                files: {
                    "dist/CAG/js/main.js": ["dist/CAG/js/main.js"],
                    "dist/MAG/js/main.js": ["dist/MAG/js/main.js"],
                    "dist/shared/js/main.js": ["dist/shared/js/main.js"],
                }
            }
        },
        clean: {
            build: {
                src: ["dist/"]
            },
            cleanjs: {
                src: ["dist/CAG/js/*.js",
                    "!dist/CAG/js/main.js",
                    "dist/MAG/js/*.js",
                    "!dist/MAG/js/main.js",
                    "dist/shared/js/*.js",
                    "!dist/shared/js/main.js"
                ]
            }
        },
        concat: {
            CAG: {
                src: ["src/CAG/js/*"],
                dest: "dist/CAG/js/main.js"
            },
            MAG: {
                src: ["src/MAG/js/*"],
                dest: "dist/MAG/js/main.js"
            },
            Shared: {
                src: ["src/shared/js/*"],
                dest: "dist/shared/js/main.js"
            }
        },
        postcss: {
            options: {
                map: true,
                map: {
                    inline: false,
                    annotation: 'dist/shared/css/maps/'
                },
                processors: [
                    require('postcss-cssnext')(),
                    require('cssnano')()
                ]
            },
            dist: {
                files: {
                    'dist/shared/css/main.css': 'src/shared/css/main.css'
                }
            },
        },
        toggleComments: {
            customOptions: {
                options: {
                    removeCommands: false
                },
                files: {
                    "dist/CAG/index.html": "dist/CAG/index.html",
                    "dist/CAG/js/main.js": "dist/CAG/js/main.js",
                    "dist/MAG/index.html": "dist/MAG/index.html",
                    "dist/MAG/js/main.js": "dist/MAG/js/main.js"
                }
            }
        },
        replace: {
            update_Meta: {
                src: ["src/MAG/index.html", "src/CAG/index.html", "README.md"], // source files array
                // src: ["README.md"], // source files array
                overwrite: true, // overwrite matched source files
                replacements: [{
                    // html pages
                    from: /(<meta name="revision-date" content=")[0-9]{4}-[0-9]{2}-[0-9]{2}(">)/g,
                    to: '<meta name="revision-date" content="' + '<%= pkg.date %>' + '">',
                }, {
                    // html pages
                    from: /(<meta name="version" content=")([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))(">)/g,
                    to: '<meta name="version" content="' + '<%= pkg.version %>' + '">',
                }, {
                    // config.js
                    from: /(v)([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))( \| )[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
                    to: 'v' + '<%= pkg.version %>' + ' | ' + '<%= pkg.date %>',
                }, {
                    // humans.txt
                    from: /(Version\: )([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "Version: " + '<%= pkg.version %>',
                }, {
                    // humans.txt
                    from: /(Last updated\: )[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
                    to: "Last updated: " + '<%= pkg.date %>',
                }, {
                    // README.md
                    from: /(### version \| )([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/g,
                    to: "### version | " + '<%= pkg.version %>',
                }, {
                    // README.md
                    from: /(\* #### Updated \| )[0-9]{4}-[0-9]{2}-[0-9]{2}/g,
                    to: "* #### Updated | " + '<%= pkg.date %>',
                }]
            }
        }
    });

    grunt.registerTask("build", ["clean:build", "replace", "copy", "clean:cleanjs", "concat", "toggleComments", "babel", "uglify", "postcss"]);
};