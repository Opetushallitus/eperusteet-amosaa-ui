
import { mount, RouterLinkStub } from '@vue/test-utils';
import EpAmmatillinenArvioinninKohdealueet from './EpAmmatillinenArvioinninKohdealueet.vue';
import { globalStubs } from '@shared/utils/__tests__/stubs';

describe('EpAmmatillinenArvioinninKohdealueet', () => {

  test('Renders', async () => {
    const wrapper = mount(EpAmmatillinenArvioinninKohdealueet, {
      propsData: {
        arvioinninKohdealueet: [],
        arviointiasteikot: [],
      },
      global: {
        ...globalStubs,
      },
    });

    expect(wrapper.html()).toBeTruthy();
  });
});
