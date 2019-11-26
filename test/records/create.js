const test = require('tape');
const httpRequest = require('../helpers/httpRequest');
const reset = require('../helpers/reset');
const createServer = require('../../server');

test('headers are available in transformations', async t => {
  t.plan(2);
  await reset();

  const server = await createServer().start();

  await httpRequest('/v1/databases/test/collections', {
    method: 'post',
    data: {
      name: 'users',
      schema: {
        test: ['required', 'string']
      },
      mutations: [
        '{...body test: headers["x-test-headers"]}'
      ]
    }
  });

  const testInsert = await httpRequest('/v1/databases/test/collections/users/records', {
    headers: {
      'x-test-headers': 'test-header-value'
    },
    method: 'post',
    data: {
      test: 'yes'
    }
  });

  t.equal(testInsert.status, 201);
  t.equal(testInsert.data.test, 'test-header-value');

  await server.stop();
});

test('headers are available in presenters', async t => {
  t.plan(2);
  await reset();

  const server = await createServer().start();

  await httpRequest('/v1/databases/test/collections', {
    method: 'post',
    data: {
      name: 'users',
      schema: {
        test: ['required', 'string']
      },
      presenters: [
        '{...record test: headers["x-test-headers"]}'
      ]
    }
  });

  const testInsert = await httpRequest('/v1/databases/test/collections/users/records', {
    headers: {
      'x-test-headers': 'test-header-value'
    },
    method: 'post',
    data: {
      test: 'yes'
    }
  });

  t.equal(testInsert.status, 201);
  t.equal(testInsert.data.test, 'test-header-value');

  await server.stop();
});