// controllers/usersController.js
const usersStorage = require("../storages/usersStorage");

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

/* exports.usersCreatePost = (req, res) => {
  const { firstName, lastName, email, age } = req.body;
  usersStorage.addUser({ firstName, lastName, email, age });
  res.redirect("/");
};
 */
// This just shows the new stuff we're adding to the existing contents
const { body, validationResult, matchedData } = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`Last name ${lengthErr}`),
  body("email").trim()
    .isEmail().withMessage("Must be a valid email address.")
    .normalizeEmail(),
  body("age").optional({ checkFalsy: true })
    .isInt({ min: 0, max: 120 }).withMessage("Age must be a number between 0 and 120."),
];

// We can pass an entire array of middleware validations to our controller.
exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
      });
    }
    const { firstName, lastName , email, age} = req.body;
    console.log(matchedData(req));
    usersStorage.addUser({ firstName, lastName, email, age });
    console.log(usersStorage);
    res.redirect("/");
  }
];


exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render("updateUser", {
    title: "Update user",
    user: user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName } = matchedData(req);
    usersStorage.updateUser(req.params.id, { firstName, lastName });
    res.redirect("/");
  }
];

// Tell the server to delete a matching user, if any. Otherwise, respond with an error.
exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect("/");
};

exports.usersSearchGet = (req, res) => {
  const { query } = req.query; // vine din formularul GET

  // Dacă nu e nimic introdus, doar reafișăm o pagină goală
  if (!query || query.trim() === "") {
    return res.render("search", {
      title: "Search users",
      users: [],
      searchTerm: "",
    });
  }

  // Transformă query în lowercase pentru o potrivire flexibilă
  const searchTerm = query.toLowerCase();

  // Căutăm în storage (după firstName, lastName sau email)
  const results = usersStorage.getUsers().filter((user) => {
    return (
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  });

  // Randăm pagina cu rezultatele
  res.render("search", {
    title: "Search results",
    users: results,
    searchTerm: query,
  });
};