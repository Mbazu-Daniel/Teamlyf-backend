import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger.json';
const endpointsFiles = ['./*/*/*.routes.js'];

const config = {
	info: {
		title: 'Teamlyf API Documentation',
		description:
			'Welcome to TeamLyf, the ultimate solution for seamless collaboration and enhance teamwork within your organization. Our platform integrates essential tools including HR Management, Chat Application, Video Conferencing, Task/Project Management, and Document Management System into a single, user-friendly interface. TeamLyf provides an integrated solution to foster collaboration and productivity.',
		version: '1.0.0',
	},
	tags: [
		'Auth',
		'Users',
		'Workspace',
		'Invite',
		'Employees',
		'Teams',
		'Project',
		'Leave',
		'Leave Comment',
		'Leave Type',
	],
	host: 'localhost:8000/api/v1' || process.env.API_URL,

	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
			},
		},

		schemas: {
			LoginRequest: {
				$email: 'example@gmail.com',
				$password: 'password',
			},
		},
	},
	schemes: ['http', 'https'],
};

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, config);
