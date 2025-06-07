const Element = require('../models/element');

exports.addElement = async (req, res) => {
    const { slideId, type, data } = req.body;
    try {
        const element = await Element.create({ slide_id: slideId, type, data });
        res.status(201).json(element);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getElements = async (req, res) => {
    const { slideId } = req.params;
    try {
        const elements = await Element.findAll({ where: { slide_id: slideId } });
        res.json(elements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateElement = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        const element = await Element.findByPk(id);
        if (!element) return res.status(404).json({ error: 'Element not found' });
        await element.update({ data });
        res.json(element);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteElement = async (req, res) => {
    const { id } = req.params;
    try {
        const element = await Element.findByPk(id);
        if (!element) return res.status(404).json({ error: 'Element not found' });
        await element.destroy();
        res.json({ message: 'Element deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};