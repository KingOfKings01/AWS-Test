
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

// Configure Sequelize connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.RDS_ENDPOINT,
  dialect: process.env.DIALECT,
  logging: false
});

// Define a model
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to display form
app.get('/', (req, res) => {
  res.send(`
    <form action="/submit" method="POST">
      <input type="text" name="name" placeholder="Enter your name" required>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Route to handle form submission
app.post('/submit', async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.create({ name });
    res.send(`Data saved successfully: ${user.name}`);
  } catch (error) {
    res.status(500).send('Error saving data');
  }
});

app.get('/users', async (req, res) => {
    try {
      const users = await User.findAll();
      res.send(`
        <h1>User List</h1>
        <ul>
          ${users.map(user => `<li>${user.name}</li>`).join('')}
        </ul>
        <a href="/">Go back to form</a>
      `);
    } catch (error) {
      res.status(500).send('Error retrieving users');
    }
  });

// Sync Sequelize models and start the server
sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
