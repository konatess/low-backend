import 'dotenv/config';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql'
  });


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
export default db;