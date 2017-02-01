import React from 'react';
import renderer from 'react-test-renderer';
import xs from 'xstream';
import connect from './connect';
import Provider from './Provider';

test('connect: should return a function', () => {
  expect('test').toBe('done');
});

test('connect: storeToPropsFunc param should be mandatory', () => {
  expect('test').toBe('done');
});

test('connect: storeToPropsFunc param should be a function', () => {
  expect('test').toBe('done');
});

test('Connect component: should render false when state.go === false', () => {
  expect('test').toBe('done');
});

test('Connect component: should only render the WrappedComponent when go === true', () => {
  expect('test').toBe('done');
});

test('Connect component: fragment attribute should contains keys specified by the storeToPropsFunc parameter', () => {
  expect('test').toBe('done');
});

test('Connect component: should set state when store values changed', () => {
  expect('test').toBe('done');
});
