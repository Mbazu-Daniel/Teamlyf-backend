import { exec } from 'child_process';
import app from './app.js';
import { PrismaClient } from '@prisma/client';

// Initialize the Prisma client
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000; // Set a default port if PORT environment variable is not defined

// Run `npx prisma generate` command
exec('npx prisma generate', (error, stdout, stderr) => {
	if (error) {
		console.error(`Error running 'npx prisma generate': ${error.message}`);
		return;
	}
	if (stderr) {
		console.error(`'npx prisma generate' encountered an error: ${stderr}`);
		return;
	}
	console.log(`'npx prisma generate' output: ${stdout}`);

	// Start the server after Prisma client generation
	startServer();
});

function startServer() {
	// Start the server
	const server = app.listen(PORT, () => {
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
}
