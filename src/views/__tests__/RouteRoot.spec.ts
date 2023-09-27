import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import RouteRoot from '../RouteRoot.vue';
import '@shared/config/bootstrap';

describe.skip('RouteRoot', () => {
  const localVue = createLocalVue();

  test('Mounting', async () => {
    const wrapper = mount(RouteRoot, {
      propsData: {
      },
      localVue,
      mocks: {
        $t: (x: any) => x,
        $kaanna: (x: any) => '[' + x?.fi + ']',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        PortalTarget: true,
        RouterView: true,
      },
    });

    expect(wrapper.html()).not.toBeFalsy();
  });
});
