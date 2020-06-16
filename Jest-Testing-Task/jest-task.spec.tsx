import React from 'react';
import Login from './jest-task';
import { mount } from 'enzyme';

/*
//first task
describe('Login Test', () => {
  it('SnapShot Checking', () => {
    const testComponent = mount(<Login />);

    expect(testComponent).toMatchSnapshot();

    const heading = testComponent.find('h1');

    //heading.at(0).getDOMNode<HTMLHeadingElement>().innerText = ' Login Form ';
    testComponent.update();

    //expect(heading.at(0).text()).toEqual(' Login Form ');

    //heading.setProps({target:{ text : 'This is ne}w Content of heading' }});

    expect(testComponent).toMatchSnapshot();
  });
});*/

//second task
describe('Login Test', () => {
  it('Check existing tags', () => {
    const testComponent = mount(<Login />);
    const div = testComponent.find('div');
    expect(div.find('form').exists()).toBeTruthy();

    const button = testComponent.find('button');
    expect(button).toHaveLength(1);

    const input = testComponent.find('input');
    expect(input).toHaveLength(2);

    testComponent.unmount();
  });
});

//third  task
describe('Login Test', () => {
  it('Check eClicks', () => {
    const testComponent = mount(<Login />);

    const div = testComponent.find('div');
    div
      .find('input')
      .at(0)
      .simulate('blur', {
        target: {
          value: 'newName',
          name: 'email',
        },
      });
    testComponent.update();

    div
      .find('input')
      .at(1)
      .simulate('blur', {
        target: {
          value: 'abc',
          name: 'password',
        },
      });
    testComponent.update();

    div.find('button').at(0).simulate('click');
    testComponent.update();

    console.log(testComponent.find('div').at(1).find('h1').text());

    testComponent.unmount();
  });
});
