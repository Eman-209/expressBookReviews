const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"eman","password":"123"}];

const isValid = (username)=>{ 
  let validators = users.filter((user)=> {
  return (user.username === username)
});
  return validators.length === 0;

}

const authenticatedUser = (username,password)=>{ 
let valid = users.filter((user)=> {
  return (user.username === username && user.password === password)
});
  return valid.length > 0;


}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message: "Error logging in"});
  }

  if(authenticatedUser(username,password)){
      let accessToken = jwt.sign({
        data : password
      }, 'access', {expiresIn : 60 * 60})

      req.session.authorization = {
        accessToken,username
      } 
      return res.status(200).send("User successfull logged in")
  }
  else{
    return res.status(208).json({message: "Invalid login. Check username and password"});
  }});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if(books[isbn]){
    let book = books[isbn];
  book.reviews[username] = review;
  return res.status(200).send("Review added successfully");
  }else{
    return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    let book = books[isbn];
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).send("Review deleted successfully");
    } else {
      return res.status(404).json({message: "No review by this user to delete"});
    }
  } else {
    return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
