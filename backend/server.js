const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            'https://collaborative-presentation-57ff6ndzv.vercel.app',
            'https://collaborative-presentation-3ml9dkci4.vercel.app',
            'https://collaborative-presen-git-6e8bbd-sayed-mahmuds-projects-2f91c151.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: [
        'https://collaborative-presentation-57ff6ndzv.vercel.app',
        'https://collaborative-presentation-3ml9dkci4.vercel.app',
        'https://collaborative-presen-git-6e8bbd-sayed-mahmuds-projects-2f91c151.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use('/api', apiRoutes);

// Root route for health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Collaborative Presentation Backend is running' });
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_presentation', async ({ presentationId, nickname }) => {
        try {
            socket.join(presentationId);
            const [user, created] = await sequelize.models.User.findOrCreate({
                where: { presentation_id: presentationId, nickname },
                defaults: { role: 'viewer', socket_id: socket.id }
            });
            if (!created) {
                await sequelize.models.User.update(
                    { socket_id: socket.id },
                    { where: { presentation_id: presentationId, nickname } }
                );
            }
            const users = await sequelize.models.User.findAll({ where: { presentation_id: presentationId } });
            io.to(presentationId).emit('update_users', users);
        } catch (error) {
            console.error('Error joining presentation:', error);
        }
    });

    socket.on('update_role', async ({ presentationId, nickname, role }) => {
        try {
            await sequelize.models.User.update(
                { role },
                { where: { presentation_id: presentationId, nickname } }
            );
            const users = await sequelize.models.User.findAll({ where: { presentation_id: presentationId } });
            io.to(presentationId).emit('update_users', users);
        } catch (error) {
            console.error('Error updating role:', error);
        }
    });

    socket.on('add_element', async ({ slideId, element }) => {
        try {
            const newElement = await sequelize.models.Element.create({
                slide_id: slideId,
                type: element.type,
                data: element.data,
                presentation_id: element.presentationId
            });
            io.to(element.presentationId).emit('element_added', newElement);
        } catch (error) {
            console.error('Error adding element:', error);
        }
    });

    socket.on('update_element', async ({ elementId, data, presentationId }) => {
        try {
            await sequelize.models.Element.update({ data }, { where: { id: elementId } });
            io.to(presentationId).emit('element_updated', { id: elementId, data });
        } catch (error) {
            console.error('Error updating element:', error);
        }
    });

    socket.on('delete_element', async ({ elementId, presentationId }) => {
        try {
            await sequelize.models.Element.destroy({ where: { id: elementId } });
            io.to(presentationId).emit('element_deleted', elementId);
        } catch (error) {
            console.error('Error deleting element:', error);
        }
    });

    socket.on('disconnect', async () => {
        try {
            await sequelize.models.User.destroy({ where: { socket_id: socket.id } });
            console.log('Client disconnected:', socket.id);
        } catch (error) {
            console.error('Error on disconnect:', error);
        }
    });
});

// Start server
sequelize.authenticate()
    .then(() => {
        console.log('Database connected');
        return sequelize.sync({ force: false });
    })
    .then(() => {
        server.listen(process.env.PORT || 5000, () => {
            console.log('Server running on port', process.env.PORT || 5000);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to database or start server:', error);
    });
