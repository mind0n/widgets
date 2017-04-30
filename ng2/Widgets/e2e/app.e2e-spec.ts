import { WidgetsPage } from './app.po';

describe('widgets App', () => {
  let page: WidgetsPage;

  beforeEach(() => {
    page = new WidgetsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
