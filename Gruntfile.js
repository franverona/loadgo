module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        mangle: {
          reserved: ['jQuery', '$']
        },
        output: {
          comments: 'some',
        },
      },
      loadgo: {
        files: {
          'loadgo.min.js': ['loadgo.js'],
          'loadgo-nojquery.min.js': ['loadgo-nojquery.js'],
        }
      }
    },
    clean : {
      oldminifies: {
        src: [
          'loadgo.min.js',
          'loadgo-nojquery.min.js',
        ]
      }
    },
    replace: {
      loadgo: {
        src: ['loadgo.js', 'loadgo.min.js', 'loadgo-nojquery.js', 'loadgo-nojquery.min.js'],
        overwrite: true,
        replacements: [
          {
            from: /@preserve\sLoadGo\sv([0-9]+)\.?([0-9]+)(\.([0-9]+))?\s\(http:\/\/franverona.com\/loadgo\)/g,
            to: '@preserve LoadGo v<%= pkg.version %> (http://franverona.com/loadgo)'
          },
          {
            from: /([0-9])+\s-\sFran Verona/g,
            to: '<%= grunt.template.today("yyyy") %> - Fran Verona'
          },
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('default', ['clean', 'uglify', 'replace']);

};
