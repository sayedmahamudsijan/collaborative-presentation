const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');

router.get('/presentations', async (req, res) => {
    try {
        const presentations = await sequelize.models.Presentation.findAll();
        res.json(presentations);
    } catch (error) {
        console.error('Error fetching presentations:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch presentations' });
    }
});

router.post('/presentations', async (req, res) => {
    try {
        const { title, nickname } = req.body;
        const presentation = await sequelize.models.Presentation.create({
            title,
            creator_nickname: nickname
        });
        await sequelize.models.User.create({
            presentation_id: presentation.id,
            nickname,
            role: 'editor'
        });
        res.json(presentation);
    } catch (error) {
        console.error('Error creating presentation:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to create presentation' });
    }
});

router.post('/presentations/join', async (req, res) => {
    try {
        const { presentationId, nickname } = req.body;
        await sequelize.models.User.create({
            presentation_id: presentationId,
            nickname,
            role: 'viewer'
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error joining presentation:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to join presentation' });
    }
});

router.get('/slides/:presentationId', async (req, res) => {
    try {
        const slides = await sequelize.models.Slide.findAll({
            where: { presentation_id: req.params.presentationId }
        });
        res.json(slides || []);
    } catch (error) {
        console.error('Error fetching slides:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch slides' });
    }
});

router.post('/slides', async (req, res) => {
    try {
        const { presentationId, slideIndex } = req.body;
        const slide = await sequelize.models.Slide.create({
            presentation_id: presentationId,
            slide_index: slideIndex
        });
        res.json(slide);
    } catch (error) {
        console.error('Error creating slide:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to create slide' });
    }
});

router.get('/elements/:slideId', async (req, res) => {
    try {
        const elements = await sequelize.models.Element.findAll({
            where: { slide_id: req.params.slideId }
        });
        res.json(elements);
    } catch (error) {
        console.error('Error fetching elements:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch elements' });
    }
});

router.post('/elements', async (req, res) => {
    try {
        const { slideId, type, data, presentationId } = req.body;
        console.log('Received element data:', { slideId, type, data, presentationId }); // Debug log
        const element = await sequelize.models.Element.create({
            slide_id: slideId,
            type,
            data,
            presentation_id: presentationId
        });
        res.json(element);
    } catch (error) {
        console.error('Error creating element:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to create element' });
    }
});

router.put('/elements/:id', async (req, res) => {
    try {
        const { data } = req.body;
        console.log('Updating element:', { id: req.params.id, data }); // Debug log
        const [updated] = await sequelize.models.Element.update(
            { data },
            { where: { id: req.params.id } }
        );
        if (updated) {
            const element = await sequelize.models.Element.findByPk(req.params.id);
            res.json(element);
        } else {
            res.status(404).json({ error: 'Element not found' });
        }
    } catch (error) {
        console.error('Error updating element:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to update element' });
    }
});

router.delete('/elements/:id', async (req, res) => {
    try {
        const deleted = await sequelize.models.Element.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Element not found' });
        }
    } catch (error) {
        console.error('Error deleting element:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to delete element' });
    }
});

module.exports = router;
