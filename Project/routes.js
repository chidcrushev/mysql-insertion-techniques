var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
});
var fs = require('fs');
var mysql = require('mysql');
var path = require('path');
const {
    exit
} = require('process');
var async = require('async');
var perf = require('execution-time')();


//MySQL Connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "shiva",
    database: "PlayerDB"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Database Connected!");
});


// Multer storage options
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({
    storage: storage
});

//Handling get request
router.get('/', (req, res) => {
    res.render('home');
});

//Handling post request
router.post('/', upload.single("fileupload"), (req, res) => {

    req.setTimeout(2147483647)

    let opn_name = req.body.operation;
    
    let absPath, filename;

    if(opn_name === 'single_insert' || opn_name === 'bulk_loading')
    {
     absPath = path.resolve(req.file.path)

     filename = req.body.fileupload;


    //Values to be inserted. Reading from players.txt file
    let stream;
    stream = fs.createReadStream(req.file.path, {
        encoding: 'utf-8'
    });
    }

    if (opn_name === 'single_insert') {
        //Do a single insertion into db

        //Query for Single insertion
        let single_insert_query = `INSERT INTO Players(Name, PlayerID, TeamName, Position, Salary, Touchdown, TotalYards) VALUES ? `;


        perf.start()

        const readFileLines = filename => fs.readFileSync(req.file.path).toString('UTF8').trim().split('\n')

        let inputArray = readFileLines(req.file.path)
        let flag = false;

        async.eachSeries(inputArray, function (arr, callback) {
            let data = arr;
            let value = data.toString().split(",")
            con.query(`INSERT INTO Players(Name, PlayerID, TeamName, Position, Salary, Touchdown, TotalYards) VALUES (?) `, [value], (err, results) => {
                if (err) {
                   return callback(err)
                } else {
                    callback(null)
                }
            })
        }, function (err, data) {
            if (err) {
                return res.render('home', {
                    result: err.message
                })
            } else {
                let totaltime = perf.stop()

                console.log("Time taken for Single Insertion - " + (totaltime.time.toFixed(5)) + " milli-seconds, " +((totaltime.time/1000).toFixed(5)) + " seconds, " +
                ((totaltime.time/(1000*60)).toFixed(5)) + " minutes, " +  ((totaltime.time/(1000*60*60)).toFixed(5))+ " hours") 
    
    
                return res.render('home', {
                    result: 'Inserted successfuly'
                })
            }
        })



    } else if (opn_name === 'bulk_loading') {
        //Do a bulk loading

        perf.start()

        //Query for bulk loading - Absolute Path
        let bulk_query =
            `LOAD DATA INFILE '` + absPath + `'` +
            `INTO TABLE Players
        FIELDS TERMINATED BY ','
        LINES TERMINATED BY '\n'`

        con.query(bulk_query, (err, results) => {
            if (err) {
                return res.render('home', {
                    result: err.message
                })
            }
            let totaltime = perf.stop()
            console.log("Time taken for Bulk Loading - " + (totaltime.time.toFixed(5)) + " milli-seconds, " +((totaltime.time/1000).toFixed(5)) + " seconds, " +
            ((totaltime.time/(1000*60)).toFixed(5)) + " minutes, " +  ((totaltime.time/(1000*60*60)).toFixed(5))+ " hours") 

            return res.render('home', {
                result: 'Bulk Loaded successfully'
            })
        })



    } else if (opn_name === 'delete') {
        //Delete the table
        let delete_query =
            `TRUNCATE TABLE Players`

            perf.start()
        con.query(delete_query, (err, results) => {
            if (err) {
                return res.render('home', {
                    result: err.message
                })
            }
            let totaltime = perf.stop()
            console.log("Time taken for Deletion - " + (totaltime.time.toFixed(5)) + " milli-seconds, " +((totaltime.time/1000).toFixed(5)) + " seconds, " +
            ((totaltime.time/(1000*60)).toFixed(5)) + " minutes, " +  ((totaltime.time/(1000*60*60)).toFixed(5))+ " hours") 

            if(results.affectedRows == 0){
                //Nothing got affected
                return res.render('home', {
                    result: 'Deleted Successfully'   
                })
            }
           
        })

    } else if (opn_name === 'query') {
        let query_input = req.body.textarea_query.trim().replace(";", "");

        con.query(query_input, (err, results) => {
            if (err) {
                return res.render('home', {
                    result: err.message
                })
            }
            let playersList = []
            // Loop check on each row
            for (var i = 0; i < results.length; i++) {
                var playerDetails = {
                    'Name': results[i].Name,
                    'PlayerID': results[i].PlayerID,
                    'TeamName': results[i].TeamName,
                    'Position': results[i].Position,
                    'Salary': results[i].Salary,
                    'Touchdown': results[i].Touchdown,
                    'TotalYards': results[i].TotalYards
                }

                playersList.push(playerDetails)
            }

            if (playersList.length == 0) {
                return res.render('home', {
                    result: '0 rows returned'
                })
            }

            return res.render('home', {
                playersData: playersList
            })
        })
    } else {
        console.log("Invalid operation specified")
    }

})

module.exports = router;