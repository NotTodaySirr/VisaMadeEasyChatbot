import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';

describe('Sidebar', () => {
  const renderSidebar = () => render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  test('renders search icon and toggles search input', () => {
    renderSidebar();
    const searchIcon = screen.getByAltText('Search');
    expect(searchIcon).toBeInTheDocument();
    fireEvent.click(searchIcon);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  test('shows pinned chat group by default', () => {
    renderSidebar();
    expect(screen.getByText('Đã ghim')).toBeInTheDocument();
  });

  test('filters results when typing in search', () => {
    renderSidebar();
    fireEvent.click(screen.getByAltText('Search'));
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'visa' } });
    expect(screen.getByText('Hồ sơ')).toBeInTheDocument();
    expect(screen.getByText('Đoạn chat')).toBeInTheDocument();
  });
});


