import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisteredLayout from '../layout/registered/RegisteredLayout';

describe('RegisteredLayout', () => {
  const renderLayout = (ui = <div>ChildContent</div>, pageType = 'default', user = { avatar: '' }) => {
    return render(
      <MemoryRouter>
        <RegisteredLayout pageType={pageType} user={user}>
          {ui}
        </RegisteredLayout>
      </MemoryRouter>
    );
  };

  test('renders children inside main container', () => {
    renderLayout(<div>My Page</div>);
    expect(screen.getByText('My Page')).toBeInTheDocument();
  });

  test('renders Sidebar and Header (avatar present when logged in)', () => {
    renderLayout();
    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
    expect(screen.getByAltText('Search')).toBeInTheDocument();
  });
});


