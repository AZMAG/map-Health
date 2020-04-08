function randomString(length, chars) {
    var result = "";
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
const fileHash = randomString(32, "0123456789abcdefghijklmnopqrstuvwxyz");
const jsFilePath = `dist/js/main.${fileHash}.js`;
const fileName = "main.${fileHash}.js";

module.exports = function(grunt) {

    "use strict";

    const sass = require("node-sass");

    require('load-grunt-tasks')(grunt);
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    var paths = {
        // 'magcore': '',
        'esri': 'empty:',
        'dojo': 'empty:',
        'dojox': 'empty:',
        'dijit': 'empty:',
        'dojo/text': '../../node_modules/requirejs-text/text'
    };

    grunt.initConfig({

        config: {
            out: 'dist',
            src: 'src',
            demos: 'demos'
        },

        pkg: grunt.file.readJSON("package.json"),
        license: grunt.file.read('LICENSE'),

        babel: {
            options: {
                sourceMap: false,
                presets: ['@babel/preset-env']
            },
            release: {
                files: [{
                    expand: true,
                    cwd: "<%=config.src%>/js/",
                    src: ["**/*.js"],
                    dest: "<%=config.out%>/js/"
                }]
            }
        },

        requirejs: {
            release: {
                options: {
                    locale: "en-us",
                    baseUrl: './dist/js',
                    // name: "main.REPLACE",
                    // allow dependencies to be resolved but don't include in output (empty:)
                    paths: paths,
                    // but don't include them in the main build
                    exclude: {},
                    include: {},
                    inlineText: true,
                    optimize: 'none',
                    generateSourceMaps: false,
                    preserveLicenseComments: true,
                    findNestedDependencies: true,
                    removeCombined: true,
                    out: function(text, sourceMapText) {
                        var UglifyJS = require('uglify-es'),
                            uglified = UglifyJS.minify(text),
                            config = grunt.config.get('config'),
                            pkg = grunt.config.get('pkg');

                        grunt.file.write(`dist/js/${pkg.name}.min.js`, uglified.code);
                    }
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
            },
            rename: {
                files: [{
                    expand: true,
                    src: ["src/js/main.REPLACE.js"],
                    rename: function() {
                        return jsFilePath;
                    }
                }]
            }
        },

        sass: {
            options: {
                implementation: sass,
                sourceMap: true
            },
            release: {
                files: {
                    "dist/css/master.css": "dist/sass/main.scss"
                }
            }
        },

        cssmin: {
            options: {
                specialComments: "all",
                processImport: false,
                roundingPrecision: -1,
                mergeIntoShorthands: false,
                advanced: false,
            },
            release: {
                files: {
                    "dist/css/master.min.css": "dist/css/master.css"
                }
            }
        },

        postcss: {
            options: {
                map: false,
                processors: [
                    require('pixrem')(),
                    require('postcss-preset-env')()
                ]
            },
            release: {
                files: {
                    '<%=config.out%>/css/master1.min.css': '<%=config.out%>/css/master.min.css'
                }
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
            clean_css: {
                src: ["dist/css/*.css", "!dist/css/master.min.css",
                    "dist/css/*.css.map", "!dist/css/master.css.map",
                ]
            },
            clean_sass: {
                src: ["dist/sass/"]
            },
            clean_js: {
                src: ["dist/js/main.REPLACE.js", "dist/js/main.REPLACE.js.map"]
            }
        },

        toggleComments: {
            customOptions: {
                options: {
                    padding: 0,
                    removeCommands: true
                },
                files: {
                    "dist/index.html": "dist/index.html",
                }
            }
        },
        replace: {
            update_Meta: {
                src: ["src/index.html", "README.md", "LICENSE", "src/LICENSE", "src/js/config.js", "src/humans.txt"], // source files array
                overwrite: true,
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
                    // config.js    this.copyright = "2018";
                    from: /(copyright: )+(")([0-9]{4})+(")/g,
                    to: 'copyright: "' + "<%= pkg.copyright %>" + '"'
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
                }, {
                    // LICENSE
                    from: /(Copyright \(c\) )[0-9]{4}/g,
                    to: "Copyright (c) " + "<%= pkg.copyright %>",
                }]
            },
            release: {
                src: ["dist/index.html"],
                overwrite: true,
                replacements: [{
                    from: "REPLACE",
                    to: fileHash,
                }]
            }
        }
    });

    grunt.registerTask("test", ["replace"]);

    grunt.registerTask("build-html", ["replace:update_Meta", "copy", "toggleComments"]);
    grunt.registerTask("build-css", ["sass", "cssmin", "postcss", "clean:clean_css", "clean:clean_sass"]);
    grunt.registerTask("build-js", ["babel"]);
    grunt.registerTask("build-rename", ["replace:release", "copy:rename", "clean:clean_js"]);

    grunt.registerTask("ts", ["postcss"]);
    grunt.registerTask("tsjs", ["clean:build", "copy", "requirejs"]);


    grunt.registerTask("build", ["clean:build", "build-html", "build-css", "build-js", "build-rename"]);
};
