import test from 'ava';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('supertest');

test('handles ping lifecycle', async t => {
  const res = await request(makeApp())
    .post('/')
    .send({lifecycle: 'PING', pingData: {challenge: "a-challenge"}});

  t.is(res.status, 200);
  t.is(res.body.pingData.challenge, 'a-challenge');
});

function makeApp() {
  const app = require('./server');
  return app;
}
