module.exports = function( grunt ) {
    'use strict';

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig( {
        pkg  : pkg,

        // -- Uglify Config -------------------------------------------------------

        uglify : {
            options : {
                mangle : false
            },
            klass : {
                files : {
                    './dist/klass.min.js' : './src/klass.js'
                }
            }
        },

        // -- Copy Config -------------------------------------------------------

        copy: {
            klass: {
                expand: true,
                src: './src/klass.js',
                dest: './dist/',
                flatten: true,
            }
        },
        // -- Banner Config -------------------------------------------------------

        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: [
                        '/*!',
                        ' * <%= pkg.info.name %> v<%= pkg.version %> (<%= pkg.repository %>)',
                        ' * Copyright 2014 <%= pkg.author %>',
                        ' * <%= pkg.license %> (<%= pkg.repository %>/LICENSE)',
                        ' */',
                    ].join('\n')
                },
                files: {
                    src: [ './dist/klass.min.js' ]
                }
            }
        }
    } );
    // grunt.loadNpmTasks( 'grunt-shell' );
    // grunt.loadNpmTasks( 'grunt-contrib-imagemin' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks('grunt-banner');
    grunt.registerTask( 'default', [ 'uglify', 'copy', 'usebanner' ] );
};
