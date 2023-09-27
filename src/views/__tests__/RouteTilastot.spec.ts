import { mock, mocks } from '@shared/utils/jestutils';
import { mount, createLocalVue } from '@vue/test-utils';
import { toteutussuunnitelmaTilastotMocks } from './data';
import RouteTilastot from '../RouteTilastot.vue';
import { TilastotStore } from '@/stores/TilastotStore';
import '@shared/config/bootstrap';

describe('RouteTilastot', () => {
  const localVue = createLocalVue();

  const createWrapper = () => {
    const tilastotStore = mock(TilastotStore);
    tilastotStore.state.opetussuunnitelmat = toteutussuunnitelmaTilastotMocks as any;

    return mount(RouteTilastot, {
      propsData: {
        tilastotStore,
      },
      localVue,
      mocks: {
        ...mocks,
      },
      stubs: {
        apexchart: '<div />',
      },
    });
  };

  test('Mounting', async () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('toteutussuunnitelmat 3 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 2 kpl');
  });

  test('filtered by name', async () => {
    const wrapper = createWrapper();

    wrapper.find('input[type="search"]').setValue('test2');

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
  });

  test('filtered by koulutustyyppi', async () => {
    const wrapper = createWrapper();
    wrapper.find('#koulutustyyppiFilter').find('.multiselect__option')
      .trigger('click');

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    expect(wrapper.text()).toContain('test1');
  });

  test('filtered by tila', async () => {
    const wrapper = createWrapper();
    wrapper.find('#tilaFilter').find('.multiselect__option')
      .trigger('click');

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    expect(wrapper.text()).toContain('test1');
  });

  test.skip('filtered by voimassaolo', async () => {
    const wrapper = createWrapper();
    wrapper.find('#voimassaoloFilter').find('.multiselect__option')
      .trigger('click');

    expect(wrapper.text()).toContain('toteutussuunnitelmat 2 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 2 kpl');
    expect(wrapper.text()).toContain('test2');
    expect(wrapper.text()).toContain('test3');
  });

  test('filtered by peruste', async () => {
    const wrapper = createWrapper();
    wrapper.find('#perusteFilter').find('.multiselect__option')
      .trigger('click');

    expect(wrapper.text()).toContain('toteutussuunnitelmat 2 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    expect(wrapper.text()).toContain('test1');
    expect(wrapper.text()).toContain('test2');
  });

  test('filtered by koulutustoimija', async () => {
    const wrapper = createWrapper();
    wrapper.find('#koulutustoimijaFilter').findAll('.multiselect__element')
      .at(1)
      .find('.multiselect__option')
      .trigger('click');

    expect(wrapper.text()).toContain('toteutussuunnitelmat 1 kpl');
    expect(wrapper.text()).toContain('koulutustoimijat 1 kpl');
    expect(wrapper.text()).toContain('test3');
    expect(wrapper.text()).toContain('Hesa kaupunki');
  });
});
