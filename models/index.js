import 'dotenv/config';
import { Sequelize, DataTypes } from 'sequelize';
import User from './user.js';
import Story from './story.js';
import Tag from './tag.js';
import Page from './page.js';
import Link from './link.js';
const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql'
  });


const db = {};
let models = [User, Story, Tag, Page, Link]
db.Sequelize = Sequelize;
db.sequelize = sequelize;
// db.User = User(sequelize, DataTypes);
models.forEach(file => {
  const model = file(sequelize, DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;