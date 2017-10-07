var express     = require('express');
var app         = express();
var port        = process.env.PORT || 8080;
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');
var router      = express.Router();
var appRoutes   = require('./app/routes/api')(router);
var path        = require('path');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api', appRoutes);


mongoose.connect('mongodb://localhost:27017/mean2', function(err){
    if(err){
        console.log('Not connected to the server' + err);
    }else{
        console.log('Successfuly connected to mongoDB')
    }
});


app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// Start server
app.listen(port, function(){
    console.log('Running server on port ' + port);
});