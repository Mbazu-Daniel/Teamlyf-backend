import app from './app.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000; // Set a default port if PORT environment variable is not defined

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on PORT ${PORT}`);
});

// Handle server shutdown gracefully
process.on('SIGINT', async () => {
	console.log('Server shutting down...');
	try {
		// Disconnect the Prisma client
		await prisma.$disconnect();
		console.log('Prisma client disconnected.');
		// Close the server
		server.close(() => {
			console.log('Server stopped.');
			process.exit(0);
		});
	} catch (error) {
		console.error('Error occurred during shutdown:', error);
		process.exit(1);
	}
});
