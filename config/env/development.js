module.exports = 
{
    //Development configuration options
    db: 'mongodb://' + process.env.IP + '/meandb',
    sessionSecret : 'developmentSessionSecret'
}