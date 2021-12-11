const { withServer, login } = require('../supertest.setup');
const { tables } = require('../../src/data');

const data = {
    products: [{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        name: 'Loon',
        price: 5
    },
    {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        name: 'Bezine',
        price: 2
    },
    {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
        name: 'Irish pub',
        price: 4
    }
    ]
};

const dataToDelete = {
    products: [
        '7f28c5f9-d711-4cd6-ac15-d13d71abff83',
        '7f28c5f9-d711-4cd6-ac15-d13d71abff84',
        '7f28c5f9-d711-4cd6-ac15-d13d71abff85',
    ]
};

describe('products', () => {
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

    const url = '/api/products';

    describe('GET /api/products', () => {

        beforeAll(async () => {
            await knex(tables.product).insert(data.products);
        });

        afterAll(async () => {
            await knex(tables.product)
                .whereIn('id', dataToDelete.products)
                .delete();
        });

        test('it should 200 and return all products', async () => {
            const response = await request.get(url).set('Authorization', loginHeader);

            expect(response.status).toBe(200);
            // one product from transactions could be present due to Jest running all tests parallel
            // so check at least 3 products exist
            expect(response.body.count).toBeGreaterThanOrEqual(3);
            expect(response.body.data.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('GET /api/products/:id', () => {

        beforeAll(async () => {
            await knex(tables.product).insert(data.products[0]);
        });

        afterAll(async () => {
            await knex(tables.product)
                .where('id', data.products[0].id)
                .delete();
        });

        test('it should 200 and return the requested product', async () => {
            const response = await request.get(`${url}/${data.products[0].id}`).set('Authorization', loginHeader);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(data.products[0]);
        });
    });

    describe('POST /api/products', () => {

        const productsToDelete = [];

        afterAll(async () => {
            await knex(tables.product)
                .whereIn('id', productsToDelete)
                .delete();
        });

        test('it should 201 and return the created product with it\'s price', async () => {
            const response = await request.post(url).set('Authorization', loginHeader)
                .send({
                    name: 'Lovely product',
                    price: 5,
                });

            expect(response.status).toBe(201);
            expect(response.body.id).toBeTruthy();
            expect(response.body.name).toBe('Lovely product');
            expect(response.body.price).toBe(5);

            productsToDelete.push(response.body.id);
        });
    });

    describe('PUT /api/products/:id', () => {

        beforeAll(async () => {
            await knex(tables.product).insert(data.products);
        });

        afterAll(async () => {
            await knex(tables.product)
                .whereIn('id', dataToDelete.products)
                .delete();
        });

        test('it should 200 and return the updated product', async () => {
            const response = await request.put(`${url}/${data.products[0].id}`).set('Authorization', loginHeader)
                .send({
                    name: 'Changed name',
                    price: 1,
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: data.products[0].id,
                name: 'Changed name',
                price: 1,
            });
        });
    });

    describe('DELETE /api/products/:id', () => {

        beforeAll(async () => {
            await knex(tables.product).insert(data.products[0]);
        });

        test('it should 204 and return nothing', async () => {
            const response = await request.delete(`${url}/${data.products[0].id}`).set('Authorization', loginHeader);

            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
        });
    });
});