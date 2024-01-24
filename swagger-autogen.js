import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger.json';
const endpointsFiles = ['./*/*/*.routes.js'];

const config = {
	info: {
		title: 'Teamlyf API Documentation',
		description: '',
	},
	tags: [
		'Auth',
		'Users',
		'Workspace',
		'Invite',
		'Employees',
		'Teams',
		'Leave',
		'Leave Comment',
		'Leave Type',
	],
	host: 'localhost:8000/api/v1',

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


