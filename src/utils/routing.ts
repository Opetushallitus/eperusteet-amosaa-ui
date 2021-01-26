import { NavigationNodeDto } from '@shared/tyypit';
import { Location } from 'vue-router/types/router';
import * as _ from 'lodash';

const ignoredRouteNames = [];

export function routeToNode(route: Location): NavigationNodeDto | null {
  if (!route || _.includes(ignoredRouteNames, route.name)) {
    return null;
  }

  switch (route.name) {
  case 'tekstikappale':
    return {
      type: 'viite',
      id: Number(route.params?.tekstiKappaleId!),
    };
  case 'opintokokonaisuus':
    return {
      type: 'opintokokonaisuus',
      id: Number(route.params?.sisaltoviiteId!),
    };
  default:
    console.error('Unknown route', route.name, route);
    break;
  }

  return null;
}
