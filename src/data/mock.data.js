let PRODUCTS = [
	{
		id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
		name: 'Asperge',
		price: 3,
	},
	{
		id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
		name: 'Tomaat',
		price: 2,
	},
	{
		id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
		name: 'Appel',
		price: 4,
	},
];

let TRANSACTIONS = [
	{
		id: '7f28c5f9-d711-4cd6-ac15-d13d71abff87',
		amount: -2000,
		date: '2021-05-08T00:00:00.000Z',
		user: {
			id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
			name: 'Thomas Aelbrecht',
		},
		product: {
			id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
			name: 'Tomato',
		},
	},
	{
		id: '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
		amount: -74,
		date: '2021-05-21T12:30:00.000Z',
		user: {
			id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
			name: 'Thomas Aelbrecht',
		},
		product: {
			id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
			name: 'Asperge',
		},
	},
	{
		id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
		amount: 3500,
		date: '2021-05-25T17:40:00.000Z',
		user: {
			id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
			name: 'Thomas Aelbrecht',
		},
		prodcut: {
			id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
			name: 'Carrot',
		},
	},
];

module.exports = { TRANSACTIONS, PLACES };