import { NavigationNodeDto } from '@shared/tyypit';
import { Location } from 'vue-router/types/router';
import * as _ from 'lodash';

const ignoredRouteNames = [];

export function routeToNode(route: Location): NavigationNodeDto | null {
  if (!route || _.includes(ignoredRouteNames, route.name)) {
    return null;
  }

  switch (route.name) {
  case 'toteutussuunnitelma':
    return {
      type: 'root',
      id: Number(route.params?.toteutussuunnitelmaId!),
    };
  case 'toteutussuunnitelmantiedot':
    return {
      type: 'tiedot',
      id: Number(route.params?.toteutussuunnitelmaId!),
    };
  case 'tekstikappale':
    return {
      type: 'tekstikappale',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'opintokokonaisuus':
    return {
      type: 'opintokokonaisuus',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'koulutuksenosa':
    return {
      type: 'koulutuksenosa',
      id: Number(route.params?.sisaltoviiteId!),
    };
  case 'koulutuksenosat':
    return {
      type: 'koulutuksenosat',
    };
  default:
    console.error('Unknown route', route.name, route);
    break;
  }

  return null;
}
