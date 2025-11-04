// Import tools from the react testing library
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App'; // import your main component

// test that page header renders correctly
test('renders the Clemson Campus Events header', () => {
  render(<App />);
  const titleElement = screen.getByText(/Clemson Campus Events/i);
  expect(titleElement).toBeInTheDocument();
});

// test that the event list renders correctly
test('renders all event names from the list', () => {
  render(<App />);
  
  // checks that the concert names are rendered in
  expect(screen.getByText('Concert A')).toBeInTheDocument();
  expect(screen.getByText('Theater B')).toBeInTheDocument();
  expect(screen.getByText('Festival C')).toBeInTheDocument();
});

// test that each event displays its "Buy Ticket" button
test('each event has a Buy Ticket button', () => {
  render(<App />);

  // grabs all "Buy Ticket" buttons
  const buttons = screen.getAllByRole('button', { name: /Buy Ticket/i });
  
  // there should be atleast one button found
  expect(buttons.length).toBeGreaterThan(0);
});

// test that clicking a button triggers a change or respone
test('clicking Buy Ticket triggers button action', () => {
  render(<App />);
  
  const button = screen.getByText(/Buy Ticket for Concert A/i);

  // simulate a click event on the button
  fireEvent.click(button);

  // check that the button is still in the document after click
  expect(button).toBeInTheDocument();
});
