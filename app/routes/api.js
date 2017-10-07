var User = require('../models/user');
var jwt = require('jsonwebtoken'); // sign with default (HMAC SHA256)
var secret = 'lexx'; //pass secret in jwt

module.exports = function(router) {

    // User registration
    router.post('/users',function (req, res) {
        var user = new User();
            user.username = req.body.username;
            user.password = req.body.password;
            user.email = req.body.email;
            user.name = req.body.name;
        if(req.body.name == null || req.body.name == '' || req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == ''){
            res.json({ success: false, message: 'Ensure username. email and password were provided'}); //dans data on a (message = selon le texte et success = tjrs false)
        }else{
            user.save(function(err) {

                if(err){
                    if(err.errors != null){
                        if(err.errors.name ){
                            res.json({ success: false, message: err.errors.name.message}); //dans data on a (message = selon le texte et success = tjrs false)
                        }else if(err.errors.email ){
                            res.json({ success: false, message: err.errors.email.message});
                        }else if(err.errors.username ){
                            res.json({ success: false, message: err.errors.username.message});
                        }else if(err.errors.password ){
                            res.json({ success: false, message: err.errors.password.message});
                        }else{
                            res.json({ success: false, message: err});
                        }
                    }else if(err){
                        if(err.code == 11000){ // 11000 signifie dans le code message error duplicate key
                            if(err.errmsg[58] == 'u'){
                                res.json({ success: false, message: 'That username is already taken'});
                            }else if(err.errmsg[58] == 'e'){
                                res.json({ success: false, message: 'That e-mail is already taken'});
                            }
                        }else{
                            res.json({ success: false, message: err});
                        }

                    }
                }else{
                    res.json({ success: true, message: 'User saved!'}); //dans data on a (message = selon le texte et success = tjrs false)
                }
            });
        }
    });

    // verifie dans la vue si username pris ou pas pris
    router.post('/checkusername',function (req, res) {
        //chercher user par son username et selectionner(afficher)  email username password
        User.findOne({ username: req.body.username }).select('username').exec(function (err, user) { //executer et s'il y a des erreurs on traite les erreurs
            if(err) throw err;

            if(user){
                res.json({ success: false, message: 'The username already taken'});
            }else{
                res.json({ success: true, message: 'Valid username'});
            }
        });
    });
    // verifie dans la vue si email pris ou pas pris
    router.post('/checkemail',function (req, res) {
        //chercher user par son username et selectionner(afficher)  email username password
        User.findOne({ email: req.body.email }).select('email').exec(function (err, user) { //executer et s'il y a des erreurs on traite les erreurs
            if(err) throw err;

            if(user){
                res.json({ success: false, message: 'The email already taken'});
            }else{
                res.json({ success: true, message: 'Valid email'});
            }
        });
    });

    // User login
    router.post('/authenticate',function (req, res) {
        //chercher user par son username et selectionner(afficher)  email username password
       User.findOne({ username: req.body.username }).select('email username password').exec(function (err, user) { //executer et s'il y a des erreurs on traite les erreurs
           if(err) throw err;

           if(!user){ //si user n'exista pas
               res.json({ success: false, message: 'Could not authenticate user'}); //dans data on a (message = selon le texte et success = tjrs false)
           }else if(user){ //si user exista pas
               if(req.body.password){ //si password etait ecrit
                   var validPassword = user.comparePassword(req.body.password); //creer variable
               }else{ //si password etait pas ecrit
                   res.json({ success: false, message: 'No password provided'}); //message d'error
               }
               if(!validPassword){ //si le password est mauvais
                   res.json({ success: false, message: 'Could not authenticate password'}); //message d'error
               }else{
                   var token = jwt.sign({ username : user.username, email: user.email}, secret, { expiresIn: '1h' }); //toekn expire dans une heure
                   res.json({ success: true, message: 'User authenticated !', token: token}); //message de success + token-expiration
               }
           }
       });
    });

    router.use(function (req, res, next) {

        var token = req.body.token || req.body.query || req.headers['x-access-token'] ; // si le token est detecter on le verifie

            if(token){ // si token existe
                // verify a token symmetric
                jwt.verify(token, secret, function(err, decoded) {
                    if(err) {
                        res.json({ success: false, message: 'Token invalid'});
                    }else{
                        req.decoded = decoded;
                        next();
                    }
                });
            }else{
                res.json({ success: false, message: 'No token provided'}); //message de success + token-expiration
            }
    });

    router.post('/me', function (req, res) {
        res.send(req.decoded);
    });

    // Route get pour voir users permissions
    router.get('/permission', function (req, res) {
        User.findOne({ username: req.decoded.username}, function (err, user) {
            if(err) throw err; // Throw error if cannot connect
            // Check if username was found in database
            if(!user){ //si user n'exista pas, jamais arrivera
                res.json({ success: false, message: 'No user found'}); //dans data on a (message = selon le texte et success = tjrs false)
            }else{
                res.json({ success: true, permission: user.permission}); //dans data on a (message = selon le texte et success = tjrs false)
            }
        });
    });

    // Route to get all users for management page
    router.get('/management', function(req, res) {
        User.find({}, function(err, users) {
            if (err) throw err; // Throw error if cannot connect
            User.findOne({ username: req.decoded.username }, function(err, mainUser) {
                if (err) throw err; // Throw error if cannot connect
                // Check if logged in user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if user has editing/deleting privileges
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // Check if users were retrieved from database
                        if (!users) {
                            res.json({ success: false, message: 'Users not found' }); // Return error
                        } else {
                            res.json({ success: true, users: users, permission: mainUser.permission }); // Return users, along with current user's permission
                        }
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                    }
                }
            });
        });
    });

    router.delete('/management/:username', function (req, res) {
        var deleteUser = req.params.username;
        User.findOne({username: req.decoded.username}, function (err, mainUser) {
            if(err) throw err;

            if(!mainUser){
                res.json({success: false, message: 'No user found'});
            }else{
                if(mainUser.permission != 'admin'){ // tous sauf admin
                    res.json({success: false, message: 'Insuffisant permission'});
                }else{
                    User.findOneAndRemove({username: deleteUser}, function (err, user) {
                        if(err) throw err;
                        res.json({success: true});
                    });
                }
            }
        });
    });


    router.get('/edit/:id', function (req, res) {
        var editUser = req.params.id;

        User.findOne({username: req.decoded.username}, function (err, mainUser) {
            if(err) throw err;
            if(!mainUser){
                res.json({success: false, message: 'No user found'});
            }else{
                if(mainUser.permission == 'admin' || mainUser.permission == 'moderator'){
                    User.findOne({_id: editUser}, function (err, user) {
                       if(err) throw err;

                       if(!user){
                           res.json({success: false, message: 'No user found'});
                       }else{
                           res.json({success: true, user: user});
                        }
                    });
                }else{
                    res.json({success: false, message: 'Insuffisant permission'});
                }
            }
        });
    });


    // Route to update/edit a user
    router.put('/edit', function(req, res) {
        var editUser = req.body._id; // Assign _id from user to be editted to a variable
        if (req.body.name) var newName = req.body.name; // Check if a change to name was requested
        if (req.body.username) var newUsername = req.body.username; // Check if a change to username was requested
        if (req.body.email) var newEmail = req.body.email; // Check if a change to e-mail was requested
        if (req.body.permission) var newPermission = req.body.permission; // Check if a change to permission was requested
        // Look for logged in user in database to check if have appropriate access
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) throw err; // Throw err if cannot connnect
            // Check if logged in user is found in database
            if (!mainUser) {
                res.json({ success: false, message: "no user found" }); // Return erro
            } else {
                // Check if a change to name was requested
                if (newName) {
                    // Check if person making changes has appropriate access
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // Look for user in database
                        User.findOne({ _id: editUser }, function(err, user) {
                            if (err) throw err; // Throw error if cannot connect
                            // Check if user is in database
                            if (!user) {
                                res.json({ success: false, message: 'No user found' }); // Return error
                            } else {
                                user.name = newName; // Assign new name to user in database
                                // Save changes
                                user.save(function(err) {
                                    if (err) {
                                        console.log(err); // Log any errors to the console
                                    } else {
                                        res.json({ success: true, message: 'Name has been updated!' }); // Return success message
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    }
                }

                // Check if a change to username was requested
                if (newUsername) {
                    // Check if person making changes has appropriate access
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // Look for user in database
                        User.findOne({ _id: editUser }, function(err, user) {
                            if (err) throw err; // Throw error if cannot connect
                            // Check if user is in database
                            if (!user) {
                                res.json({ success: false, message: 'No user found' }); // Return error
                            } else {
                                user.username = newUsername; // Save new username to user in database
                                // Save changes
                                user.save(function(err) {
                                    if (err) {
                                        console.log(err); // Log error to console
                                    } else {
                                        res.json({ success: true, message: 'Username has been updated' }); // Return success
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    }
                }

                // Check if change to e-mail was requested
                if (newEmail) {
                    // Check if person making changes has appropriate access
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // Look for user that needs to be editted
                        User.findOne({ _id: editUser }, function(err, user) {
                            if (err) throw err; // Throw error if cannot connect
                            // Check if logged in user is in database
                            if (!user) {
                                res.json({ success: false, message: 'No user found' }); // Return error
                            } else {
                                user.email = newEmail; // Assign new e-mail to user in databse
                                // Save changes
                                user.save(function(err) {
                                    if (err) {
                                        console.log(err); // Log error to console
                                    } else {
                                        res.json({ success: true, message: 'E-mail has been updated' }); // Return success
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    }
                }

                // Check if a change to permission was requested
                if (newPermission) {
                    // Check if user making changes has appropriate access
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // Look for user to edit in database
                        User.findOne({ _id: editUser }, function(err, user) {
                            if (err) throw err; // Throw error if cannot connect
                            // Check if user is found in database
                            if (!user) {
                                res.json({ success: false, message: 'No user found' }); // Return error
                            } else {
                                // Check if attempting to set the 'user' permission
                                if (newPermission === 'user') {
                                    // Check the current permission is an admin
                                    if (user.permission === 'admin') {
                                        // Check if user making changes has access
                                        if (mainUser.permission !== 'admin') {
                                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' }); // Return error
                                        } else {
                                            user.permission = newPermission; // Assign new permission to user
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Long error to console
                                                } else {
                                                    res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                }
                                            });
                                        }
                                    } else {
                                        user.permission = newPermission; // Assign new permission to user
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                            }
                                        });
                                    }
                                }
                                // Check if attempting to set the 'moderator' permission
                                if (newPermission === 'moderator') {
                                    // Check if the current permission is 'admin'
                                    if (user.permission === 'admin') {
                                        // Check if user making changes has access
                                        if (mainUser.permission !== 'admin') {
                                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin' }); // Return error
                                        } else {
                                            user.permission = newPermission; // Assign new permission
                                            // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                }
                                            });
                                        }
                                    } else {
                                        user.permission = newPermission; // Assign new permssion
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                            }
                                        });
                                    }
                                }

                                // Check if assigning the 'admin' permission
                                if (newPermission === 'admin') {
                                    // Check if logged in user has access
                                    if (mainUser.permission === 'admin') {
                                        user.permission = newPermission; // Assign new permission
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                            }
                                        });
                                    } else {
                                        res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' }); // Return error
                                    }
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error

                    }
                }
            }
        });
    });

    return router;
}



