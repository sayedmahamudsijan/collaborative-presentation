const Slide = require('../models/slide');

exports.createSlide = async (req, res) => {
    const { presentationId, slideIndex } = req.body;
    try {
        const slide = await Slide.create({ presentation_id: presentationId, slide_index: slideIndex });
        res.status(201).json(slide);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSlides = async (req, res) => {
    const { presentationId } = req.params;
    try {
        const slides = await Slide.findAll({ where: { presentation_id: presentationId } });
        res.json(slides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};