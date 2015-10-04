#Mongoose

(Note: these are notes for Chapter 5 from Amos Q. Haviv's "MEAN Web Development." Exerpts are
for educational purposes).

Mongoose is a Node.js module which acts as an ORM for MongoDB documents. However,
Given the NoSQL environment, it is more fitting to say that Mongoose provides 
Object-Document Mapping (ODM). While MongoDB is a schemaless database, Mongoose 
allows for both strict and loose schema approaches when dealing with Mongoose models. 

This code extends the NodeJS/Express example from Chapter 3

We will learn/cover the following topics:

+ A quick work on connecting to GitHub
+ Connect to a MongoDB instance using Mongoose - [MongoDB setup](#header)
+ Create a Mongoose schema - [Mongoose Schemas](#header)
+ Create a Mongoose model
+ Perform CRUD operations on the document collection using Mongoose
+ Validation
+ Schema modifiers 
+ Mongoose middleware
+ Virtual attributes 
+ Modifiers
+ MongoDB DBRef

#Connecting to GitHub

+ First, we want to ensure that our C9 account is connected to our GitHub and/or Bitbucket accounts. [Documentation](https://docs.c9.io/v1.0/docs/connected-services)
+ We then go to our [Repos](https://c9.io/account/repos)
+ Clone that Repos

##Considerations
The above assumes that you have code already in a repo and wish to clone **TO** Cloud 9. 

An issue with the Cloud 9 workflow is that you are likely to create your workspace FIRST. 
If so, then the quesiton is, how do I then push/sync my workspace TO GitHub?

Here is an article describing this issue:

[How to push an existing Cloud9 project to GitHub](http://lepidllama.net/blog/how-to-push-an-existing-cloud9-project-to-github/)

Here are exerpts from the process:

+ Consult again the documentation for [A guide on how to connect and integrate your Cloud9 account with services like GitHub and BitBucket](https://docs.c9.io/v1.0/docs/connected-services)
+ We can also obtain our SSH key (for a secure connection to GitHub):
  + Account Settings
  + SSH Keys
+ Take this SSH key and go to your [GitHub SSH Settings](https://github.com/settings/ssh) page - the link will take you there.
+ Select **Add SSH Key** and paste the Cloud 9 SSH key, I called mine "Cloud 9 IDE"
+ Then [Create a New Repository](https://github.com/new) at GitHub. The link will take you there.
+ Copy the SSH link (toggle to it as the HTTPS link is shown by default)

Now, we have to use git commands. A [Git reference](http://gitref.org/) may help.

+ First, we'll want to configure our name for identification of commits
  + `git config --global user.name "First Last"`
+ We should also set our email (should match your github email address)
  + `git config --global user.email "your_email@example.com"`
+ Initialize your repository to use Git
  + `git init`
+ Using the SSH to your repository, add your github repo
  + `git remote add origin git@github.com:yourname/yourrepository.git`
+ Add all the files in your workspace - do this each time you make a change
  + `git add .`
+ Create/Make a commit (like a save) with a commit message
  + `git commit -m "First commit"`
+ Push your changes
  + `git push -u origin master`
+ Viola!

Note: You will receive a message like this:

"The authenticity of host 'github.com (192.30.252.129)' can't be established.
RSA key fingerprint is 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
Are you sure you want to continue connecting (yes/no)?"

The answer is `yes`.

#And, Back to Mongoose
We resume...

##MongoDB setup

We now use a connection string for MongoDB as we will programmatically connect to 
MongoDB.

```JavaScript
mongodb://username:password@hostname:port/database
```

For cloud 9, we'll do this:

```JavaScript
"mondodb://" + process.env.IP + "/meandb"
```

So, we'll have something like this:

```JavaScript
var uri = "mondodb://" + process.env.IP + "/meandb";
var db = require('mongoose').connect(uri);
```

However, since we are using an MVC project structure, we'll place this into 
`config/env/development.js`

```JavaScript
module.exports = {
  db: 'mongodb://localhost/mean-book',
  sessionSecret: 'developmentSessionSecret'
};
```

We also place mongoose configration file, `mongoose.js`, in the `config` folder.

```JavaScript
var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function() {
  var db = mongoose.connect(config.db);

  return db;
};
```

We use the `db` property of the config object above.

So now our `server.js` file will look like this:

```JavaScript
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('./config/mongoose'),
    express = require('./config/express');

var db = mongoose();
var app = express();
app.listen(3000);

module.exports = app;

console.log('Server running...');
```

These are the basic steps for setting up Mongoose. Now, run the server.

##Mongoose Schemas

One of the points of Mongoose is to provide a schema-oriented means of setting up
a document collection.  This is also done to provide an **ODM** where the Schema also
describes a model object.

When dealing with objects, it is sometime necessary for documents to be similar. 
Mongoose uses a Schema object to define the document list of properties, 
each with its own type and constraints, to enforce the document structure. 
We will also define a Model constructor used to create instances of MongoDB 
documents. 

Let's look into:

+ Defining a user schema and model
+ Using a model instance to create, retrieve, and update user documents


##Creating a Schema and Model

We'll create a new file in `app/models` called `user.server.model.js`

```JavaScript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  password: String
});

mongoose.model('User', UserSchema);
```

We can now perform CRUD operations on the UserSchema model.

###Registering the model

We need to register the User model with Mongoose.  We change `config/mongoose.js`
in order to register the model.

```JavaScript
var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function() {
  var db = mongoose.connect(config.db);

  require('../app/models/user.server.model');

  return db;
};
```

##Creating a User Controller

We will create a Users controller called `users.server.controller.js` under the 
`app/controllers` folder that will handle all user-related operations.

```JavaScript
var User = require('mongoose').model('User');

exports.create = function(req, res, next) {
  var user = new User(req.body);

  user.save(function(err) {
    if (err) {
      return next(err);
    } else {
      res.json(user);
    }
  });
};
```

###User-Related Routes

We create `users.server.routes.js` in the `app/routes` folder in order to called
our newly-created model and its methods.

```JavaScript
var users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
  app.route('/users').post(users.create);
};
```

##RESTful Services

It is important to bear in mind that Express and Mongoose will be used to create
HTTP service endpoints.  As such, we'll be returning JSON to a client-side framework.

We'll want to change `config/express.js` accordingly:

```JavaScript
var config = require('./config'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session');

module.exports = function() {
  var app = express();

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(compress());
  }

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret
  }));

  app.set('views', './app/views');
  app.set('view engine', 'ejs');

  require('../app/routes/index.server.routes.js')(app);
  require('../app/routes/users.server.routes.js')(app);

  app.use(express.static('./public'));

  return app;
};
```

With a RESTful service, the proper way to create a new user is to use an HTTP POST 
request to the base users route.

###CREATE: Making a REST POST

In order to create a user, we must pass a JSON object in the body of a POST:

```JavaScript
{
  "firstName": "First",
  "lastName": "Last",
  "email": "user@example.com",
  "username": "username",
  "password": "password"
}
```

###Curl to test service endpoints

We can also use a command-line utility like `Curl` in order to test the HTTP POST
request.

```JavaScript
$ curl -X POST -H "Content-Type: application/json" -d '{"firstName":"First", "lastName":"Last","email":"user@example.com","username":"username","password":"password"}' localhost:3000/users
```

###READ: List a number of user documents

We'll use the `find()` - which is identical to the MongoDB version - to find items in the colletion.

We'll add a method called `list()` to the `users.server.controller.js' file:

```JavaScript
exports.list = function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    } else {
      res.json(users);
    }
  });
};
```

We also need to register a route for thisin the `users.server.routes.js`

```JavaScript
var users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
  app.route('/users')
    .post(users.create)
    .get(users.list);
};
```

####Advanced Mongoose Queries

Here is what the `find()` method can accept:

+ **Query**: This is a MongoDB query object
+ **[Fields]**: This is an optional string object that represents the document fields to return
+ **[Options]**: This is an optional options object
+ **[Callback]**: This is an optional callback function

Returning only usernames and emails:

```JavaScript
User.find({}, 'username email', function(err, users) {
  //do stuff
});
```

Passing query configuration objects:

```JavaScript
User.find({}, 'username email', {
  skip: 10,
  limit: 10
}, function(err, users) {
  ...
});
```

More on queries in the [Mongoose documentation](http://mongoosejs.com/docs/api.html). 

####FindOne

Works as `find()` does, but only returns the first item in the result set.

Let's add the following code a method, `userById()` which finds a document by
userId.

Add this to `users.server.controller.js`:

```JavaScript
exports.read = function(req, res) {
  res.json(req.user);
};

exports.userByID = function(req, res, next, id) {
  User.findOne({
    _id: id
  }, function(err, user) {
    if (err) {
      return next(err);
    } else {
      req.user = user;
      next();
    }
  });
};
```

And we create a route for this in `users.server.routes.js`:

```JavaScript
var users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
  app.route('/users')
     .post(users.create)
     .get(users.list);

  app.route('/users/:userId')
     .get(users.read);

  app.param('userId', users.userByID);
};
```

####Parameters

Take note of the code above: one of the routes is `/users/:userId`.  This signifies 
that `:userId` will be handled as a request parameter.  The `app.param('userId', users.userByID);`
line will ensure that our application can use the parameter.

####Testing

We can test this out via a browser now:

```JavaScript
http://localhost:3000/users
```

OR

```JavaScript
http://localhost:3000/users/[id]
```

###Update

We can use several methods for finding and updating a Mongoose model:

+ update()
+ findOneAndUpdate()
+ findByIdAndUpdate()

Since we've created our own `userById()` middleware method, we can easily use
`findByIdAndUpdate()`.  We add an `update()` method to `users.server.controller.js`:

```JavaScript
exports.update = function(req, res, next) {
    User.findByIdAndUpdate(req.user.id, req.body, function(err, user) {
        if (err) {
            return next(err);
        }
        else {
            res.json(user);
        }
    });
};
```

By now, you may see a pattern: 

+ create a method in the controller
+ create a route to direct browser requests for that controller method

We update `users.server.routes.js` accordingly:

```JavaScript
var users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
  app.route('/users')
     .post(users.create)
     .get(users.list);

  app.route('/users/:userId')
     .get(users.read)
     .put(users.update);

  app.param('userId', users.userByID);
};
```

We use method chaining to associate `users.update` with the `put` HTTP verb.

We can test this again using `curl`:

```JavaScript
curl -X PUT -H "Content-Type: application/json" -d '{"lastName": "Updated"}' localhost:8080/users/[id]
```

###Delete

We can use several methods for finding and deleting a Mongoose model:

+ remove()
+ findOneAndRemove()
+ findByIdAndRemove()

We add a `delete()` method to the `users.server.controller.js` file:

```JavaScript
exports.delete = function(req, res, next) {
    req.user.remove(function(err) {
        if (err) {
            return next(err);
        }
        else {
            res.json(req.user);
        }
    })
};
```

And, of course, we route by updating `users.server.routes.js`:

```JavaScript
var users = require('../../app/controllers/users.server.controller');

module.exports = function(app) { 
  app.route('/users')
    .post(users.create)
    .get(users.list);

  app.route('/users/:userId')
    .get(users.read)
    .put(users.update)
    .delete(users.delete);

  app.param('userId', users.userByID);
};
```

And, we can use something like `curl` to test this too:

```JavaScript
curl -X DELETE localhost:8080/users/[id]
```

##Mongoose Schema Capabilities

Our Mongoose ODM can do more than just CRUD operations. 

+ Define default values
+ Schema modifiers
+ Virtual attributes
+ Indexing

###Defining Default Values

Defining default field values is a common feature for data modeling frameworks. 
In Mongoose, default values can be defined at the schema level.

For instance, we can add a `created` field to the UserSchema. The `created` 
field should be initialized at creation time and save the time the user document was initially created. 

To implement this, we make the following changes to `UserSchema` in the 
`user.server.model.js` file:

```JavaScript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  password: String,
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('User', UserSchema);
```

As is the case with many JavaScript frameworks, we configure the `created` field
with a JavaScript object.

What is interesting about this Schema change is the effect it will have on previous documents.
Each document now has a created field and that value will reflect the moment the query causing this
schema change was executed.

Test it out by running the server and issuing the following `curl` command:

```JavaScript
$ curl -X POST -H "Content-Type: application/json" -d '{"firstName":"First", "lastName":"Last","email":"user@example.com","username":"username","password":"password"}' localhost:8080/users
```

###Scema Modifiers

Sometimes, you may want to perform a manipulation over schema fields before saving 
them or presenting them to the client. For this purpose, Mongoose uses a feature called modifiers. 
A modifier can either change the field's value before saving the document or represent it differently at query time.

####Predefined Modifiers

Ther are some predefined modifiers included with Mongoose. 

There are some built-in modifiers for the `String` datatype: 
+ trim modifier to remove whitespaces, 
+ an uppercase modifier to uppercase the field value

We can adjust our model to use trim on the username to ensure that the value is 
clear from a leading and trailing whitespace.: Modify `user.server.model.js`:

```JavaScript
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: {
    type: String,
    trim: true
  },
  password: String,
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('User', UserSchema);
```

####Custom Modifiers
You can also define your own custom setter modifiers to handle data manipulation 
before saving the document. We demonstrate this by adding a new `website` field to the User model. 
The website field should begin with 'http://' or 'https://'. To implement/enforce this, 
we include a custom modifier that validates the existence of these prefixes and adds them when necessary. 
To add your custom modifier, you will need to create the new website field with a set property as follows:

```JavaScript
var UserSchema = new Schema({
  ...
  website: {
    type: String,
    set: function(url) {
      if (!url) {
        return url;
      } else {
        if (url.indexOf('http://') !== 0   && url.indexOf('https://') !== 0) {
          url = 'http://' + url;
        }

        return url;
        }
    }
  },
  ...
});
```

Now, every user created will have a properly formed website URL that is modified at creation time. 
But what if you already have a big collection of user documents? 
You can of course migrate your existing data, but when dealing with big datasets, 
it would have a serious performance impact, so you can simply use getter modifiers.

####Custom Getter Modifiers
Getter modifiers are used to modify existing data before outputting the documents to next layer. 
For instance, in our previous example, a getter modifier would sometimes be better 
to change already existing user documents by modifying their website field at query 
time instead of going over your MongoDB collection and updating each document. 

Change **UserSchema** accordingly:

```JavaScript
var UserSchema = new Schema({
  ...
  website: {
    type: String,
    get: function(url) {
      if (!url) {
        return url;
      } else {
        if (url.indexOf('http://') !== 0   && url.indexOf('https://') !== 0) {
          url = 'http://' + url;
        }

        return url;
     }
    }
  },
  ...
});

UserSchema.set('toJSON', { getters: true });
```

You simply changed the setter modifier to a getter modifier by changing the set property to get. 
But the important thing to notice here is how you configured your schema using 
`UserSchema.set()`. This will force Mongoose to include getters when converting 
the MongoDB document to a JSON representation and will allow the output of documents 
using `res.json()` to include the getter's behavior. 
If you didn't include this, you would have your document's JSON representation ignoring the getter modifiers.

There is a lot more to modifiers in the [Mongoose Documentation](http://mongoosejs.com/docs/api.html).

###Virtual Attributes

As is the case with C#'s Properties, some attributes may be calculated or derived. 
These properties are called virtual attributes. 

In the UserSchema model, we may want to add a `fullName` field, which will represent 
the concatenation of the user's first and last names. To create this, we use the 
`virtual()` schema method:

```JavaScript
UserSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
});

UserSchema.set('toJSON', { getters: true, virtuals: true });
```

In the code snippet above we:

+ Created a virtual attribute named `fullName` and added it to the UserSchema model
+ Added a getter method to that virtual attribute
+ Configured the schema to include virtual attributes when converting the MongoDB document to a JSON representation

Virtual attributes can also have setters to specify how documents will be saved beyond what 
field attributes have been specified in the model. 

In the case of our UserSchema model, let's say you wanted to break a webform input's 
fullName field into your first and last name fields. 

To do so, a modified virtual declaration would look like the following code snippet:

```JavaScript
UserSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
}).set(function(fullName) {
  var splitName = fullName.split(' '); 
  this.firstName = splitName[0] || ''; 
  this.lastName = splitName[1] || ''; 
});
```

Virtual attributes are an important feature of Mongoose as they allow for on-the-fly
modification of document representation through an application's layers without 
getting persisted to MongoDB.

###Optimzing with Indices

As we've already discussed, MongoDB supports various types of indexes to optimize 
query execution. Mongoose extends this indexing functionality.

####Unique
An example of indexing is the unique index, which validates the uniqueness of a 
document field across a collection. 

In our example, it is common to keep usernames unique, so in order to indicate this 
to  MongoDB, we modify the UserSchema definition to include the following code snippet:

```JavaScript
var UserSchema = new Schema({
  ...
  username: {
    type: String,
    trim: true,
    unique: true
  },
  ...
});
```

While indexing is a wonderful feature of MongoDB, indicies do present some considerations. 
For example, if you define a unique index on a collection where data is already stored, 
you might encounter some errors while running your application until you fix the 
issues with your collection data. Another common issue is Mongoose's automatic creation 
of indexes when the application starts, a feature that could cause major performance 
issues when running in a production environment.

##Model Methods
Mongoose models already contain both static and instance predefined methods as a part of the API. 
However, we can define custom methods in accordance with OOP's **encapsulation** premise.

###Custom Static Methods
As an OOP trait, Model static methods provide model-level operations

If we implement the ability to search users by their username, we would create a static model method to do so. 
To add a static method, you will need to declare it as a member of your schema's statics property. 
In our case, adding a `findOneByUsername()` method would look like the following code snippet:

```JavaScript
UserSchema.statics.findOneByUsername = function (username, callback) {
  this.findOne({ username: new RegExp(username, 'i') }, callback);
};
```

Using the new `findOneByUsername()` method would be similar to using a standard 
static method by calling it directly from the User model as follows:

```JavaScript
User.findOneByUsername('username', function(err, user){
  //do stuff
});
```

###Custom Instance Methods
We will also need methods that perform instance operations. 

To add an instance method, you will need to declare it as a member of your schema's 
methods property. Let's say you want to validate your user's password with an 
`authenticate()` method. Adding this method would then be similar to the following code snippet:

```JavaScript
UserSchema.methods.authenticate = function(password) {
  return this.password === password;
};
```

We can then call this method from a User model instance:

```JavaScript
user.authenticate('password');
```

##Model Validation
Considering the [GIGO](https://en.wikipedia.org/wiki/Garbage_in,_garbage_out) principle, 
validating model data is important. When users input information to your application, 
you'll want/need to validate that information before passing it on to MongoDB. 
Moongoose allows you to validate at the model level. 

Mongoose supports both predefined validators and custom validators. Validators are 
defined at the field level of a document and are executed when the document is 
being saved. If a validation error occurs, the save operation is aborted and the 
error is passed to the callback.

###Pre Validators
Mongoose provides several predefined (and often type-specific) validators. The basic 
validation of any application is of course the existence of value. To validate field 
existence in Mongoose, you'll need to use the required property in the field you 
want to validate. 

Let's say you want to verify the existence of a username field before you save the 
user document. To do so, you'll need to make the following changes to your UserSchema:

```JavaScript
var UserSchema = new Schema({
  ...
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  ...
});
```

If you try to save a document of type UserSchema in the collection, and the `username`
field is not set, an error will be thrown.

Mongoose also includes type-based predefined validators, such as the `enum` and `match` validators for strings. 

For instance, to validate your email field, you would need to change your UserSchema as follows:

```JavaScript
var UserSchema = new Schema({
  ...
  email: {
    type: String,
    index: true,
    match: /.+\@.+\..+/
  },
  ...
});
```

A `match` validator ensure a field value matches the given regex expression.

Another example is the `enum` validator, which can help you define a set of strings 
that are available for that field value. Let's say you add a role field. A possible 
validation would look like this:

```JavaScript
var UserSchema = new Schema({
  ...
  role: {
    type: String,
    enum: ['Admin', 'Owner', 'User']
  },
  ...
});
```

As with all features we've covered, The [Mongoose Documentation](http://mongoosejs.com/docs/validation.html)
provides more information on how to use predefined validators.

###Custom Validators
Mongoose provides for defining custom validators using the `validate` property. 
The `validate` property value should be an array consisting of a validation function and an error message. 
Let's say you want to validate the length of your user's password. To do so, 
you would have to make these changes in your UserSchema:

```JavaScript
var UserSchema = new Schema({
  ...
  password: {
    type: String,
    validate: [
      function(password) {
        return password.length >= 6;
      },
      'Password should be longer'
    ]
  },
  ...
});
```

The custom validator above ensures that a password is at least six characters long, 
or it will prevent the saving of documents and pass the error message you defined to the callback.

##Mongoose Middleware
Mongoose middleware are functions that can intercept the process of the `init`, 
`validate`, `save`, and `remove` instance methods. Middleware are executed at the 
instance level and have two types: 

+ pre middleware
+ post middleware

###Pre middleware
**Pre** middleware gets executed before the operation happens. For instance, a 
pre-save middleware will get executed before the saving of the document. 
This functionality makes pre middleware perfect for more complex validations and 
default values assignment.

A pre middleware is defined using the `pre()` method of the schema object, so 
validating your model using a pre middleware will look like the following code snippet:

```JavaScript
UserSchema.pre('save', function(next) {
  if (...) {
    next()
  } else {
    next(new Error('An Error Occured'));
  }
});
```

###Post middleware

A **Post** middleware gets executed after the operation happens. For instance, a 
post-save middleware will get executed after saving the document. This functionality 
makes post middleware perfect to log your application logic.

A post middleware is defined using the `post()` method of the schema object, so 
logging your model's `save()` method using a post middleware will look something 
like the following code snippet:

```JavaScript
UserSchema.post('save', function(next) {
  if(this.isNew) {
    console.log('A new user was created.');
  } else {
    console.log('A user updated is details.');
  }
});
```
Notice how you can use the model `isNew` property to understand whether a model instance was created or updated.

Again, consulting the [Mongoose Documentation on middleware](http://mongoosejs.com/docs/middleware.html) is a good idea.

#Mongoose DBRef
As a NoSQL database, MongoDB doesn't support joins.  However MongoDB does support 
the reference of a document to another document using a convention named `DBRef`. 
Mongoose includes support for DBRefs using the ObjectID schema type and the use of the `ref` property. 
Mongoose also supports the population of the parent document with the child document when querying the database.

To understand this better, let's say you create another schema for blog posts called 
`PostSchema`. Because a user authors a blog post, `PostSchema` will contain an 
`author` field that will be populated by a `User` model instance. So, a 
`PostSchema` will have to look like the following code snippet:

```JavaScript
var PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Post', PostSchema);
```

Notice the `ref` property telling Mongoose that the `author` field will use the 
`User` model to populate the value.

To create a new blog post, you will need to retrieve or create an instance of the 
`User` model, create an instance of the `Post` model, and then assign the post 
`author` property with the user instance. 

An example of this should be as follows:

```JavaScript
var user = new User();
user.save();

var post = new Post();
post.author = user;
post.save();
```

Mongoose will create a DBRef in the MongoDB post document and will later use 
it to retrieve the referenced document.

Since the DBRef is only an `ObjectID` reference to a real document, Mongoose will 
have to populate the `post` instance with the `user` instance. To do so, you'll 
have to tell Mongoose to populate the post object using the `populate()` method 
when retrieving the document. For instance, a `find()` method that populates the 
`author` property will look like the following code snippet:

```JavaScript
Post.find().populate('author').exec(function(err, posts) {
  ...
});
```

Mongoose will then retrieve all the documents in the posts collection and populate their author attribute.

If you want to know more about DBRefs, consult the [Mongoose Documentation](http://mongoosejs.com/docs/populate.html)