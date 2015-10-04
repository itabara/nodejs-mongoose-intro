exports.render = function(req, res) {
    
    //check to see if the session variable is there
    if(req.session.lastVisit)
    {
        //write it
        console.log('date from session: ' + req.session.lastVisit);
    }
    
    //set a new value for the session variable
    req.session.lastVisit = new Date();
    
    res.render('index', {
        title: 'Hello World'
    })
};