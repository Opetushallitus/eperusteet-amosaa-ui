import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import VueRouter from 'vue-router';
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import EpAmmatillinenArvioinninKohdealueet from './EpAmmatillinenArvioinninKohdealueet.vue';

Vue.use(BootstrapVue);

describe('EpAmmatillinenArvioinninKohdealueet', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  localVue.use(VueRouter);

  test('Renders', async () => {
    const wrapper = mount(EpAmmatillinenArvioinninKohdealueet, {
      localVue,
      propsData: {
        arvioinninKohdealueet: [],
        arviointiasteikot: [],
      },
      mocks: {
        $t: x => x,
        $kaanna: x => x && x.fi,
      },
      stubs: {
        PortalTarget: '<div />',
        'router-link': RouterLinkStub,
      },
    });

    expect(wrapper.html()).toBeTruthy();
  });
});
