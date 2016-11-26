import { Project4Page } from './app.po';

describe('project4 App', function() {
  let page: Project4Page;

  beforeEach(() => {
    page = new Project4Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
