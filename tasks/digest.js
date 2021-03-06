/*
 * grunt-digest
 * https://github.com/hkjorgensen/grunt-digest
 *
 * Copyright (c) 2013 Henrik Kok Jorgensen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('digest', 'Create digested copies of assets and add mapping to a manifest. Useful with rails applications', function() {
    var crypto = require('crypto'),
        path = require('path'),
        filemap = {},
        tally = 0,
        options;

    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
      out: '',
      separator: '-',
      digestPathStyle: 'basename',
      algorithm: 'md5',
      basePath: false
    });

    this.filesSrc.forEach(function(filepath) {
      var data, file, ext, base, digest, fileDigest, filepathDigest, fileWithPath;

      file = path.basename(filepath);
      ext = path.extname(file);
      base = path.basename(filepath, ext);

      if(options.basePath) {
        fileWithPath = path.relative(options.basePath, filepath);
        base = fileWithPath.substr(0, fileWithPath.lastIndexOf('.'));
      } else {
        fileWithPath = file;
      }

      data = grunt.file.read(filepath);
      digest = crypto.createHash(options.algorithm).update(data).digest('hex');
      if (options.digestPathStyle === 'parameter') {
        fileDigest = [base, ext, '?', digest].join(''); 
        filepathDigest = filepath.replace([base, ext].join(''), fileDigest);
      } else {
        fileDigest = [base, options.separator, digest, ext].join('');
        //Copy file
        grunt.file.copy(filepath, filepathDigest);
        filepathDigest = filepath.replace([base, ext].join(''), fileDigest);
      }

      //Add file to map
      filemap[fileWithPath] = fileDigest;
      grunt.verbose.writeln(file.cyan + ' -> ' + fileDigest.cyan);

      //File count
      tally++;
    });

    //Write JSON Manifest
    if (options.out !== '') {
      grunt.verbose.writeln('Creating filemap: ' + options.out.cyan);
      grunt.file.write(options.out, JSON.stringify(filemap));
    }

    //Log info
    grunt.log.writeln('Digested ' + tally.toString().cyan + ' files');
  });

};
