import { ref, computed, reactive } from '@vue/composition-api';
import { mount, Wrapper, WrapperArray, createLocalVue, RouterLinkStub } from '@vue/test-utils';

import RouteRoot from '../RouteRoot.vue';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';
import '@shared/config/bootstrap';
import '@shared/config/fontawesome';

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
