'use strict';

//require express
const express = require('express');
const app = express();

//require axios
const axios = require('axios');

//require cors
var cors = require('cors');

//set port

const port =process.env.PORT || 3001;
//require data
const data = require('./Movie_Data/data.json');

//require .env
require('dotenv').config();

//require api_key
const apiKey = process.env.API_KEY;

//use cors
app.use(cors())

//require body-parser
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//require pg
const pg=require('pg');

//url of database i want to connect with
const url = process.env.URL;
const DataBase=process.env.PG_DATABASE;
const UserName=process.env.PG_USER;
const Password=process.env.PG_PASSWORD;
const Host=process.env.PG_HOST;
const Port=process.env.PG_HOST;
const client=new pg.Client(`postgressql://${UserName}:${Password}@${Host}:${Port}/${DataBase}`);


//..........................................................................................................................

//Lab11

function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

// Route 1 of  home page 
app.get('/', (req, res) => {
    const obj = new Movie(data.title, data.poster_path, data.overview);
    res.json(obj);
});


//Route 2 favorite page
app.get('/favorite',(req,res)=>{
    res.send('Welcome to Favorite Page');
})

//............................................................................................................................

//Lab12 3rd party API

/// -1-trending endpoint
app.get("/trending", handelTrending);

//Constructor
function Movie(id, title, release_data, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_data = release_data;
    this.poster_path = poster_path;
    this.overview = overview;
}


//Fuctions
function handelTrending(req, res) {
    // To get data from 3rd party 
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
    //Axios 
    axios.get(url)
        .then(result => {
            console.log(result.data.results);
            let trending = result.data.results.map(trend => {
                let movie= new Movie(
                    trend.id,
                    trend.title,
                    trend.release_data,
                    trend.poster_path,
                    trend.overview
                );

                return movie;
            });
            res.json(trending);
        })
        .catch(error => {
            console.error( error);
            res.status(500).json('Internal Server Error');
        });
}


//***************************************************************** 
//search
app.get("/search", handelSearch);
///search: Search for a movie name
function handelSearch(req, res) {

let search=req.query.movieName;
const url= `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${search}&page=1`;

axios.get(url)
        .then(result => {
            console.log(result.data.results);
            let searching = result.data.results.map(trend => {
                let movie= new Movie(
                    trend.id,
                    trend.title,
                    trend.release_data,
                    trend.poster_path,
                    trend.overview
                );

                return movie;
            });
            res.json(searching);
        })
        .catch(error => {
            console.error( error);
            res.status(500).json('Internal Server Error');
        });
}

//************************************************************************** 

//Popular

app.get('/reviews',popularHandeler);

function popularHandeler(req,res){
    
  
    const url=`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`
    axios.get(url)
        .then(result => {
            console.log(result.data.results);
            let popularity = result.data.results.map(trend => {
                let movie= new Movie(
                    trend.id,
                    trend.title,
                    trend.release_data,
                    trend.poster_path,
                    trend.overview
                );

                return movie;
            });
            res.json(popularity);
        })
        .catch(error => {
            console.error( error);
            res.status(500).json('Internal Server Error');
        });
}
    
//********************************************************* 
//Movie upcoming

app.get("/upcoming", handelupComing);

function handelupComing(req,res){

const url=`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`;

axios.get(url)
        .then(result => {
            console.log(result.data.results);
            let upcomes = result.data.results.map(trend => {
                let movie= new Movie(
                    trend.id,
                    trend.title,
                    trend.release_data,
                    trend.poster_path,
                    trend.overview
                );

                return movie;
            });
            res.json(upcomes);
        })
        .catch(error => {
            console.error( error);
            res.status(500).json('Internal Server Error');
        });
}




//...............................................................................................................................

//Lab13: set up your database and read and save data to it

//routs
app.post('/addMovies',(req,res)=>{
    console.log(req.body);
    //const id=req.body.id;
    //const title=req.body.title;
    //const release_date=req.body.release_date;
    //const poster_path=req.body.poster_path;
    //const overview=req.body.overview;

    const {title, release_date, poster_path, overview } = req.body;//destructuring
    let sql = `INSERT INTO movie (title, release_date, poster_path, overview)
             VALUES ($1, $2, $3, $4) RETURNING *;` //this is called injection
    let value = [title, release_date, poster_path, overview]
    client.query(sql, value)
    .then((result) => {
        console.log(result.rows);
    return res.status(201).json(result.rows) })
});



//***********************************************************************************

app.get('/viewmovies',(req,res)=>{

    const sql = `SELECT * FROM movie`
    client.query(sql).then((result)=>{
        const data = result.rows
        res.json(data)
    })
    .catch()
})





//.............................................................................................................................

//Lab14

//routs
app.put('/update/:id',updateHandeler);
app.delete('/delete/:id',deleteHandeler);
app.get('/getmovie',getmovieHandeler);




//functions
function updateHandeler(req, res) {
    //const id=req.params.id;
    const {title, release_date, poster_path, overview } = req.body;
    let ID = req.params.id;
    const data = [title, release_date, poster_path, overview];
    const sql = `UPDATE movie
             SET title = $1, release_date = $2, poster_path = $3, overview = $4
                 WHERE id = ${ID} RETURNING *;`;
    

    client.query(sql, data)
        .then(result => {
            console.log('Movie updated:', result.rows);
            res.status(200).json(result.rows)
        })
        .catch(error => {
            console.error('Error updating a movie:', error);
            res.status(500).send('Error updating movie');
        });
}




function deleteHandeler(req, res) {
    const { id } = req.params;
    const values = [id];
    const sql = 'DELETE FROM movie WHERE id = $1';

    client.query(sql, values)
        .then(result => {
                console.log('Movie deleted:', result.rows);
                res.status(204).send('Deleted');
            
        })
        .catch(error => {
            console.error('Error deleting a movie:', error);
            res.status(500).send('Error deleting movie');
        });
}



function getmovieHandeler(req,res){
    let id=req.params.id;
    let values=[id];
    let sql=`SELECT * FROM movie
    WHERE id=$1;`
    client.query(sql,values).then(result=>{
        console.log(result.rows);
        res.status(200).send(result.rows)
    }).catch(err=>{
        console.error('Error getting a movie:', err);
            res.status(500).send('Error getting movie');
 }
    )
}










//.......................................................................................................................................
//start listen when db connect 
client.connect().then(() => {
    // the server always listen but i want it start listen when db connect 
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
})
//handeling errors
//404
app.use((req,res)=>{
    res.status(404).send(
       
     "Sorry, page not found :("
    )
})

//500
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send(
         "Sorry, something went wrong :|"
    );
});