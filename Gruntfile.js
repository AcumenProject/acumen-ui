'use strict';
module.exports = function(grunt) {
    // Load all tasks
    require('load-grunt-tasks')(grunt);
    // Show elapsed time
    require('time-grunt')(grunt);
    var serveStatic = require('serve-static');

    grunt.registerTask('default', ['dev-build', 'connect:demo', 'watch']);
    grunt.registerTask('dev-build', [
        'html2js',
        'concat',
        'ngAnnotate',
        'customize-bootstrap',
        'less:dev',
        'bower_concat:dev',
        'clean:app'
    ]);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env_path: '/',
        bower_concat: {
            dev: {
                dest: 'dist/js/acumen-vendor.js',
                cssDest: 'dist/css/acumen-vendor.css',
                include: [
                    'angular-hotkeys',
                    'angular-loading-bar',
                    'angular-mousewheel',
                    'angular-bootstrap',
                    'angular-print-button',
                    'angular-ui-router',
                    'hamsterjs'
                ],
                callback: function (mainFiles, component) {
                    return mainFiles.map(function (filepath) {
                        // Use minified files if available
                        var min = filepath.replace(/\.min(?=\.)/, '');
                        return grunt.file.exists(min) ? min : filepath;
                    });
                }
            }
        },
        bowercopy: {
            xsl: {
                files: {
                    'dist/xsl': 'acumen-xsl/**/*.xsl'
                }
            }
        },
        clean: {
            app: ['tmp/']
        },
        concat: {
            app: {
                options: {
                    separator: ';'
                },
                src: ['tmp/templates.js', 'src/app/**/*.js'],
                dest: 'dist/js/acumen.js'
            }
        },
        connect: {
            demo: {
                options: {
                    livereload: true,
                    open: true,
                    hostname: 'localhost',
                    base: {
                        path: 'dist',
                        options: {
                            index: 'index.html'
                        }
                    },
                    middleware: function(connect) {
                        return [
                            serveStatic('.tmp'),
                            connect().use('/bower_components', serveStatic('./bower_components')),
                            serveStatic('./dist')
                        ];
                    }
                }
            },            
            docs: {
                options: {
                    livereload: true,
                    open: true,
                    hostname: 'localhost',
                    base: {
                        path: 'docs',
                        options: {
                            index: 'index.html'
                        }
                    }
                }
            }
        },
        'customize-bootstrap': {
            app: {
                options: {
                    bootstrapPath: 'bower_components/bootstrap',
                    src: 'src/styles/bootstrap/',
                    dest: 'src/styles/'
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'docs'
            },
            firstTarget: {
                src: ['**/*']
            }
        },
        html2js:{
            app: {
                options: {
                    base: 'src/app',
                    process: true,
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                },
                src: ['src/app/**/*.tpl.html'],
                dest: 'tmp/templates.js',
                module: 'acumen.templates'
            }
        },
        less: {
            dev: {
                files: {
                    'dist/css/acumen.css': ['src/app/**/*.css', 'src/app/**/*.less'],
                    'dist/css/acumen-bootstrap.css': 'src/styles/bootstrap.less'
                },
                options: {
                    compress: false
                }
            },
            build: {
                files: {
                    'dist/css/acumen.css': ['src/app/**/*.css', 'src/app/**/*.less'],
                    'dist/css/acumen-bootstrap.css': 'src/styles/bootstrap.less'
                },
                options: {
                    compress: true
                }
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: [
                    {
                        'dist/js/acumen.js': ['dist/js/acumen.js']
                    }
                ]
            }
        },
        ngdocs: {
            options: {
                dest: 'docs',
                html5Mode: false,
                startPage: 'api/acumen',
                sourceLink: true,
                title: "Acumen UI Docs",
                titleLink: "api/acumen"
            },
            api: {
                src: ['src/**/*.js', '!src/**/*.spec.js'],
                title: 'API Documentation'
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            app: {
                files: {
                    'dist/js/acumen.min.js': ['dist/js/acumen.js']
                }
            }
        },
        watch: {
            less: {
                files: ['src/**/*.less', 'src/**/*.css'],
                tasks: ['less:dev']
            },
            ng: {
                files: ['src/**/*.js', 'src/**/*.tpl.html'],
                tasks: ['html2js', 'concat:app', 'clean']
            },
            livereload: {
                // Here we watch the files the sass task will compile to
                // These files are sent to the live reload server after sass compiles to them
                options: { livereload: true },
                files: ['dist/**/*', 'docs/**/*']
            }
        }
    });
};