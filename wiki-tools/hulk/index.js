
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var CHECK_TABLE_NAME =
          'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=?;';
var CREATE_TABLE = 'CREATE TABLE words (\
                      _id              INTEGER PRIMARY KEY AUTOINCREMENT,\
                      label            TEXT    NOT NULL,\
                      languageCode     TEXT    NOT NULL,\
                      serverID         TEXT    NOT NULL,\
                      url              TEXT    NOT NULL,\
                      latitude         TEXT,\
                      longtitude       TEXT,\
                      imageURL         TEXT,\
                      shortDesc        TEXT,\
                      category         INTEGER DEFAULT ( 0 )\
                    );';
var CREATE_INDEX =
         'CREATE UNIQUE INDEX IF NOT EXISTS serverIDIndex ON words(serverID);';
var INSERT_RECORD ='INSERT INTO words(label, languageCode, serverID, url,\
                                      latitude, longtitude, imageURL,\
                                      shortDesc, category)\
                                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);';
var QUERY_WORD = 'SELECT label FROM words WHERE serverID = ?;';
var UPDATE_RECORD = 'UPDATE words SET label = ?, languageCode = ?,\
                                      url = ?, latitude = ?, longtitude = ?,\
                                      imageURL = ?, shortDesc = ?, category = ?\
                                  WHERE serverID = ?';

// argument list: [check folder] [output folder] [category id]

var checkPath = process.argv[2];
if (checkPath.substr(-1, 1) !== '/') {
  checkPath += '/';
}

var rowJSONOutputFolder = process.argv[3];
if (rowJSONOutputFolder.substr(-1, 1) !== '/') {
  rowJSONOutputFolder += '/';
}

var categoryID = parseInt(process.argv[4], 10);
var languageCount = {};

function listJSONFilesAndConvertThem(error, files) {
  var validFiles = [];
  files.forEach(function(file) {
    if (file.substr(-5, 5).toLowerCase() !== '.json') {
      return;
    }
    if (fs.lstatSync(checkPath + file, file).isFile()) {
      validFiles[validFiles.length] = {
        'path': checkPath + file,
        'filename': file
      };
    }
  });

  // to have lower memory consumption, we run it as single thread mode
  function runNext() {
    var fileObj = validFiles.pop();
    if (fileObj) {
      parseSingleJSONFile(fileObj.path, fileObj.filename, function() {
        runNext(); 
      });
    } else {
      var langCount = 0;
      for (var key in languageCount) {
        console.log(key + ',' + languageCount[key]);
        langCount++;
      }
      console.log('all converted, total-language: ' + langCount);
    }
  }

  runNext();
}

function getSQLiteDB(lang, callback) {
  var db = new sqlite3.Database(rowJSONOutputFolder + lang + '.sqlite3',
                                sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
                                function cb(err) {
                                  if (err) {
                                    console.error(err);
                                    process.exit(-1);
                                  } else {
                                    callback(db);
                                  }
                                });
}

function parseSingleJSONFile(file, filename, done) {
  console.log('process file: ' + file);
  var json = require(file);
  var key = filename.substr(0, 3);
  convertDataObject(json, key, function() {
    var otherLangs = json.otherLanguages;

    function runNext() {
      var otherLang = otherLangs.pop();
      if (!otherLang) {
        done();
      } else {
        otherLang['latitude'] = json['latitude'];
        otherLang['longitude'] = json['longitude'];
        otherLang['flagImageURL'] = json['flagImageURL'];
        convertDataObject(otherLang, key, runNext);
      }
    }
    runNext();
  });
}

function updateRecord(outputJSON, db) {
  db.run(UPDATE_RECORD, [outputJSON.label, outputJSON.languageCode,
                         outputJSON.url, outputJSON.latitude,
                         outputJSON.longitude, outputJSON.imageURL, outputJSON.shortDesc,
                         outputJSON.category, outputJSON.serverID]);
}

function insertRecord(outputJSON, db) {
  
  db.run(INSERT_RECORD, [outputJSON.label, outputJSON.languageCode,
                         outputJSON.serverID, outputJSON.url,
                         outputJSON.latitude, outputJSON.longitude,
                         outputJSON.imageURL, outputJSON.shortDesc,
                         outputJSON.category]);
}

function putRecord(outputJSON, db) {
  db.get(QUERY_WORD, [outputJSON.serverID], function(err, row) {
    if (row) {
      updateRecord(outputJSON, db);
    } else {
      insertRecord(outputJSON, db);
    }
  });
}

function constructOutputJSON(json, key) {
  var name = json.countryName ?
             json.name + ' (' + json.countryName + ')' : json.name;
  var shortDesc = json.shortDesc ? json.shortDesc.join('\n') : '';
  if (!shortDesc) {
    console.log('WikiDataError, shortDesc: ' + JSON.stringify(json));
    return;
  } else if (!name) {
    console.log('WikiDataError, name: ' + JSON.stringify(json));
    return;
  } else if (!json.wikiUrl) {
    console.log('WikiDataError, wikiUrl: ' + JSON.stringify(json));
    return;
  } else {
    shortDesc = shortDesc.substr(0, 200);
    return {
      'label': name,
      'languageCode': json.lang,
      'serverID': 'country/' + key,
      'url': json.wikiUrl,
      'latitude': json.latitude,
      'longitude': json.longitude,
      'imageURL': json.flagImageURL ? json.flagImageURL : '',
      'shortDesc': shortDesc,
      'category': categoryID
    };
  }
}

function convertDataObject(json, key, done) {
  if (languageCount[json.lang]) {
    languageCount[json.lang]++;
  } else {
    languageCount[json.lang] = 1;
  }
  getSQLiteDB(json.lang, function(db) {
    db.serialize(function() {
      db.get(CHECK_TABLE_NAME, ['words'], function(err, row) {
        if (err) {
          console.error('hulk: ' + err);
          process.exit(-1);
        }
        
        var outputJSON = constructOutputJSON(json, key);
        if (!outputJSON) {
          db.close();
          done();
          return;
        }

        function outputData() {
          putRecord(outputJSON, db);
          fs.writeFile(rowJSONOutputFolder + json.lang + '$' + key + '.json',
            JSON.stringify(outputJSON) + '\n'
          );
          db.close();
          done();
        }

        if (!row) {
          db.run(CREATE_TABLE, function() {
            db.run(CREATE_INDEX, function() {
              outputData();
            });  
          });
        } else {
          outputData();
        }
      });
    });
  });
}

fs.readdir(checkPath, listJSONFilesAndConvertThem);
