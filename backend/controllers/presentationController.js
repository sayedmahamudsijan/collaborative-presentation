const Presentation = require('../models/presentation');
const User = require('../models/user');

exports.createPresentation = async (req, res) => {
    const { title, nickname } = req.body;
    try {
        const presentation = await Presentation.create({ title, creator_nickname: nickname });
        await User.create({ presentation_id: presentation.id, nickname, role: 'editor', socket_id: null });
        res.status(201).json(presentation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPresentations = async (req, res) => {
    try {
        const presentations = await Presentation.findAll();
        res.json(presentations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.joinPresentation = async (req, res) => {
    const { presentationId, nickname } = req.body;
    try {
        const user = await User.create({ presentation_id: presentationId, nickname, role: 'viewer', socket_id: null });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};