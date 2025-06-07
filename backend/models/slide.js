const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Slide = sequelize.define('Slide', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        presentation_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        slide_index: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    return Slide;
};