const { tables } = require('../../src/data');
const { withServer, login } = require('../supertest.setup');

const data = {
    transactions: [{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        product_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        amount: 3500,
        date: new Date(2021, 4, 25, 19, 40),
    },
    {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff87',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        product_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        amount: -220,
        date: new Date(2021, 4, 8, 20, 0),
    },
    {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
        user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        product_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        amount: -74,
        date: new Date(2021, 4, 21, 14, 30),
    },
    ],
    products: [{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
        name: 'Test product',
        price: 3,
    }],
};

const dataToDelete = {
    transactions: [
        '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
        '7f28c5f9-d711-4cd6-ac15-d13d71abff87',
        '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
    ],
    products: ['7f28c5f9-d711-4cd6-ac15-d13d71abff90'],
};

describe('Transactions', () => {
    let request;
    let knex;
    let loginHeader;

    withServer(({ knex: k, supertest: s }) => {
        knex = k;
        request = s;
    });

    beforeAll(async () => {
        loginHeader = await login(request);
    });

    const url = '/api/transactions';

    describe('GET /api/transactions', () => {
        beforeAll(async () => {
            await knex(tables.product).insert(data.products);
            await knex(tables.transaction).insert(data.transactions);
        });

        afterAll(async () => {
            await knex(tables.transaction)
                .whereIn('id', dataToDelete.transactions)
                .delete();

            await knex(tables.product)
                .whereIn('id', dataToDelete.products)
                .delete();
        });

        test('it should 200 and return all transactions', async () => {
            const response = await request.get(url)
                .set('Authorization', loginHeader);
            expect(response.status).toBe(200);
            expect(response.body.limit).toBe(100);
            expect(response.body.offset).toBe(0);
            expect(response.body.data.length).toBe(3);
        });


        test('it should 200 and paginate the list of transactions', async () => {
            const response = await request.get(`${url}?limit=2&offset=1`)
                .set('Authorization', loginHeader);
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2);
            expect(response.body.limit).toBe(2);
            expect(response.body.offset).toBe(1);
            expect(response.body.data[0]).toEqual({
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff88',
                user: {
                    id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
                    name: 'Test User',
                },
                product: {
                    id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                    name: 'Test product',
                },
                amount: -74,
                date: new Date(2021, 4, 21, 14, 30).toJSON(),
            });
            expect(response.body.data[1]).toEqual({
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff86',
                user: {
                    id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
                    name: 'Test User',
                },
                product: {
                    id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                    name: 'Test product',
                },
                amount: 3500,
                date: new Date(2021, 4, 25, 19, 40).toJSON(),
            });
        });
    });

    describe('GET /api/transactions/:id', () => {

        beforeAll(async () => {
            await knex(tables.product).insert(data.products);
            await knex(tables.transaction).insert(data.transactions[0]);
        });

        afterAll(async () => {
            await knex(tables.transaction)
                .where('id', dataToDelete.transactions[0])
                .delete();

            await knex(tables.product)
                .whereIn('id', dataToDelete.products)
                .delete();
        });

        test('it should 200 and return the requested transaction', async () => {
            const transactionId = data.transactions[0].id;
            const response = await request.get(`${url}/${transactionId}`)
                .set('Authorization', loginHeader);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: transactionId,
                user: {
                    id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
                    name: 'Test User',
                },
                product: {
                    id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                    name: 'Test product',
                },
                amount: 3500,
                date: new Date(2021, 4, 25, 19, 40).toJSON(),
            });
        });
    });

    describe('POST /api/transactions', () => {

        const transactionsToDelete = [];
        const usersToDelete = [];

        beforeAll(async () => {
            await knex(tables.product).insert(data.products);
        });

        afterAll(async () => {
            await knex(tables.transaction)
                .whereIn('id', transactionsToDelete)
                .delete();

            await knex(tables.product)
                .whereIn('id', dataToDelete.products)
                .delete();
        });

        test('it should 201 and return the created transaction', async () => {
            const response = await request.post(url)
                .set('Authorization', loginHeader)
                .send({
                    amount: 102,
                    date: '2021-05-27T13:00:00.000Z',
                    productId: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                });

            expect(response.status).toBe(201);
            expect(response.body.id).toBeTruthy();
            expect(response.body.amount).toBe(102);
            expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
            expect(response.body.product).toEqual({
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                name: 'Test product',
            });
            expect(response.body.user.id).toBeTruthy();
            expect(response.body.user.name).toBe('Test User');

            transactionsToDelete.push(response.body.id);
            usersToDelete.push(response.body.user.id);
        });
    });

    describe('PUT /api/transactions/:id', () => {
        const usersToDelete = [];

        beforeAll(async () => {
            await knex(tables.product).insert(data.products);
            await knex(tables.transaction).insert([{
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff89',
                amount: 102,
                date: new Date(2021, 4, 25, 19, 40),
                product_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
            }]);
        });

        afterAll(async () => {
            await knex(tables.transaction)
                .where('id', '7f28c5f9-d711-4cd6-ac15-d13d71abff89')
                .delete();

            await knex(tables.product)
                .whereIn('id', dataToDelete.products)
                .delete();
        });

        test('it should 200 and return the updated transaction', async () => {
            const response = await request.put(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
                .set('Authorization', loginHeader)
                .send({
                    amount: -125,
                    date: '2021-05-27T13:00:00.000Z',
                    productId: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                });

            expect(response.status).toBe(200);
            expect(response.body.id).toBeTruthy();
            expect(response.body.amount).toBe(-125);
            expect(response.body.date).toBe('2021-05-27T13:00:00.000Z');
            expect(response.body.product).toEqual({
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                name: 'Test product',
            });
            expect(response.body.user.name).toEqual('Test User');

            usersToDelete.push(response.body.user.id);
        });
    });


    describe('DELETE /api/transactions/:id', () => {

        beforeAll(async () => {
            await knex(tables.product).insert(data.products);

            await knex(tables.transaction).insert([{
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff89',
                amount: 102,
                date: new Date(2021, 4, 25, 19, 40),
                product_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff90',
                user_id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
            }]);
        });

        afterAll(async () => {
            await knex(tables.product)
                .whereIn('id', dataToDelete.products)
                .delete();
        });

        test('it should 204 and return nothing', async () => {
            const response = await request.delete(`${url}/7f28c5f9-d711-4cd6-ac15-d13d71abff89`)
                .set('Authorization', loginHeader);
            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
        });
    });
});