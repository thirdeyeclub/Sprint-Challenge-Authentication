const db = require("../database/dbConfig");

module.exports = {
findByUser,
add
};

function findByUser(filter) {
return db("users")
    .where(filter)
    .first();
}

function add(user) {
return db("users")
    .insert(user)
    .then(ids => {
    return getUserById(ids[0]);
    });
}

function getUserById(id) {
return db("users")
    .where({ id })
    .first();
}