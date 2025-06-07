const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    }
});

// Import models
const Presentation = require('../models/presentation')(sequelize);
const Slide = require('../models/slide')(sequelize);
const User = require('../models/user')(sequelize);
const Element = require('../models/element')(sequelize);

// Define associations
Presentation.hasMany(Slide, { foreignKey: 'presentation_id' });
Slide.belongsTo(Presentation, { foreignKey: 'presentation_id' });
Presentation.hasMany(User, { foreignKey: 'presentation_id' });
User.belongsTo(Presentation, { foreignKey: 'presentation_id' });
Slide.hasMany(Element, { foreignKey: 'slide_id' });
Element.belongsTo(Slide, { foreignKey: 'slide_id' });
Element.belongsTo(Presentation, { foreignKey: 'presentation_id' });

module.exports = sequelize;