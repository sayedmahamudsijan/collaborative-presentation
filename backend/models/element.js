const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Element = sequelize.define('Element', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        slide_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        presentation_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false
        }
    });
    return Element;
};